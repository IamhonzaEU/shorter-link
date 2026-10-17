export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API Pro správu odkazů
    if (path.startsWith('/api/links')) {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
      const isAdmin = env.ADMIN_PASSWORD && token === env.ADMIN_PASSWORD.trim();

      // GET: Načtení odkazů (vyžaduje admin)
      if (request.method === 'GET') {
        if (!isAdmin) return new Response('Unauthorized', { status: 403 });

        const list = await env.SHORTER_KV.list();
        const links = {};
        for (const key of list.keys) {
          const value = await env.SHORTER_KV.get(key.name);
          if (value) {
            try {
              links[key.name] = JSON.parse(value);
            } catch (e) {
              links[key.name] = { url: value, tag: 'Veřejné', clicks: 0 };
            }
          }
        }
        return new Response(JSON.stringify(links), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // POST: Vytvoření odkazu (veřejné) nebo Úprava odkazu (admin)
      if (request.method === 'POST') {
        try {
          const { alias, url: targetUrl, tag, ttl, clicks } = await request.json();
          if (!alias || !targetUrl) return new Response('Missing fields', { status: 400 });

          // Pokud se nejedná o úpravu od admina, zkontrolujeme zda alias neexistuje
          const existing = await env.SHORTER_KV.get(alias);
          if (existing && !isAdmin) {
            return new Response('Alias already exists', { status: 409 });
          }

          let existingData = {};
          if (existing) {
            try { existingData = JSON.parse(existing); } catch(e){}
          }

          const record = {
            url: targetUrl,
            tag: tag || 'Veřejné',
            clicks: typeof clicks === 'number' ? clicks : (existingData.clicks || 0),
            createdAt: existingData.createdAt || new Date().toISOString()
          };

          const options = {};
          if (ttl && parseInt(ttl) > 0) {
            options.expirationTtl = parseInt(ttl); // Čas vypršení v sekundách
          }

          await env.SHORTER_KV.put(alias, JSON.stringify(record), options);
          return new Response(JSON.stringify({ success: true, alias, record }), { status: 201 });
        } catch (e) {
          return new Response('Error saving link', { status: 500 });
        }
      }

      // DELETE: Smazání odkazu (vyžaduje admin)
      if (request.method === 'DELETE') {
        if (!isAdmin) return new Response('Unauthorized', { status: 403 });
        const aliasToDelete = url.searchParams.get('alias');
        if (!aliasToDelete) return new Response('Missing alias', { status: 400 });

        await env.SHORTER_KV.delete(aliasToDelete);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
    }

    // PŘESMĚROVÁNÍ (Redirect + Inkrementace kliknutí)
    const alias = path.substring(1);
    if (alias && !alias.includes('.')) {
      const dataStr = await env.SHORTER_KV.get(alias);
      if (dataStr) {
        let targetUrl = dataStr;
        try {
          const data = JSON.parse(dataStr);
          targetUrl = data.url;
          
          // Anonymní přičtení kliknutí
          data.clicks = (data.clicks || 0) + 1;
          await env.SHORTER_KV.put(alias, JSON.stringify(data));
        } catch (e) {
          // Zpětná kompatibilita pro staré prosté URL řetězce
          await env.SHORTER_KV.put(alias, JSON.stringify({ url: dataStr, tag: 'Veřejné', clicks: 1 }));
        }

        return Response.redirect(targetUrl, 302);
      }
    }

    // Výchozí statický obsah z Cloudflare Pages
    return env.ASSETS.fetch(request);
  }
};