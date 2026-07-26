# Roadmap

## Editorial Plan (August to December 2026)

Cadence: one post every two weeks, published on Sundays.
Scope: all current drafts are part of the plan. The period from 2026-08-02
until 2026-12-31 holds 12 slots; the remaining drafts are queued in the
backlog below and continue at the same cadence into 2027.

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

### Backlog (continues biweekly on Sundays into 2027)

1. 2027-01-10: `hpc/06-introduction-to-nccl.md` — Introduction to NCCL
2. 2027-01-24: `security/securing-terraform-state.md` — Securing Terraform state
3. 2027-02-07: `hpc/07-choosing-the-right-filesystem-for-hpc.md` — Choosing the right filesystem for HPC
4. 2027-02-21: `hpc/08-hpc-benchmarking-compute-network-storage.md` — HPC benchmarking: compute, network, and storage
5. 2027-03-07: `hpc/09-profiling-multi-node-training-nvidia-nsight.md` — Profiling multi-node training jobs with NVIDIA Nsight
6. 2027-03-21: `aws/avoid-cfn-init-pitfalls.md` — Avoid cfn-init pitfalls
7. 2027-04-04: `hpc/10-hpc-in-the-cloud-state-of-the-art.md` — HPC in the Cloud: state of the art
8. 2027-04-18: `aws/exposing-outputs-in-ssm-automations.md` — Exposing Outputs in SSM Automations
9. 2027-05-02: `hpc/11-hpc-on-aws.md` — Running HPC workloads on AWS
10. 2027-05-16: `leadership/meetings-for-software-engineers.md` — Meetings for software engineers
11. 2027-05-30: `hpc/12-cost-anatomy-1000-gpu-training-run-aws.md` — Cost anatomy of a 1,000-GPU training run on AWS
12. 2027-06-13: `security/stig-compliance.md` — STIG compliance
13. 2027-06-27: `hpc/13-introduction-to-slurm.md` — Introduction to SLURM
14. 2027-07-11: `web-applications/authentication-in-spring.md` — JWT Authentication in Spring
15. 2027-07-25: `hpc/14-fine-tuning-slurm-for-maximum-performance.md` — Fine-tuning SLURM for maximum performance
16. 2027-08-08: `web-applications/authorization-in-spring.md` — Authorization in Spring
17. 2027-08-22: `hpc/15-checkpointing-strategies-distributed-training.md` — Checkpointing strategies for distributed training
18. 2027-09-05: `web-applications/securing-secrets-in-spring.md` — Securing Secrets in Spring
19. 2027-09-19: `hpc/16-gpu-memory-hierarchy-hbm-l2-sram.md` — GPU memory hierarchy: HBM, L2, and SRAM
20. 2027-10-03: `web-applications/throttling-in-spring.md` — Throttling in Spring
21. 2027-10-17: `hpc/17-llm-serving-infrastructure-training-to-inference.md` — LLM serving infrastructure
22. 2027-10-31: `web-applications/storing-uuid-in-spring.md` — Storing UUID in Spring
23. 2027-11-14: `hpc/18-fine-tuning-llms-on-a-budget-lora-fsx.md` — Fine-tuning LLMs on a budget: LoRA + FSx
24. 2027-11-28: `web-applications/observability-stack-for-web-applications.md` — MySQL Metrics on Grafana
25. 2027-12-12: `hpc/19-ten-architectural-mistakes-ai-clusters.md` — 10 architectural mistakes in AI clusters
26. 2027-12-26: `ai/quoting-antirez-on-ai.md` — Quoting antirez on AI
