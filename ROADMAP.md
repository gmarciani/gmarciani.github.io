# Roadmap

## Editorial Plan (August to December 2026)

Cadence: one post every two weeks, published on Sundays.
Scope: all current drafts are part of the plan. The period from 2026-08-02
until 2026-12-31 holds 12 slots; the remaining drafts are queued in the
backlog below and continue at the same cadence into 2028.

### Schedule (until 2026-12-31)

#### 1. Hello, World

- **Date**: 2026-08-02 (Sunday)
- **Draft**: `content/posts/hello-world.md`
- **Summary**: Welcome post introducing the author and the blog: HPC architecture, distributed systems, GPU clusters, cloud infrastructure, security, and the human side of engineering. Front matter date already set; flip `draft: false` on publish day.

#### 2. How this blog is built

- **Date**: 2026-08-09 (Sunday)
- **Draft**: `content/posts/how-this-blog-is-built.md`
- **Summary**: The software stack behind the blog (Hugo, Pug, SCSS, Gulp, GitHub Actions, GitHub Pages), the two-stage build pipeline, the maintenance process, and a closing live showcase of everything Hugo renders (formulas, embeds, code, custom shortcodes including ghactivity). Front matter date already set; flip `draft: false` on publish day.

#### 3. Personal Project: Markov Solver

- **Date**: 2026-08-23 (Sunday)
- **Draft**: `content/posts/my-projects/markov-solver.md`
- **Summary**: Solving discrete-time Markov chains with symbolic transition rates, graph visualization, and multiple input formats; why I built Markov Solver and how to use it. Opens a short run of personal-project posts before the HPC series.

#### 4. Personal Project: CLI Wizard

- **Date**: 2026-09-06 (Sunday)
- **Draft**: `content/posts/my-projects/cli-wizard.md`
- **Summary**: Generating modern Python CLIs from OpenAPI specifications; why I built CLI Wizard, how it works, and how to use it.

#### 5. Personal Project: ParallelCluster Configurations

- **Date**: 2026-09-20 (Sunday)
- **Draft**: `content/posts/my-projects/parallelcluster-configurations.md`
- **Summary**: A collection of representative AWS ParallelCluster configurations for real HPC clusters; a bridge from the personal projects into the HPC series.

#### 6. What is HPC?

- **Date**: 2026-10-04 (Sunday)
- **Draft**: `content/posts/hpc/01-what-is-hpc.md`
- **Summary**: A practical introduction to high-performance computing: what makes a system high-performance, how the HPC stack is organized from hardware to application, and the landscape of use cases from climate modeling to LLM training. Opens the HPC series.

#### 7. Why HPC matters: a hands-on proof

- **Date**: 2026-10-18 (Sunday)
- **Draft**: `content/posts/hpc/02-why-hpc-matters-a-hands-on-proof.md`
- **Summary**: Parallelism is not an optimization; it is what makes entire categories of problems solvable. A real program taken through 10 incremental steps, from serial baseline to multi-node GPU cluster, with measured performance at every stage.

#### 8. Papers that transformed the computer science

- **Date**: 2026-11-01 (Sunday)
- **Draft**: `content/posts/academic/papers-that-transformed-computer-science.md`
- **Summary**: A curated tour of the seminal papers that shaped the computing landscape, and why each one still matters to practitioners today. Broad-appeal interlude between HPC installments.

#### 9. Why HPC is the foundation of modern AI

- **Date**: 2026-11-15 (Sunday)
- **Draft**: `content/posts/hpc/03-why-hpc-is-the-foundation-of-modern-ai.md`
- **Summary**: Why you cannot train a large model on a regular cloud instance. The answer built across three layers (compute density, memory bandwidth, interconnect latency), mapping each constraint to its HPC solution.

#### 10. Introduction to EFA

- **Date**: 2026-11-29 (Sunday)
- **Draft**: `content/posts/hpc/04-introduction-to-efa.md`
- **Summary**: A top-down deep dive into Elastic Fabric Adapter: why low-latency fabric matters, the RDMA programming model, libfabric, OS-bypass architecture, and the MPI/NCCL layers on top; closes with production tuning and OSU benchmark validation.

#### 11. How to manage your time

- **Date**: 2026-12-13 (Sunday)
- **Draft**: `content/posts/leadership/how-to-manage-your-time.md`
- **Summary**: Practical strategies for managing your time as an engineer and leader. Leadership interlude to vary the front page mid-series.

#### 12. Introduction to MPI

- **Date**: 2026-12-27 (Sunday)
- **Draft**: `content/posts/hpc/05-introduction-to-mpi.md`
- **Summary**: A ground-up introduction to the Message Passing Interface: the programming model, point-to-point and collective operations, communicators, and process topologies, with working code examples and a guide to running your first MPI jobs on AWS.

### Backlog (continues biweekly on Sundays into 2028)

1. 2027-01-10: `hpc/06-introduction-to-nccl.md` — Introduction to NCCL
2. 2027-01-24: `security/securing-terraform-state.md` — Securing Terraform state
3. 2027-02-07: `hpc/07-choosing-the-right-filesystem-for-hpc.md` — Choosing the right filesystem for HPC
4. 2027-02-21: `hpc/20-introduction-to-spack.md` — Introduction to Spack *(draft not written)*
5. 2027-03-07: `hpc/08-hpc-benchmarking-compute-network-storage.md` — HPC benchmarking: compute, network, and storage
6. 2027-03-21: `hpc/09-profiling-multi-node-training-nvidia-nsight.md` — Profiling multi-node training jobs with NVIDIA Nsight
7. 2027-04-04: `aws/avoid-cfn-init-pitfalls.md` — Avoid cfn-init pitfalls
8. 2027-04-18: `hpc/10-hpc-in-the-cloud-state-of-the-art.md` — HPC in the Cloud: state of the art
9. 2027-05-02: `aws/exposing-outputs-in-ssm-automations.md` — Exposing Outputs in SSM Automations
10. 2027-05-16: `hpc/11-hpc-on-aws.md` — Running HPC workloads on AWS
11. 2027-05-30: `leadership/meetings-for-software-engineers.md` — Meetings for software engineers
12. 2027-06-13: `product/product-management-101.md` — Product Management 101
13. 2027-06-27: `leadership/how-to-have-great-one-on-one-meetings.md` — How to have great 1:1 meetings *(draft not written)*
14. 2027-07-11: `hpc/12-cost-anatomy-1000-gpu-training-run-aws.md` — Cost anatomy of a 1,000-GPU training run on AWS
15. 2027-07-25: `security/stig-compliance.md` — STIG compliance
16. 2027-08-08: `hpc/13-introduction-to-slurm.md` — Introduction to SLURM
17. 2027-08-22: `web-applications/authentication-in-spring.md` — JWT Authentication in Spring
18. 2027-09-05: `hpc/14-fine-tuning-slurm-for-maximum-performance.md` — Fine-tuning SLURM for maximum performance
19. 2027-09-19: `hpc/21-slurm-vs-kubernetes-for-hpc-workloads.md` — SLURM vs Kubernetes for HPC workloads *(draft not written)*
20. 2027-10-03: `web-applications/authorization-in-spring.md` — Authorization in Spring
21. 2027-10-17: `hpc/15-checkpointing-strategies-distributed-training.md` — Checkpointing strategies for distributed training
22. 2027-10-31: `web-applications/securing-secrets-in-spring.md` — Securing Secrets in Spring
23. 2027-11-14: `hpc/16-gpu-memory-hierarchy-hbm-l2-sram.md` — GPU memory hierarchy: HBM, L2, and SRAM
24. 2027-11-28: `web-applications/throttling-in-spring.md` — Throttling in Spring
25. 2027-12-12: `hpc/17-llm-serving-infrastructure-training-to-inference.md` — LLM serving infrastructure
26. 2027-12-26: `web-applications/storing-uuid-in-spring.md` — Storing UUID in Spring
27. 2028-01-09: `hpc/18-fine-tuning-llms-on-a-budget-lora-fsx.md` — Fine-tuning LLMs on a budget: LoRA + FSx
28. 2028-01-23: `web-applications/observability-stack-for-web-applications.md` — MySQL Metrics on Grafana
29. 2028-02-06: `hpc/19-ten-architectural-mistakes-ai-clusters.md` — 10 architectural mistakes in AI clusters
30. 2028-02-20: `ai/quoting-antirez-on-ai.md` — Quoting antirez on AI

### Scope notes for the new entries

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

#### Product Management 101 (backlog #12)

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

#### How to have great 1:1 meetings (backlog #13)

Placed directly after `meetings-for-software-engineers.md`, which covers
meetings in general — this one narrows to the recurring manager/report 1:1,
the meeting most often held badly or skipped entirely. What the 1:1 is for
(and what it is not: not a status update, not a substitute for the standup),
who owns the agenda, cadence and duration, how to run one when there is
nothing urgent, and how to use it for feedback, career growth, and surfacing
problems early. Should cover both sides of the table — how to run one as a
manager and how to get value from one as a report.

#### SLURM vs Kubernetes for HPC workloads (backlog #19)

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
