export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.SHORTER_KV;

    if (path.startsWith('/api/links')) {
      if (request.method === 'GET') {
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
        return new Response(JSON.stringify(links), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'POST') {
        try {
          const data = await request.json();
          if (!data.alias || !data.url) {
            return new Response(JSON.stringify({ error: 'Chybí alias nebo URL' }), { status: 400 });
          }
          await kv.put(data.alias, JSON.stringify({ url: data.url, tag: data.tag || 'Osobní' }));
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      }

      if (request.method === 'DELETE') {
        const alias = url.searchParams.get('alias');
        if (alias) {
          await kv.delete(alias);
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
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