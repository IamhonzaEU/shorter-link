# 🔗 Shorter-Link

Jednoduchý, rychlý a soukromý zkracovač odkazů postavený na **Cloudflare Pages** a **Cloudflare KV** úložišti.

## 🚀 Vlastnosti

- **Veřejné vytváření odkazů:** Vlastní aliasy nebo automaticky generované krátké řetězce.
- **⏱️ Exspirace odkazů:** Možnost nastavit platnost odkazu (1 hodina až 30 dní, nebo bez omezení).
- **📊 Anonymní počítadlo kliknutí:** Sledování počtu přesměrování u každého odkazu v administraci bez ukládání IP adres.
- **📷 Generování QR kódů:** Lokální generování QR kódů přímo v prohlížeči (s možností stažení ve `.png`).
- **🔍 Administrační panel:** Zabezpečený přehled s vyhledáváním, statistikou kliknutí, úpravou odkazů a mazáním.
- **🌐 Multijazyčnost:** Snadné přepínání mezi českým a anglickým jazykem (CZ/EN).
- **🌙 Tmavý a světlý režim:** Adaptivní vzhled s uplatněním preferencí uživatele.
- **🛡️ Ochrana soukromí:** Kód i databáze fungují podle zásad *Privacy-First* – neukládají žádné osobní údaje, IP adresy ani cookies.

## 🛠️ Použité technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, `qrcode.js`
- **Backend / Routing:** Cloudflare Pages Functions (`_worker.js`)
- **Databáze:** Cloudflare KV

## 📄 Licence

Tento projekt je open-source šířený pod volnou **MIT licencí**.