# 🔗 Shorter-Link

Jednoduchý, rychlý a soukromý zkracovač odkazů postavený na **Cloudflare Pages** a **Cloudflare KV** úložišti.

## 🚀 Vlastnosti

- **Veřejné vytváření:** Kdokoliv si může na webu vytvořit vlastní zkrácený odkaz.
- **📷 Generování QR kódů:** Ke každému zkrácenému odkazu se automaticky vygeneruje QR kód přímo v prohlížeči (s možností stažení ve formátu `.png`).
- **Ochrana soukromí:** Kód i databáze fungují podle zásad *Privacy-First* – neukládají žádné osobní údaje, IP adresy ani cookies. QR kódy se generují lokálně bez odesílání dat na externí servery.
- **Administrační panel:** Zabezpečená správa odkazů (prohlížení, mazání, QR kódy) chráněná heslem uloženým v Cloudflare environmentálních proměnných.
- **Tmavý a světlý režim:** Adaptivní design pro pohodlné používání na jakémkoliv zařízení.

## 🛠️ Použité technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, `qrcode.js` (generování QR kódů lokálně v prohlížeči)
- **Backend / Routing:** Cloudflare Pages Functions (`_worker.js`)
- **Databáze:** Cloudflare KV

## ⚖️ Právní doložka & Ochrana soukromí

- **Odpovědnost:** Provozovatel nenese žádnou odpovědnost za obsah zkrácených odkazů. Veškerou odpovědnost nese uživatel, který odkaz vytvořil. Služba nesmí být využívána k šíření spamu, malware nebo nelegálního obsahu.
- **Kontakt pro nahlášení zneužití:** [report@iamhonza.eu](mailto:report@iamhonza.eu)
- **Ochrana soukromí:** Tato aplikace na úrovni kódu a databáze neukládá žádné osobní údaje, cookies ani IP adresy návštěvníků. Provoz na síťové úrovni podléhá standardním pravidlům ochrany soukromí společnosti Cloudflare.

## 📄 Licence

Tento projekt je open-source šířený pod volnou **MIT licencí**. Podrobnosti naleznete v souboru [LICENSE](LICENSE).
