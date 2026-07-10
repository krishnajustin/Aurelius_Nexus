# Aurelius Nexus

Luxury multi-page studio site — dark editorial design with champagne gold accents, GSAP motion, and adaptive WebGL.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage — hero, services, work, process, CTAs |
| `about.html` | Studio story & principles |
| `services.html` | Three service pillars + process |
| `pricing.html` | Tiers + FAQ |
| `testimonials.html` | Client carousel & quotes |
| `journey.html` | Multi-step onboarding form |
| `contact.html` | Contact details + validated form |

## Stack

- Static HTML / CSS / JS (no build step)
- **GSAP 3** + ScrollTrigger (CDN)
- **Three.js** hero/about scenes with low-power mobile fallbacks
- Fonts: Cormorant Garamond, Inter, JetBrains Mono

## Run locally

```bash
# from project root
python3 -m http.server 8080
# open http://localhost:8080
```

Or open any HTML file directly in a browser (CDN scripts need network).

## Performance & motion

- `prefers-reduced-motion` disables cinematic animation and heavy WebGL
- Mobile / low-power devices get lighter particle counts and CSS hero fallback
- Animations use `transform` / `opacity` only
- Scroll progress, preloader, magnetic CTAs (fine pointer only)

## Forms

Contact and journey flows validate client-side and show success states (demo — wire to Formspree, Netlify Forms, or your API as needed).
