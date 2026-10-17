export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- API ENDPOINTY ---
    if (path === '/api/links') {
      const method = request.method;

      // 1. Zabezpečení proti zneužití (Global Cache Rate Limiting bez sledování IP)
      if (method === 'POST') {
        const cache = caches.default;
        const cacheKey = new Request('https://rate-limit.internal/global');

        let count = 0;
        try {
          const cached = await cache.match(cacheKey);
          if (cached) {
            count = parseInt(await cached.text()) || 0;
          }
        } catch (e) {}

        // Omezení např. na 10 vytvoření za 10 sekund pro celý web (nebo upravte podle potřeby)
        if (count >= 10) {
          return new Response(JSON.stringify({ 
            error: "Služba je dočasně přetížená nebo příliš vytížená. Zkuste to za chvíli." 
          }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Zápis nového počtu do cache s platností na 10 sekund
        ctx.waitUntil(cache.put(cacheKey, new Response(String(count + 1), {
          headers: { 'Cache-Control': 'max-age=10' }
        })));
      }

      // 2. Autentifikace pro administrátorské operace
      const authHeader = request.headers.get('Authorization');
      const isAdminAuthenticated = authHeader === `Bearer ${env.ADMIN_PASSWORD}`;

      // GET: Získání všech odkazů
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
          if (key.name.startsWith('rl_') || key.name.startsWith('rate_limit_')) continue;
          
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

      // POST: Vytvoření nebo úprava odkazu
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

          // Validace schématu URL (ochrana proti javascript:, data: atd.)
          let parsedUrl;
          try {
            parsedUrl = new URL(targetUrl);
          } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return new Response(JSON.stringify({ error: 'Only http and https URLs are allowed' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          const existing = await env.SHORTER_KV.get(alias);
          if (existing && !isAdminAuthenticated) {
            return new Response(JSON.stringify({ error: 'Alias already exists' }), {
              status: 409,
              headers: { 'Content-Type': 'application/json' }
            });
          }

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

      // DELETE: Smazání odkazu
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