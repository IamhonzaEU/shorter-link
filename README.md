# 🔗 Shrorter-Link

Jednoduchý, rychlý a soukromý zkracovač odkazů postavený na **Cloudflare Pages** a **Cloudflare KV** úložišti.

## 🚀 Vlastnosti

- **Veřejné vytváření:** Kdokoliv si může na webu vytvořit vlastní zkrácený odkaz.
- **Chráněná administrace:** Správa, přehledová tabulka a mazání odkazů jsou zabezpečené heslem přes administrátorský token (`ADMIN_PASSWORD`).
- **Ochrana soukromí:** Služba neukládá žádné osobní údaje ani IP adresy návštěvníků.
- **Bezpečnost:** Citlivé údaje ani hesla nejsou uloženy v kódu, ale jako šifrované proměnné na straně serveru v Cloudflare.
- **Tmavý a světlý režim:** Plně adaptivní design pro pohodlné používání.

## 🛠️ Použité technologie

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend / Routing:** Cloudflare Pages Functions (`_worker.js`)
- **Databáze:** Cloudflare KV

## ⚙️ Nastavení a nasazení

1. Kloneuj tento repozitář nebo jej propojte s Cloudflare Pages.
2. V administraci Cloudflare Pages nastavte v sekci **Settings -> Environment variables** proměnnou:
   - `ADMIN_PASSWORD` (zašifrovaná hodnota pro přístup do administrace).
3. Nasaďte projekt (Deploy).

## ⚖️ Právní doložka & Ochrana soukromí

- **Odpovědnost:** Provozovatel nenesete žádnou odpovědnost za obsah zkrácených odkazů. Veškerou odpovědnost nese uživatel, který odkaz vytvořil. Služba nesmí být využívána k šíření spamu, malware nebo nelegálního obsahu.
- **Kontakt pro nahlášení zneužití:** [report@iamhonza.eu](mailto:report@iamhonza.eu)
- **Ochrana soukromí:** Aplikace nesleduje uživatele a nezaznamenává IP adresy.
