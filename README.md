# 🔗 Shorter-Link

Moderní, rychlý a bezpečný veřejný zkracovač odkazů postavený na moderních technologiích bez nutnosti složité údržby serveru. 

Projekt klade velký důraz na **ochranu soukromí (Privacy-First)**, vysoký výkon a čistý uživatelský zážitek.

---

## 🚀 Technologie (Tech Stack)

* **Hosting & Backend:** Cloudflare Pages (Serverless Workers - `_worker.js`)
* **Databáze:** Cloudflare KV (Rychlé globální klíč-hodnota úložiště)
* **Frontend:** Vanilla JavaScript, HTML5, CSS3 (bez zbytečných těžkých frameworků)
* **QR Kódy:** `qrcode.js` (generování QR kódů přímo v prohlížeči uživatele)

---

## ✨ Klíčové vlastnosti

* **Vícejazyčné rozhraní:** Plná podpora 6 jazyků (CZ, EN, DE, ES, SK, PL) s automatickým ukládáním preference.
* **Přizpůsobení odkazů:** Možnost zvolit vlastní alias nebo nechat vygenerovat náhodnou zkratku.
* **Štítky a expirace:** Možnost rozřazení odkazů do kategorií a nastavení automatické platnosti (1 hodina až 30 dní).
* **QR kódy:** Okamžité zobrazení a stažení QR kódu pro každý vytvořený odkaz.
* **Anonymní počítadlo kliknutí:** Sleduje počet návštěv zkráceného odkazu bez ukládání osobních údajů nebo IP adres uživatelů.
* **Zabezpečená administrace:** Chráněný panel pro správu, úpravu a mazání odkazů.
* **Integrovaný Rate Limiting:** Ochrana proti spamovým útokům a botům přímo v kódu pomocí Cloudflare KV (omezení na 5 požadavků za 10 sekund z jedné IP).

---

## 📄 Ochrana soukromí & GDPR

Služba je navržena s ohledem na maximální soukromí uživatelů:
* Neshromažďují se **žádné osobní údaje ani cookies**.
* IP adresy návštěvníků se neukládají do trvalé databáze.

---

## ⚖️ Právní doložka & Kontakt

* **Provozovatel:** Osobní projekt [www.iamhonza.eu](https://www.iamhonza.eu)
* **Právní ujednání:** Provozovatel nenese žádnou odpovědnost za obsah zkrácených odkazů. Veškerou odpovědnost nese uživatel, který odkaz vytvořil. Služba nesmí být zneužívána k šíření spamu, malware či nelegálního obsahu.
* **Hlášení zneužití:** V případě problému či závadného obsahu nás neváhejte kontaktovat na e-mailu: **report@iamhonza.eu**

---

## 📜 Licencování

Tento projekt je open-source a je šířen pod licenci **MIT License**.
