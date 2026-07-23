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

#### 3. What is HPC? Core concepts and use cases

- **Date**: 2026-08-23 (Sunday)
- **Draft**: `content/posts/hpc/01-what-is-hpc-core-concepts-and-use-cases.md`
- **Summary**: A practical introduction to high-performance computing: what makes a system high-performance, how the HPC stack is organized from hardware to application, and the landscape of use cases from climate modeling to LLM training. Opens the HPC series.

#### 4. Why HPC matters: a hands-on proof

- **Date**: 2026-09-06 (Sunday)
- **Draft**: `content/posts/hpc/02-why-hpc-matters-a-hands-on-proof.md`
- **Summary**: Parallelism is not an optimization; it is what makes entire categories of problems solvable. A real program taken through 10 incremental steps, from serial baseline to multi-node GPU cluster, with measured performance at every stage.

#### 5. Papers that transformed the computer world

- **Date**: 2026-09-20 (Sunday)
- **Draft**: `content/posts/academic/papers-that-transformed-the-compute-world.md`
- **Summary**: A curated tour of the seminal papers that shaped the computing landscape, and why each one still matters to practitioners today. Broad-appeal interlude between HPC installments.

#### 6. Why HPC is the foundation of modern AI

- **Date**: 2026-10-04 (Sunday)
- **Draft**: `content/posts/hpc/03-why-hpc-is-the-foundation-of-modern-ai.md`
- **Summary**: Why you cannot train a large model on a regular cloud instance. The answer built across three layers (compute density, memory bandwidth, interconnect latency), mapping each constraint to its HPC solution.

#### 7. EFA 101

- **Date**: 2026-10-18 (Sunday)
- **Draft**: `content/posts/hpc/04-efa-101.md`
- **Summary**: A top-down deep dive into Elastic Fabric Adapter: why low-latency fabric matters, the RDMA programming model, libfabric, OS-bypass architecture, and the MPI/NCCL layers on top; closes with production tuning and OSU benchmark validation.

#### 8. How to manage your time

- **Date**: 2026-11-01 (Sunday)
- **Draft**: `content/posts/leadership/how-to-manage-your-time.md`
- **Summary**: Practical strategies for managing your time as an engineer and leader. Leadership interlude to vary the front page mid-series.

#### 9. MPI 101

- **Date**: 2026-11-15 (Sunday)
- **Draft**: `content/posts/hpc/05-mpi-101.md`
- **Summary**: A ground-up introduction to the Message Passing Interface: the programming model, point-to-point and collective operations, communicators, and process topologies, with working code examples and a guide to running your first MPI jobs on AWS.

#### 10. NCCL 101

- **Date**: 2026-11-29 (Sunday)
- **Draft**: `content/posts/hpc/06-nccl-101.md`
- **Summary**: How NCCL implements collective operations across GPU clusters: ring and tree algorithms, NVLink vs. PCIe topologies, PyTorch and MPI integration, and a practical benchmark to validate a fresh installation.

#### 11. Securing Terraform state

- **Date**: 2026-12-13 (Sunday)
- **Draft**: `content/posts/security/securing-terraform-state.md`
- **Summary**: Terraform state files hold secrets in plaintext; this post covers securing state files and backend configuration: encryption, access control, and locking. Security interlude.

#### 12. Choosing the right filesystem for HPC

- **Date**: 2026-12-27 (Sunday)
- **Draft**: `content/posts/hpc/07-choosing-the-right-filesystem-for-hpc.md`
- **Summary**: A workload-driven comparison of HPC filesystem options (parallel filesystems, shared network filesystems, object storage tiers, local NVMe) evaluated across throughput, metadata performance, latency, cost, and operational complexity, with a decision framework by workload type.

### Backlog (continues biweekly on Sundays into 2027)

First slots of 2027:

1. 2027-01-10: `hpc/08-hpc-benchmarking-compute-network-storage.md` — HPC benchmarking: measuring compute, network, and storage performance
2. 2027-01-24: `my-projects/parallelcluster-configurations.md` — Personal Project: ParallelCluster Configurations

HPC series continuation, in order, one per slot from 2027-02-07:

1. `hpc/09-profiling-multi-node-training-nvidia-nsight.md` — Profiling multi-node training jobs with NVIDIA Nsight
2. `hpc/10-hpc-in-the-cloud-state-of-the-art.md` — HPC in the Cloud: state of the art
3. `hpc/11-hpc-on-aws-parallelcluster-vs-pcs-vs-hyperpod-vs-eks.md` — ParallelCluster vs. PCS vs. HyperPod vs. EKS
4. `hpc/12-cost-anatomy-1000-gpu-training-run-aws.md` — Cost anatomy of a 1,000-GPU training run on AWS
5. `hpc/13-slurm-101.md` — SLURM 101
6. `hpc/14-fine-tuning-slurm-for-maximum-performance.md` — Fine-tuning SLURM for maximum performance
7. `hpc/15-checkpointing-strategies-distributed-training.md` — Checkpointing strategies for distributed training
8. `hpc/16-gpu-memory-hierarchy-hbm-l2-sram.md` — GPU memory hierarchy: HBM, L2, and SRAM
9. `hpc/17-llm-serving-infrastructure-training-to-inference.md` — LLM serving infrastructure
10. `hpc/18-fine-tuning-llms-on-a-budget-lora-fsx.md` — Fine-tuning LLMs on a budget: LoRA + FSx
11. `hpc/19-ten-architectural-mistakes-ai-clusters.md` — 10 architectural mistakes in AI clusters

Standalone drafts to interleave among the HPC slots above (suggested order):

- `aws/avoid-cfn-init-pitfalls.md` — Avoid cfn-init pitfalls
- `aws/exposing-outputs-in-ssm-automations.md` — Exposing Outputs in SSM Automations
- `leadership/meetings-for-software-engineers.md` — Meetings for software engineers
- `security/stig-compliance.md` — STIG compliance
- `web-applications/authentication-in-spring.md` — JWT Authentication in Spring
- `web-applications/authorization-in-spring.md` — Authorization in Spring
- `web-applications/securing-secrets-in-spring.md` — Securing Secrets in Spring
- `web-applications/throttling-in-spring.md` — Throttling in Spring
- `web-applications/storing-uuid-in-spring.md` — Storing UUID in Spring
- `web-applications/observability-stack-for-web-applications.md` — MySQL Metrics on Grafana
- `my-projects/nameping.md` — Personal Project: NAmeping
- `my-projects/cli-wizard.md` — Personal Project: CLI Wizard
- `my-projects/markov-solver.md` — Personal Project: Markov Solver
- `my-projects/landbourse-cicd.md` — Landbourse CI/CD
- `ai/quoting-antirez-on-ai.md` — Quoting antirez on AI
