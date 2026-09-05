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

## Drafting workflow

Model a post before writing prose, in three passes. This applies to new posts and to iterations on existing ones.

1. **Thesis first.** Nail the single controlling idea — the strong opening statement that frames the whole post — before anything else.
2. **Thematic sections next.** Lay out the narrative flow as an ordered list of thematic beats (a short label plus one line each), even if the post will not carry those beats as formal `##` headings. Present these beats to the user to preview the flow before expanding.
3. **Expand every section.** Only once the thesis and the beats are agreed, write each beat into prose, following the writing style below.

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
- NEVER use em dashes (" — " or " -- "). Use a semicolon followed by a space ("; ") for asides and clarifications, or restructure into two sentences.
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

> "Running a thousand GPUs for days is expensive in ways that are not always obvious from the pricing page."

> "After years of building and operating HPC clusters for AI workloads, the same mistakes appear with remarkable consistency."

### Dry humor and vivid analogies (own posts)

> "A cluster with fast GPUs and a slow network is a collection of expensive space heaters."

> "That is the sticker price. It is also the number that most cost estimates stop at. They should not."

### Precise, no-nonsense explanations (own posts)

> "The key word is 'useful.' A weather forecast that takes three days to compute is worthless."

> "NCCL works out of the box, which is both its strength and its trap."

### Brooker-style: building an argument through careful, layered reasoning

> State a cost or tradeoff plainly, then immediately explore what it means in practice. Don't just describe; reason through the implications. Use phrases like "This makes sense: ..." or "The problem is that ..." to guide the reader through your thinking.

> Acknowledge complexity honestly: "The future is harder to see than ever. But let's peer forward and see as best we can."

> Use parallel structure to frame choices: present two roads, two approaches, two outcomes; then let the reader see which one you'd pick and why.

### Steinberger-style: personal conviction and builder energy

> Let genuine enthusiasm show when writing about things you've built or believe in. Not hype; earned excitement from someone who has done the work.

> Be direct about personal motivations: "What I want is to change the world, not build a large company."

> Share the human side of engineering decisions; the tradeoffs aren't just technical, they're personal.

### Fowler-style: clarifying through precise definitions and named patterns

> Start by acknowledging that a term is overloaded or misunderstood, then offer a sharper definition. Use that definition as the foundation for the rest of the argument.

> Name the forces at play. When a tradeoff exists, give each side a label so the reader can reason about it: "internal quality vs. delivery speed" rather than vague gestures at complexity.

> Use diagrams of cause and effect in prose form; show how one decision leads to a consequence, which creates a new constraint, which demands a new decision. Make the chain of reasoning visible.

> Reframe common beliefs: "We are used to something that is 'high quality' as something that costs more. For architecture, this relationship is reversed."

> Prefer evolutionary framing; good architecture supports change over time, not just correctness at a point in time.

### Practitioner authority: speaking from experience (own posts)

> "I'm a full-cycle engineer: I design it, build it, secure it, ship it, and carry the pager for it."

> "They are not exotic. They are not the result of carelessness. They are the predictable consequence of applying general-purpose cloud thinking to a domain with very different constraints."

### What to avoid

- Em dashes (" — ", " -- ") in any form. Use semicolons or separate sentences instead.
- Marketing language, hype, or superlatives ("revolutionary", "game-changing", "best-in-class").
- Passive voice when active is clearer. Prefer "NCCL detects the topology" over "the topology is detected by NCCL".
- Rhetorical questions as section openers. State the point directly.
- Excessive caveats. Be precise about limitations without undermining every statement.
- First person plural ("we") in technical explanations. Use "you" for the reader or impersonal constructions; reserve "I" for personal experience and the about page.
- Detached, impersonal tone on opinion pieces. If you have a take, own it.
- False certainty. When something is genuinely uncertain, say so.
