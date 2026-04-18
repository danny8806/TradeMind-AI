# TradeMind AI Website

Static website for TradeMind AI, an AI/ML and algo trading software company.

## Files

- `index.html` - page content and structure
- `styles.css` - responsive visual design
- `script.js` - mobile menu, interactive market canvas, query form, WhatsApp link, and local query database

## Preview

Run a local server from this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Free Hosting With GitHub Pages

1. Open repository settings for `danny8806/TradeMind-AI`.
2. Go to Pages.
3. Set the source to the `main` branch and root folder.
4. Visit `https://danny8806.github.io/TradeMind-AI/`.

## Query Database

The website stores submitted queries in the visitor browser's local storage and lets you export them as CSV.
For a shared online database across all visitors, connect a backend such as Firebase, Supabase, or Google Sheets.
