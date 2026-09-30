# Roadmap

## Editorial Plan (September 2026 onward)

Cadence: one post every two weeks, published on Tuesdays at 8 am ET. The publishing time
is tracked here only; the post front matter carries the date alone. The first post is
dated 2026-09-01.
Scope: all current drafts are part of the plan. The period until 2026-12-31 holds
9 slots; the remaining drafts are queued in the backlog below and continue at the
same cadence into 2028. Entries marked *(draft not written)* have a scope note at the end.

### Schedule (until 2026-12-31)

#### 1. Hello, World

- **Date**: 2026-09-01
- **Draft**: `content/posts/hello-world.md`
- **Summary**: Welcome post introducing the author and the blog: HPC architecture, distributed systems, GPU clusters, cloud infrastructure, security, and the human side of engineering.

#### 2. How this blog is built

- **Date**: 2026-09-15
- **Draft**: `content/posts/my-projects/how-this-blog-is-built/index.md`
- **Summary**: The software stack behind the blog (Hugo, Pug, SCSS, Gulp, GitHub Actions, GitHub Pages), the two-stage build pipeline, the maintenance process, and a closing live showcase of everything Hugo renders (formulas, embeds, code, custom shortcodes including ghactivity).

#### 3. Generating CLI with CLI Wizard

- **Date**: 2026-09-29
- **Draft**: `content/posts/my-projects/cli-wizard.md`
- **Summary**: What CLI Wizard does, with a dummy end-to-end example; why it exists and what it adds over a standard command generator; and an advanced example of shaping the CLI through the configuration.

#### 4. Solving Markov chains with markov-solver

- **Date**: 2026-10-13
- **Draft**: `content/posts/my-projects/markov-solver.md`
- **Summary**: Solving discrete-time Markov chains with symbolic transition rates, graph visualization, and multiple input formats; why I built Markov Solver and how to use it.

#### 5. Setting up a private Certificate Authority *(draft not written)*

- **Date**: 2026-10-27
- **Draft**: `content/posts/security/setting-up-a-private-certificate-authority.md`
- **Summary**: Setting up a two-tier certificate authority with OpenSSL, following the approach of [gmarciani-ca](https://github.com/gmarciani/gmarciani-ca): an offline root CA, an intermediate CA that signs the server certificates, and trusted TLS certificates for local development without browser warnings.
- **Category**: `categories: ["Security"]` set explicitly in the front matter; the `security/` section cascades "Software Design".

#### 6. What is HPC?

- **Date**: 2026-11-10
- **Draft**: `content/posts/hpc/01-what-is-hpc.md`
- **Summary**: A practical introduction to high-performance computing: what makes a system high-performance, how the HPC stack is organized from hardware to application, and the landscape of use cases from climate modeling to LLM training. Opens the HPC series.

#### 7. Why HPC matters: a hands-on proof

- **Date**: 2026-11-24
- **Draft**: `content/posts/hpc/02-why-hpc-matters-a-hands-on-proof.md`
- **Summary**: Parallelism is not an optimization; it is what makes entire categories of problems solvable. A real program taken through 10 incremental steps, from serial baseline to multi-node GPU cluster, with measured performance at every stage.

#### 8. Why HPC is the foundation of modern AI

- **Date**: 2026-12-08
- **Draft**: `content/posts/hpc/03-why-hpc-is-the-foundation-of-modern-ai.md`
- **Summary**: Why you cannot train a large model on a regular cloud instance. The answer built across three layers (compute density, memory bandwidth, interconnect latency), mapping each constraint to its HPC solution.

#### 9. Introduction to EFA

- **Date**: 2026-12-22
- **Draft**: `content/posts/hpc/04-introduction-to-efa.md`
- **Summary**: A top-down deep dive into Elastic Fabric Adapter: why low-latency fabric matters, the RDMA programming model, libfabric, OS-bypass architecture, and the MPI/NCCL layers on top; closes with production tuning and OSU benchmark validation.

### Backlog (continues biweekly into 2028)

1. 2027-01-05: `hpc/05-introduction-to-mpi.md` — Introduction to MPI
2. 2027-01-19: `hpc/06-introduction-to-nccl.md` — Introduction to NCCL
3. 2027-02-02: `hpc/07-choosing-the-right-filesystem-for-hpc.md` — Choosing the right filesystem for HPC
4. 2027-02-16: `hpc/20-introduction-to-spack.md` — Introduction to Spack *(draft not written)*
5. 2027-03-02: `hpc/08-hpc-benchmarking-compute-network-storage.md` — HPC benchmarking: compute, network, and storage
6. 2027-03-16: `hpc/09-profiling-multi-node-training-nvidia-nsight.md` — Profiling multi-node training jobs with NVIDIA Nsight
7. 2027-03-30: `hpc/10-hpc-in-the-cloud-state-of-the-art.md` — HPC in the Cloud: state of the art
8. 2027-04-13: `hpc/11-hpc-on-aws.md` — Running HPC workloads on AWS
9. 2027-04-27: `hpc/12-cost-anatomy-1000-gpu-training-run-aws.md` — Cost anatomy of a 1,000-GPU training run on AWS
10. 2027-05-11: `hpc/13-introduction-to-slurm.md` — Introduction to SLURM
11. 2027-05-25: `hpc/14-fine-tuning-slurm-for-maximum-performance.md` — Fine-tuning SLURM for maximum performance
12. 2027-06-08: `hpc/21-slurm-vs-kubernetes-for-hpc-workloads.md` — SLURM vs Kubernetes for HPC workloads *(draft not written)*
13. 2027-06-22: `hpc/15-checkpointing-strategies-distributed-training.md` — Checkpointing strategies for distributed training
14. 2027-07-06: `hpc/16-gpu-memory-hierarchy-hbm-l2-sram.md` — GPU memory hierarchy: HBM, L2, and SRAM
15. 2027-07-20: `hpc/17-llm-serving-infrastructure-training-to-inference.md` — LLM serving infrastructure
16. 2027-08-03: `hpc/18-fine-tuning-llms-on-a-budget-lora-fsx.md` — Fine-tuning LLMs on a budget: LoRA + FSx
17. 2027-08-17: `hpc/19-ten-architectural-mistakes-ai-clusters.md` — 10 architectural mistakes in AI clusters
18. 2027-08-31: `academic/papers-that-transformed-computer-science.md` — Papers that transformed the computer science
19. 2027-09-14: `leadership/how-to-manage-your-time.md` — How to manage your time
20. 2027-09-28: `security/securing-terraform-state.md` — Securing Terraform state
21. 2027-10-12: `aws/avoid-cfn-init-pitfalls.md` — Avoid cfn-init pitfalls
22. 2027-10-26: `aws/exposing-outputs-in-ssm-automations.md` — Exposing Outputs in SSM Automations
23. 2027-11-09: `leadership/meetings-for-software-engineers.md` — Meetings for software engineers
24. 2027-11-23: `product/product-management-101.md` — Product Management 101
25. 2027-12-07: `leadership/how-to-have-great-one-on-one-meetings.md` — How to have great 1:1 meetings *(draft not written)*
26. 2027-12-21: `security/stig-compliance.md` — STIG compliance
27. 2028-01-04: `web-applications/authentication-in-spring.md` — JWT Authentication in Spring
28. 2028-01-18: `web-applications/authorization-in-spring.md` — Authorization in Spring
29. 2028-02-01: `web-applications/securing-secrets-in-spring.md` — Securing Secrets in Spring
30. 2028-02-15: `web-applications/throttling-in-spring.md` — Throttling in Spring
31. 2028-02-29: `web-applications/storing-uuid-in-spring.md` — Storing UUID in Spring
32. 2028-03-14: `web-applications/observability-stack-for-web-applications.md` — MySQL Metrics on Grafana
33. 2028-03-28: `ai/quoting-antirez-on-ai.md` — Quoting antirez on AI

### Scope notes for the entries without a draft

#### Setting up a private Certificate Authority (schedule #5)

How to run your own two-tier certificate authority with OpenSSL, following
the approach of [gmarciani-ca](https://github.com/gmarciani/gmarciani-ca):
why the root CA stays offline and only signs the intermediate, why the
intermediate signs the server certificates, and what each `openssl.cfg`
controls (extensions, key usage, subject alternative names). Then the
practical side: issuing a certificate for a local service, bundling the
chain, and trusting the root on the machine so local HTTPS works without
browser warnings. Should cover what a private CA is good for (development,
internal services) and what it is not (anything public).

Placed right after the personal-project posts: the CA is what the
generated CLIs and the local services in those projects talk through.

#### Introduction to Spack (backlog #4)

What Spack is and the problem it solves: building a reproducible scientific
software stack when every package needs a specific compiler, MPI
implementation, and set of build flags. A short history — why it came out of
LLNL, and what the pre-Spack world looked like. Then the argument for using
it over the two alternatives practitioners actually reach for: building from
source by hand (unreproducible, undocumented, unshareable) and general-purpose
package managers or Environment Modules (no combinatorial build matrix, no
concretization, no ABI awareness). Cover the concretizer, specs and variants,
build caches, and environments, since those are what distinguish it from
`configure && make`.

Placed before the benchmarking post: you need a software stack before you can
measure one.

#### Product Management 101 (backlog #24)

Draft started as a running numbered list of concepts, to be extended over
time rather than expanded into prose. Opens the new `product/` category,
placed just before the 1:1 post so the leadership run follows it. Currently
15 entries covering the role as decision-making under uncertainty,
problem-before-solution discovery, competitive position, prioritization as
saying no, the MVP as a learning instrument, outcome metrics over vanity
metrics, and customer messaging (outcomes not features; clear, concise,
delivered with enthusiasm). Content is drawn largely from *The Product Book*
by Josh Anon and Carlos González de Villaumbrosia, credited in a closing
section.

#### How to have great 1:1 meetings (backlog #25)

Placed directly after `meetings-for-software-engineers.md`, which covers
meetings in general — this one narrows to the recurring manager/report 1:1,
the meeting most often held badly or skipped entirely. What the 1:1 is for
(and what it is not: not a status update, not a substitute for the standup),
who owns the agenda, cadence and duration, how to run one when there is
nothing urgent, and how to use it for feedback, career growth, and surfacing
problems early. Should cover both sides of the table — how to run one as a
manager and how to get value from one as a report.

#### SLURM vs Kubernetes for HPC workloads (backlog #12)

A comparison of the two control planes for submitting HPC work, placed right
after the two SLURM posts so the reader already has the scheduler vocabulary.
Contrast the scheduling models (gang scheduling and backfill vs pod-level
bin-packing), topology and placement awareness, MPI and fabric integration,
multi-tenancy and accounting, and the operational cost of each. Should end
with a decision framework rather than a verdict — tightly coupled MPI jobs and
long-running service-shaped inference workloads pull in opposite directions.

**Numbering note**: the two new posts take the next free prefixes (`20`, `21`)
rather than their position in the series, so for these two the numeric prefix
no longer matches publication order. Renumbering `08`–`19` to restore that
invariant is a separate change.
