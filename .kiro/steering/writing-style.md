# Writing Style

Voice and tone guidelines for blog content. The target voice blends four influences:
- The author's own published posts (direct, systems-grounded, dry wit)
- [Marc Brooker](https://brooker.co.za/blog/) (thoughtful, precise, quietly opinionated, builds arguments through careful reasoning)
- [Peter Steinberger](https://steipete.me/) (personal, energetic, builder-first, conversational warmth)
- [Martin Fowler](https://martinfowler.com/architecture/) (clarifying, definition-driven, makes the abstract concrete through named patterns and precise vocabulary)

## Core Voice

Direct, confident, practitioner-first. Write as an engineer explaining to a peer, not a teacher lecturing a student. Assume the reader is technical and motivated. Respect their time.

Blend technical depth with personal conviction. Be willing to share what you think, not just what you know. The best posts feel like a conversation with someone who has done the work and formed opinions from it.

## Tone Characteristics

- Authoritative without being academic. State things plainly, as facts earned from experience.
- Opinionated. Take positions. Say what works and what doesn't. Avoid hedging with "it depends" unless you then explain what it depends on.
- Dry wit, not jokes. Humor comes from sharp observations, not punchlines.
- Grounded in real systems. Every claim should connect to something you can measure, configure, or observe.
- Thoughtful about implications. Don't stop at "how it works" — explore what it means, why it matters, and where it leads. (Brooker influence: follow the thread to its logical conclusion.)
- Clarifying. Name things precisely. When a concept is fuzzy, define it — then use that definition as a tool to reason further. Distinguish what something is from what people assume it is. (Fowler influence: "Architecture is about the important stuff. Whatever that is.")
- Personal when it counts. Use "I" to share genuine experience, decisions, and lessons learned. Let the reader see the person behind the engineering. (Steinberger influence: "I'm a builder at heart.")
- Honest about uncertainty. When the future is unclear, say so plainly rather than pretending to know. Intellectual honesty builds trust.

## Sentence Style

- Favor short, declarative sentences. Let the ideas carry the weight.
- Use em dashes for asides and emphasis — they're a signature of the voice.
- Use repetition with variation for emphasis. Parallel structure drives points home.
- Avoid filler words: "basically", "simply", "just", "actually", "really".
- Don't start paragraphs with "So," or "Now,".

## Structural Patterns

- Open with a strong, definitive statement that frames the entire article. No throat-clearing.
- Use the pattern: state the concept → explain why it matters → show how it works → give the practical takeaway.
- End sections with a concrete implication or action, not a summary.
- Close articles by connecting back to the bigger picture or pointing forward to what comes next.
- For opinion pieces: state the position early, build the case through experience and reasoning, close with conviction.

## Examples of Tone

### Strong openers that set the frame immediately (own posts):
> "High-performance computing is not a single technology — it is a discipline."

> "The network between your compute nodes is not a detail — it is often the bottleneck."

> "GPU performance is a memory problem as much as a compute problem."

> "Running a thousand GPUs for days is expensive in ways that are not always obvious from the pricing page."

> "After years of building and operating HPC clusters for AI workloads, the same mistakes appear with remarkable consistency."

### Dry humor and vivid analogies (own posts):
> "A cluster with fast GPUs and a slow network is a collection of expensive space heaters."

> "That is the sticker price. It is also the number that most cost estimates stop at. They should not."

### Precise, no-nonsense explanations (own posts):
> "The key word is 'useful.' A weather forecast that takes three days to compute is worthless."

> "NCCL works out of the box, which is both its strength and its trap."

### Brooker-style: building an argument through careful, layered reasoning:
> State a cost or tradeoff plainly, then immediately explore what it means in practice. Don't just describe — reason through the implications. Use phrases like "This makes sense: ..." or "The problem is that ..." to guide the reader through your thinking.

> Acknowledge complexity honestly: "The future is harder to see than ever. But let's peer forward and see as best we can."

> Use parallel structure to frame choices: present two roads, two approaches, two outcomes — then let the reader see which one you'd pick and why.

### Steinberger-style: personal conviction and builder energy:
> Let genuine enthusiasm show when writing about things you've built or believe in. Not hype — earned excitement from someone who has done the work.

> Be direct about personal motivations: "What I want is to change the world, not build a large company."

> Share the human side of engineering decisions — the tradeoffs aren't just technical, they're personal.

### Fowler-style: clarifying through precise definitions and named patterns:
> Start by acknowledging that a term is overloaded or misunderstood, then offer a sharper definition. Use that definition as the foundation for the rest of the argument.

> Name the forces at play. When a tradeoff exists, give each side a label so the reader can reason about it: "internal quality vs. delivery speed" rather than vague gestures at complexity.

> Use diagrams of cause and effect in prose form — show how one decision leads to a consequence, which creates a new constraint, which demands a new decision. Make the chain of reasoning visible.

> Reframe common beliefs: "We are used to something that is 'high quality' as something that costs more. For architecture, this relationship is reversed."

> Prefer evolutionary framing — good architecture supports change over time, not just correctness at a point in time.

### Practitioner authority — speaking from experience (own posts):
> "I'm a full-cycle engineer: I design it, build it, secure it, ship it, and carry the pager for it."

> "They are not exotic. They are not the result of carelessness. They are the predictable consequence of applying general-purpose cloud thinking to a domain with very different constraints."

## What to Avoid

- Marketing language, hype, or superlatives ("revolutionary", "game-changing", "best-in-class").
- Passive voice when active is clearer. Prefer "NCCL detects the topology" over "the topology is detected by NCCL".
- Rhetorical questions as section openers. State the point directly instead.
- Excessive caveats. Be precise about limitations, but don't undermine every statement with qualifiers.
- First person plural ("we") in technical explanations. Use "you" to address the reader or impersonal constructions. Reserve "I" for personal experience and the about page.
- Detached, impersonal tone on opinion pieces. If you have a take, own it.
- False certainty. When something is genuinely uncertain, say so — don't paper over it with confidence.
