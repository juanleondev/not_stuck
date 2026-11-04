# Juanjo — Brand Book v1

Source of truth for everything published under the personal brand: juanjodev.com, the Not Stuck newsletter, LinkedIn, X, talks and bios. When writing copy for any of them, follow this document.

Status: v1, defined 2026-11-04. Proof stories (LOCL, Viaboby) are still drafts and will be expanded with real details and metrics.

---

## 1. Foundations

| | |
|---|---|
| **Public name** | Juanjo (full name Juan José León Camilo only for formal contexts, like the CV) |
| **Domain** | juanjodev.com (notstuck.dev was never deployed) |
| **Goal (12–18 months)** | Attract clients: product builds and technical advisory |
| **Primary audience** | Founders (often non-technical) and tech leads / CTOs |
| **Secondary audience** | The developer community (credibility, talks), never the main target |
| **Paulonia** | Kept separate. It can appear in the CV as experience, not as part of the brand |

### Positioning statement

> I work hand in hand with founders to take their product from idea to real users. I get involved in the business, not just the code: I ask, measure and decide with you, so we make fewer mistakes and never get stuck.

### Archetype

**The product engineer for founders.** The closest thing to a technical co-founder you can hire. Not a ticket-taker, not a single-technology guru.

### Offer

1. **Build**: MVPs and products from 0 to 1 (mobile and web).
2. **Advise**: fractional CTO / technical advisory (architecture, stack, team, process).

### Differentiator

**Idea → product → users.** Juanjo has gone through the whole cycle, including distribution, which most engineers never touch. Having someone who understands the full journey means fewer wrong turns. "I don't build for the sake of building."

### Not stuck

"Not stuck" is Juanjo's philosophy, not the brand name: **always moving forward**. For clients it becomes the brand promise, **momentum**: there is always a clear next step and a calm person pushing it. It names the newsletter (*Not Stuck*) and can close posts, talks and the site footer.

---

## 2. Brand pillars

1. **Ownership**: I treat your product as if it were mine. You don't need to herd me or draw me the path.
2. **Curiosity with data**: I ask a lot of questions, look at the numbers and study the competition before deciding.
3. **Pragmatism**: I build what moves the business, not what looks good on a CV.
4. **Momentum**: there is always a next step. Incremental, backward-compatible progress beats big rewrites.

### Anti-brand (what Juanjo is not)

- A developer who waits for tickets and needs to be told what to do.
- A technology guru whose only value is deep knowledge of one framework. Flutter expertise (speaker, deep framework knowledge) is a **credential**, not the identity. Flutter is *how*, not *who*.
- A LinkedIn guru, an AI hype seller, or "the cheap dev".

---

## 3. Proof stories (drafts)

Use these as the main evidence in the site, posts and sales conversations. Details and metrics pending.

### LOCL: changing the engine mid-flight

- Inherited a project with heavy technical debt and a stack that didn't fit the product.
- Identified a problem the product would hit in the future and started fixing the weaknesses **while still shipping features**.
- Every change was incremental and backward compatible.
- **Shows**: calm, technical judgment, long-term thinking. **Best for**: CTOs and the *Advise* offer.

### Viaboby: from idea to trending

- First project of Juanjo's career: started from a problem and designed the solution.
- Used image recognition at a time when it wasn't trivial.
- Drove distribution himself, through social media and partnerships with local shelters.
- The app went viral and trending; many people in Peru knew it.
- It opened his mind beyond the technical side.
- **Shows**: product and business mindset, end-to-end execution. **Best for**: founders and the *Build* offer.

---

## 4. Personality and voice

**Personality**: direct and pragmatic, calm and reliable. The feeling a client should have: *"with him, this moves forward and there's no drama."*

**Voice in one line**: a technical partner having coffee with a founder: direct, calm, no unnecessary jargon.

| Do | Don't |
|---|---|
| First person, short sentences | Long, academic paragraphs |
| One clear opinion per piece | "It depends…" without taking a stance |
| Business language: users, time, risk, cost | Gratuitous jargon (if needed, explain it in one line) |
| Real stories (LOCL, Viaboby, clients) | Generic guru advice ("10 habits of…") |
| Calm, even when talking about problems | Alarmism and hype ("AI changes EVERYTHING!") |
| Questions that make founders think | A hard sell in every post |
| An occasional personal touch | Private life as the main topic |

**Brand words**: ship, momentum, users, first question, trade-off, next step, not stuck.
**Avoid**: rockstar, ninja, disruptive, game-changer, synergy.

**Reference sample**

> Most MVPs don't fail because of bad code.
> They fail because nobody asked "who is this for?" before writing it.
>
> That's the first question I ask a founder.
> The code comes after.

### Languages

Everything is published in **both English and Spanish**. Rule: **adapt, don't translate**. Write the idea once, then rewrite it naturally in the other language. Spanish uses *tú* and neutral Latin American Spanish.

---

## 5. Content

### Channels and cadence

| Channel | Cadence | Role |
|---|---|---|
| LinkedIn | 2–3 posts / week | Main client channel (founders, CTOs) |
| X | 2–3 posts / week | Short ideas, building in public, conversation with builders |
| Blog + **Not Stuck** newsletter | 1 issue every 2 weeks | Deep, owned content on juanjodev.com |

### Content pillars

| Pillar | Topics | Audience | Mix |
|---|---|---|---|
| **Founder decisions** | What to ask before building, when to build an MVP, no-code vs code, choosing a stack without being technical | Founders | 70% (pillars 1–3) |
| **Building without getting stuck** | Technical debt, incremental migrations, shipping while fixing (LOCL) | CTOs | |
| **Beyond the code** | Distribution, metrics, competitor analysis (Viaboby) | Founders | |
| **Behind the build** | What Juanjo is building now, tools, pragmatic AI, building in public | Everyone | 20% |
| **Not stuck** | Personal reflections on moving forward, learning and deciding | Everyone | 10% |

---

## 6. Visual identity: Direction A, Terracotta

Feeling: calm and grounded, close, human and reliable. Minimal and warm.

### Color

| Token | Light | Dark | Use |
|---|---|---|---|
| Background | `#FAF7F2` | `#1A1714` | Page and post background |
| Surface | `#F2EDE4` | `#24201C` | Cards, social templates |
| Line | `#E6DED2` | `#36302A` | Borders, dividers |
| Text | `#1F1B16` | `#F2ECE4` | Headlines and body |
| Accent | `#C65D3B` | `#E07A55` | One highlighted word, primary button, wordmark dot |
| Secondary | `#8A7F72` | `#A39889` | Captions, metadata |

The accent is used sparingly: one word per headline, the primary button, the wordmark dot. Never large accent backgrounds.

```css
:root {
  --bg: #FAF7F2; --surface: #F2EDE4; --line: #E6DED2;
  --fg: #1F1B16; --accent: #C65D3B; --muted: #8A7F72;
}
/* dark */
--bg: #1A1714; --surface: #24201C; --line: #36302A;
--fg: #F2ECE4; --accent: #E07A55; --muted: #A39889;
```

### Typography

- **Display**: Fraunces, weight 600, slight negative tracking (-0.01em). Headlines, wordmark, quotes in social templates.
- **Body / UI**: Inter, 400–600.
- Running text around 65 characters wide.

### Wordmark

Lowercase **`juanjo.`** in Fraunces 600, with the period in the accent color. The dot is the period that closes a decision and signals the next step. The newsletter follows the same pattern: **`Not Stuck.`**

### Photography

A real portrait: natural light, looking at the camera, neutral background. No stock images, no illustrated avatars. Use the same photo across all profiles.

### Social templates

Large Fraunces text on the surface color, one word in the accent, the `juanjo.` wordmark bottom left and `juanjodev.com` bottom right. Recognizable in the feed before anyone reads the name.

Visual reference: https://claude.ai/artifact/VdCAMB7yAUC64JnYcaUuHB (direction A).

### Caveat

Warm cream with a terracotta accent is a fairly common look. The personality has to come from the wordmark, the real photo and the voice, not from the palette alone.

---

## 7. Copy kit

### Taglines

- *I build products with founders, from idea to real users.* (primary)
- *Ship it. Keep moving.* (short, for social and talks)
- ES: *Construyo productos contigo, de la idea a los usuarios.*

### Website hero (EN)

> **Product engineer for founders**
> I build products with founders, from idea to real users.
> I get involved in the business, not just the code. I ask, measure and decide with you, so we make fewer mistakes and never get stuck.
> [Book a call] [See my work]

### Bios

**LinkedIn headline**
- EN: Product engineer for founders · I take products from idea to real users · MVPs & fractional CTO
- ES: Ingeniero de producto para founders · Llevo productos de la idea a usuarios reales · MVPs y CTO fraccional

**Short bio (X, talks, ~160 characters)**
- EN: I build products with founders, from idea to real users. MVPs & fractional CTO. Writing Not Stuck. juanjodev.com
- ES: Construyo productos con founders, de la idea a usuarios reales. MVPs y CTO fraccional. Escribo Not Stuck. juanjodev.com

**Long bio (about page, speaker intro)**
- EN: Juanjo is a product engineer who works hand in hand with founders to take their products from idea to real users. He has been through the whole cycle, from ideation and implementation to distribution: his first app, Viaboby, became a trending app in Peru. Today he builds MVPs and works as a fractional CTO, getting involved in the business and not just the code. He is also a Flutter speaker and writes *Not Stuck*, a newsletter about building products without getting stuck.
- ES: Juanjo es un ingeniero de producto que trabaja mano a mano con founders para llevar sus productos de la idea a usuarios reales. Ha recorrido el ciclo completo, desde la ideación y la implementación hasta la distribución: su primera app, Viaboby, llegó a ser tendencia en Perú. Hoy construye MVPs y trabaja como CTO fraccional, involucrándose en el negocio y no solo en el código. También es speaker de Flutter y escribe *Not Stuck*, una newsletter sobre cómo construir productos sin estancarse.

---

## 8. Pending

- Expand LOCL and Viaboby with real details, dates and metrics.
- A contact or booking link for the "Book a call" and "Contact" CTAs (they point to LinkedIn for now).
- Favicon and default social share image.
- Social post templates (LinkedIn/X image format).
