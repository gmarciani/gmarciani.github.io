# CLAUDE.md — content authoring

Guidance for creating and editing blog posts under `content/`. (Build/architecture guidance is in the root `CLAUDE.md`.)

## Product context

Personal technical blog for Giacomo Marciani. It covers HPC, distributed systems, cloud infrastructure, security, web applications, leadership, and personal projects — long-form technical posts and short "quotings" aimed at engineers. The style is direct, opinionated, and practitioner-first.

## Structure & front matter

- Posts live in `content/posts/{category}/`. Each category's `_index.md` sets the category taxonomy via Hugo `cascade`.
- HPC series posts use a two-digit numeric prefix: `01-topic-slug.md`, `02-topic-slug.md`, …
- New posts default to `draft: true` (`archetypes/default.md`). **Drafts are excluded from `make prod`**, so a draft also stays out of the sitemap and `/llms.txt` until published.
- Cross-references use the `{{< ref "posts/....md" >}}` shortcode.
- Front matter fields: `title`, `description` (drives the meta description, Open Graph, Twitter card, JSON-LD, and llms.txt — keep under ~160 chars and make it compelling), `date` (`YYYY-MM-DD`), `draft` (boolean), and optionally `categories`, `tags`, `image` (custom 1200×630 social image; otherwise one is auto-generated).

## Post types

**Standard posts** — long-form technical articles, the default for all categories.

**Quoting posts** — short posts highlighting a quote from an external source. A quoting post belongs to the category of its **topic**, not to a "quoting" category (a quote about AI goes in `content/posts/ai/`, about HPC in `content/posts/hpc/`, etc.).

When asked to quote a source URL, create:
- **Title**: `"Quoting {author} on {topic}"`
- **Slug**: `quoting-{author}-on-{topic}.md` (lowercase, hyphenated)
- **Location**: `content/posts/{category}/` matching the topic
- **Front matter**: `title`, `date`, `draft: false`
- **Body**: the quote as a Markdown blockquote, then an attribution line: `— {author}, [{source title}]({source URL})`

```markdown
---
title: "Quoting antirez on AI"
date: 2026-04-27
draft: false
---

> Quoted text here.

— antirez, [Don't fall into the anti-AI hype](http://antirez.com/news/153)
```

## Writing style

The target voice blends four influences:
- The author's own published posts (direct, systems-grounded, dry wit)
- [Marc Brooker](https://brooker.co.za/blog/) (thoughtful, precise, quietly opinionated; builds arguments through careful reasoning)
- [Peter Steinberger](https://steipete.me/) (personal, energetic, builder-first, conversational warmth)
- [Martin Fowler](https://martinfowler.com/architecture/) (clarifying, definition-driven; makes the abstract concrete through named patterns and precise vocabulary)

### Core voice

Direct, confident, practitioner-first. Write as an engineer explaining to a peer, not a teacher lecturing a student. Assume the reader is technical and motivated. Respect their time. Blend technical depth with personal conviction — share what you think, not just what you know. The best posts feel like a conversation with someone who has done the work and formed opinions from it.

### Tone

- Authoritative without being academic. State things plainly, as facts earned from experience.
- Opinionated. Take positions. Say what works and what doesn't. Avoid hedging with "it depends" unless you then explain what it depends on.
- Dry wit, not jokes. Humor comes from sharp observations, not punchlines.
- Grounded in real systems. Every claim should connect to something you can measure, configure, or observe.
- Thoughtful about implications — don't stop at "how it works"; explore what it means and where it leads (Brooker: follow the thread to its conclusion).
- Clarifying. Name things precisely. When a concept is fuzzy, define it, then use that definition to reason further (Fowler).
- Personal when it counts. Use "I" for genuine experience, decisions, and lessons learned (Steinberger).
- Honest about uncertainty. When the future is unclear, say so plainly rather than faking confidence.

### Sentence style

- Favor short, declarative sentences. Let the ideas carry the weight.
- Use em dashes for asides and emphasis — a signature of the voice.
- Use repetition with variation; parallel structure drives points home.
- Avoid filler: "basically", "simply", "just", "actually", "really".
- Don't start paragraphs with "So," or "Now,".

### Structure

- Open with a strong, definitive statement that frames the whole article. No throat-clearing.
- Pattern: state the concept → explain why it matters → show how it works → give the practical takeaway.
- End sections with a concrete implication or action, not a summary.
- Close by connecting back to the bigger picture or pointing forward to what comes next.
- For opinion pieces: state the position early, build the case through experience and reasoning, close with conviction.

### Strong openers (from the author's own posts)

> "High-performance computing is not a single technology — it is a discipline."

> "The network between your compute nodes is not a detail — it is often the bottleneck."

> "GPU performance is a memory problem as much as a compute problem."

> "A cluster with fast GPUs and a slow network is a collection of expensive space heaters."

### What to avoid

- Marketing language, hype, or superlatives ("revolutionary", "game-changing", "best-in-class").
- Passive voice when active is clearer. Prefer "NCCL detects the topology" over "the topology is detected by NCCL".
- Rhetorical questions as section openers. State the point directly.
- Excessive caveats. Be precise about limitations without undermining every statement.
- First person plural ("we") in technical explanations. Use "you" for the reader or impersonal constructions; reserve "I" for personal experience and the about page.
- Detached, impersonal tone on opinion pieces. If you have a take, own it.
- False certainty. When something is genuinely uncertain, say so.
