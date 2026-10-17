export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- API ENDPOINTY ---
    if (path === '/api/links') {
      const method = request.method;

      // 1. Zabezpečení proti zneužití (Rate Limiting pro POST požadavky na tvorbu odkazů)
      if (method === 'POST') {
        const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rateLimitKey = `rate_limit_${clientIp}`;

        try {
          const recentRequests = await env.SHORTER_KV.get(rateLimitKey);
          if (recentRequests && parseInt(recentRequests) >= 5) {
            return new Response(JSON.stringify({ error: "Příliš mnoho požadavků. Zkuste to prosím za chvíli." }), {
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          // Zaznamenání požadavku s platností TTL na 10 sekund
          const currentCount = recentRequests ? parseInt(recentRequests) + 1 : 1;
          await env.SHORTER_KV.put(rateLimitKey, currentCount.toString(), { expirationTtl: 10 });
        } catch (e) {
          // Pokud by selhalo KV, nezastavujeme provoz, ale pokračujeme dál
          console.error("Rate limit error:", e);
        }
      }

      // 2. Autentifikace pro administrátorské operace
      const authHeader = request.headers.get('Authorization');
      const isAdminAuthenticated = authHeader === `Bearer ${env.ADMIN_PASSWORD}`;

      // GET: Získání všech odkazů (vyžaduje admin heslo)
      if (method === 'GET') {
        if (!isAdminAuthenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const list = await env.SHORTER_KV.list();
        const links = {};
        for (const key of list.keys) {
          // Ignorujeme interní klíče jako rate-limity
          if (key.name.startsWith('rate_limit_')) continue;
          
          const val = await env.SHORTER_KV.get(key.name);
          try {
            links[key.name] = JSON.parse(val);
          } catch (e) {
            links[key.name] = { url: val, clicks: 0, tag: 'Veřejné' };
          }
        }
        return new Response(JSON.stringify(links), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // POST: Vytvoření nebo úprava odkazu (veřejné s rate-limitem, nebo admin)
      if (method === 'POST') {
        try {
          const body = await request.json();
          const { alias, url: targetUrl, tag, ttl } = body;

          if (!alias || !targetUrl) {
            return new Response(JSON.stringify({ error: 'Missing alias or url' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Kontrola existence při vytváření nového odkazu (pokud nejde o admin úpravu)
          const existing = await env.SHORTER_KV.get(alias);
          if (existing && !isAdminAuthenticated) {
            return new Response(JSON.stringify({ error: 'Alias already exists' }), {
              status: 409,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Zachování počtu kliknutí při editaci
          let clicks = 0;
          if (existing) {
            try {
              const parsedExisting = JSON.parse(existing);
              clicks = parsedExisting.clicks || 0;
            } catch (e) {}
          }

          const linkData = {
            url: targetUrl,
            tag: tag || 'Veřejné',
            clicks: clicks
          };

          // Uložení do KV s volitelnou expirací (TTL v sekundách)
          const putOptions = {};
          if (ttl && parseInt(ttl) > 0) {
            putOptions.expirationTtl = parseInt(ttl);
          }

          await env.SHORTER_KV.put(alias, JSON.stringify(linkData), putOptions);

          return new Response(JSON.stringify({ success: true, alias }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Invalid JSON request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // DELETE: Smazání odkazu (vyžaduje admin heslo)
      if (method === 'DELETE') {
        if (!isAdminAuthenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const alias = url.searchParams.get('alias');
        if (!alias) {
          return new Response(JSON.stringify({ error: 'Missing alias' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        await env.SHORTER_KV.delete(alias);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // --- PŘESMĚROVÁNÍ KLASICKÝCH ODKAZŮ ---
    const alias = path.substring(1);
    if (alias && !path.startsWith('/assets/')) {
      const dataStr = await env.SHORTER_KV.get(alias);
      if (dataStr) {
        let targetUrl = dataStr;
        let clicks = 0;

        try {
          const parsed = JSON.parse(dataStr);
          targetUrl = parsed.url;
          clicks = (parsed.clicks || 0) + 1;
          parsed.clicks = clicks;
          
          // Asynchronní aktualizace počítadla kliknutí na pozadí
          ctx.waitUntil(env.SHORTER_KV.put(alias, JSON.stringify(parsed)));
        } catch (e) {
          // Zpětná kompatibilita pro staré čisté URL řetězce v KV
          ctx.waitUntil(env.SHORTER_KV.put(alias, JSON.stringify({ url: targetUrl, clicks: 1, tag: 'Veřejné' })));
        }

        return Response.redirect(targetUrl, 302);
      }
    }

    // Výchozí akce – pokud požadavek neodpovídá API ani zkrácenému odkazu,
    // Cloudflare Pages automaticky obslouží statické soubory (index.html apod.)
    return env.ASSETS.fetch(request);
  }
};