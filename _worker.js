export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.SHORTER_KV;
    const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

    if (path.startsWith('/api/links')) {
      const authHeader = request.headers.get('Authorization');
      const isAuthed = ADMIN_PASSWORD && authHeader === `Bearer ${ADMIN_PASSWORD}`;

      if (request.method === 'GET') {
        if (!isAuthed) {
          return new Response(JSON.stringify({ error: 'Přístup odepřen.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        try {
          const list = await kv.list();
          const links = {};
          for (const key of list.keys) {
            const val = await kv.get(key.name);
            try {
              links[key.name] = JSON.parse(val);
            } catch {
              links[key.name] = { url: val, tag: 'Osobní' };
            }
          }
          return new Response(JSON.stringify(links), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }

      if (request.method === 'POST') {
        try {
          const data = await request.json();
          if (!data.alias || !data.url) {
            return new Response(JSON.stringify({ error: 'Chybí alias nebo URL' }), { status: 400 });
          }

          const existing = await kv.get(data.alias);
          if (existing && !data.overwrite) {
            return new Response(JSON.stringify({ error: 'Tento alias je již obsazený!' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
          }

          await kv.put(data.alias, JSON.stringify({ url: data.url, tag: data.tag || 'Veřejné' }));
          return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }

      if (request.method === 'DELETE') {
        if (!isAuthed) {
          return new Response(JSON.stringify({ error: 'Přístup odepřen.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
        const alias = url.searchParams.get('alias');
        if (alias) {
          await kv.delete(alias);
        }
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (path === '/' || path === '') {
      return env.ASSETS.fetch(request);
    }

    const alias = path.slice(1);
    const storedData = await kv.get(alias);

    if (storedData) {
      let targetUrl = storedData;
      try {
        const parsed = JSON.parse(storedData);
        targetUrl = parsed.url;
      } catch {}
      return Response.redirect(targetUrl, 301);
    }

    return env.ASSETS.fetch(request);
  }
};