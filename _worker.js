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

          // Validace schématu URL (ochrana proti javascript:, data: a jiným nebezpečným schématům)
          let parsedUrl;
          try {
            parsedUrl = new URL(targetUrl);
          } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // Povolení výhradně standardních webových protokolů http a https
          if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return new Response(JSON.stringify({ error: 'Only http and https URLs are allowed' }), {
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
          
          ctx.waitUntil(env.SHORTER_KV.put(alias, JSON.stringify(parsed)));
        } catch (e) {
          ctx.waitUntil(env.SHORTER_KV.put(alias, JSON.stringify({ url: targetUrl, clicks: 1, tag: 'Veřejné' })));
        }

        return Response.redirect(targetUrl, 302);
      }
    }

    return env.ASSETS.fetch(request);
  }
};