# TradeMind AI — Test Plan (PR #1)

**Deployed URL:** https://trademind-ai-xniwrofd.devinapps.com
**PR:** https://github.com/danny8806/TradeMind-AI/pull/1

## What changed (user-visible)
- Phone number updated to **+91 88061 60767** in all links + display
- Founder **Dnyaneshwar Jadhav** surfaced in title, hero, dedicated founder band, contact card, footer
- Interactive additions: live market ticker, scroll-progress bar, theme toggle (persisted), rotating hero headline, scroll-reveal fade-ins, animated stat counters, button ripple, floating WhatsApp bubble, toast notifications, live form validation

## Primary end-to-end flow (one recording)

### T1 — Hero & founder content
- **Action:** Load the home page.
- **Pass:** Hero headline contains the word "Intelligent Algo" (or one of the rotating alternates) AND the hero copy text contains the exact string "founded by Dnyaneshwar Jadhav". Founder band (below intro band) shows **"Dnyaneshwar Jadhav"** heading and a button labeled **"Call 8806160767"**.
- **Fail:** Either the founder name or the number does not appear.
- Evidence: full-page screenshot.

### T2 — Phone number `tel:` link
- **Action:** Hover the "Call Dnyaneshwar Jadhav" card in the Contact section.
- **Pass:** Browser status bar shows `tel:+918806160767`. Visible display text reads `+91 88061 60767`.
- **Fail:** Any other digits (old number `880616076`) appear.
- Evidence: screenshot with hover/link address visible, and browser console `document.querySelector('a[href^="tel:"]').href` returning `tel:+918806160767`.

### T3 — WhatsApp `wa.me` link
- **Action:** Hover the "Message Dnyaneshwar" card.
- **Pass:** Status bar / href = `https://wa.me/918806160767?...`
- **Fail:** Any URL containing `/91880616076?` or no trailing `7`.
- Evidence: screenshot + console check on `a[href*="wa.me"]` hrefs — all must contain `918806160767`.

### T4 — Theme toggle persistence
- **Action:** Click the ☾ button in the header. Then reload the page.
- **Pass (before reload):** `<html data-theme>` equals `"dark"`, body background darkens to near-black (`#0b1016` area), icon becomes ☀.
- **Pass (after reload):** Page loads directly in dark mode (icon still ☀).
- **Fail:** Theme does not change, or is lost on reload.
- Evidence: screenshots of light, dark, and post-reload dark state.

### T5 — Form validation (adversarial)
- **Action:** Scroll to the Project Query form. Type "X" into Phone, leave Name blank, click **Send Query**.
- **Pass:**
  - Phone input gets a red border (class `is-invalid`).
  - Name input gets a red border.
  - A green toast at the bottom center shows text **"Please fill required fields correctly."**
  - The browser does NOT navigate to a `mailto:` URL (URL bar stays on `/`, no email client prompt triggered).
- **Fail:** Any of the above does not occur, or the page tries to open mail.
- Evidence: screenshot of red borders + toast, and URL bar unchanged.

### T6 — Counters animate to final values
- **Action:** Scroll the hero stats into view.
- **Pass:** The three `<strong data-counter>` elements end on exactly `120+`, `45+`, and `99%` (no longer `0`).
- **Fail:** Any counter stays at `0` or shows a different number.
- Evidence: screenshot after animation settles.

### T7 — Live market ticker (what proves the feature works)
- **Action:** Observe the top ticker bar for ~5 seconds.
- **Pass:** Track contains the string `NIFTY 50` AND visibly scrolls leftward. After ~4s the numeric values change (re-rendered). Arrows `▲` or `▼` render in green/red.
- **Fail:** No ticker visible, static content that never updates, or only one symbol.
- Evidence: two screenshots ~4s apart showing different price values.

## Assertions summary table

| # | Assertion | Expected |
|---|-----------|----------|
| T1 | Founder name in hero | "Dnyaneshwar Jadhav" present |
| T1 | Founder band CTA | "Call 8806160767" button |
| T2 | Contact tel href | `tel:+918806160767` |
| T3 | All `wa.me` links | contain `918806160767` |
| T4 | Theme toggle | html[data-theme=dark] after click; persists on reload |
| T5 | Invalid submit toast | "Please fill required fields correctly." |
| T5 | Invalid submit mailto | does NOT trigger |
| T6 | Counter targets | 120+ / 45+ / 99% |
| T7 | Ticker | contains "NIFTY 50", animates, values change |

## Out of scope (documented, not tested)
- Mobile (≤720px) layout — regression surface only.
- Button ripple visual — cosmetic.
- Smooth scroll offset compensation — cosmetic.
- Actual email delivery via `mailto:` handler (depends on client OS, not app behavior).
