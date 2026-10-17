# 🔗 Shorter-Link

Jednoduchý, rychlý a soukromý zkracovač odkazů postavený na **Cloudflare Pages** a **Cloudflare KV** úložišti.

## 🚀 Vlastnosti

- **Veřejné vytváření odkazů:** Vlastní aliasy nebo automaticky generované unikátní řetězce.
- **🌐 Podpora 6 jazyků (i18n):** Snadný výběr jazyka pomocí rozbalovacího menu (🇨🇿 Čeština, 🇬🇧 Angličtina, 🇩🇪 Němčina, 🇪🇸 Španělština, 🇸🇰 Slovenština, 🇵🇱 Polština).
- **⏱️ Exspirace odkazů:** Možnost nastavit časovou platnost odkazu (1 hodina, 24 hodin, 7 dní, 30 dní nebo bez omezení).
- **📊 Anonymní počítadlo kliknutí:** Sledování celkového počtu přesměrování u každého odkazu přímo v administraci (bez ukládání jakýchkoliv IP adres či osobních údajů).
- **📷 Generování QR kódů:** Lokální generování QR kódů přímo v prohlížeči (při vytvoření i v administraci) s možností okamžitého stažení ve formátu `.png`.
- **🔍 Administrační panel:** Zabezpečený přehled s vyhledáváním, statistikami kliknutí, možností úpravy existujících odkazů a mazáním.
- **🌙 Tmavý a světlý režim:** Přepínatelný adaptivní design s pamětí zvoleného motivu.
- **🛡️ Ochrana soukromí:** Kód i databáze fungují podle striktních zásad *Privacy-First* – neukládají žádné osobní údaje, cookies ani IP adresy návštěvníků.

## 🛠️ Použité technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, `qrcode.js` (generování QR kódů přímo v prohlížeči)
- **Backend / Routing:** Cloudflare Pages Functions (`_worker.js`)
- **Databáze:** Cloudflare KV

## ⚖️ Právní doložka & Ochrana soukromí

- **Odpovědnost:** Provozovatel nenese žádnou odpovědnost za obsah zkrácených odkazů. Veškerou odpovědnost nese uživatel, který odkaz vytvořil. Služba nesmí být využívána k šíření spamu, malware nebo nelegálního obsahu.
- **Kontakt pro nahlášení zneužití:** [report@iamhonza.eu](mailto:report@iamhonza.eu)
- **Ochrana soukromí:** Tato aplikace na úrovni kódu a databáze neukládá žádné osobní údaje, cookies ani IP adresy návštěvníků. Provoz na síťové úrovni podléhá standardním pravidlům ochrany soukromí společnosti Cloudflare.

## 📄 Licence

Tento projekt je open-source šířený pod volnou **MIT licencí**. Podrobnosti naleznete v souboru [LICENSE](LICENSE).