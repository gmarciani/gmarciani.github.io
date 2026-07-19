---
title: "HPC in the Cloud: state of the art"
description: "An objective survey of the current HPC cloud landscape across AWS, Azure, and GCP, evaluating compute instances, networking fabric, storage, scheduling, software ecosystem, and pricing — with explicit methodology notes distinguishing tested results from sourced data."
date: 2027-03-07
draft: true
---

The HPC cloud market has matured rapidly. All three major providers offer purpose-built HPC instances, high-bandwidth networking fabrics, and managed cluster orchestration. But the differences between them are real, consequential, and poorly documented outside of vendor marketing. This article is my attempt to map the landscape honestly.

## Methodology note

This survey evaluates the HPC offerings of the three major cloud providers across six dimensions: compute instances, networking, storage, scheduling and orchestration, software ecosystem, and pricing. Where possible, observations are based on publicly available benchmarks and documentation. This is not a product endorsement — it is a map of the landscape as it exists today. Maps age quickly in this space, so treat the specifics with appropriate skepticism.

## Compute instances

All three providers offer GPU-accelerated instances built around NVIDIA's data center GPUs. The current generation features H100 and H200 GPUs with 80 GB of HBM3 memory and support for NVLink interconnects within a node.

The differentiation is in the CPU-to-GPU ratio, the number of GPUs per instance, and the memory and storage attached to each instance. Some providers offer instances with 8 GPUs per node as the standard configuration, while others provide options ranging from 1 to 8 GPUs. For tightly coupled training workloads, 8-GPU instances are strongly preferred because intra-node NVLink communication is dramatically faster than inter-node network communication.

For CPU-only HPC workloads — computational fluid dynamics, weather modeling, molecular dynamics — all three providers offer instances with high core counts, high memory bandwidth, and high-frequency processors. The relevant metrics are cores per instance, memory bandwidth per core, and sustained clock frequency under load.

## Networking

Networking is where the providers diverge most significantly — and where the choice matters most for tightly coupled workloads.

High-performance fabrics are essential for tightly coupled workloads. The key metrics are bandwidth per node, latency, and support for RDMA or OS-bypass semantics. Providers that offer dedicated HPC networking adapters with RDMA capabilities deliver meaningfully better collective operation performance than those relying on enhanced Ethernet alone.

Placement groups or equivalent mechanisms ensure that instances in the same job are physically close in the network topology, minimizing hop count and latency variance. The effectiveness of placement groups varies — some providers guarantee co-location within a single network spine, while others provide best-effort placement. The difference between guaranteed and best-effort placement is the difference between predictable performance and occasional mysterious slowdowns.

Multi-rail networking — attaching multiple network interfaces to a single instance — is increasingly common for GPU instances. This multiplies the available bandwidth and allows NCCL to use multiple channels across different physical paths. The number of network interfaces per instance and the aggregate bandwidth they provide is a critical differentiator.

## Storage

HPC storage in the cloud falls into three tiers: managed parallel filesystems, managed network filesystems, and object storage.

Managed parallel filesystem offerings based on Lustre provide the high-throughput, low-latency shared storage that HPC workloads require. The key differentiators are maximum throughput, throughput-to-capacity ratio (some offerings require provisioning large capacity to get high throughput), and integration with the compute orchestration layer.

Object storage is universally available and serves as the durable backing store for datasets and model artifacts. The differences between providers are minimal for HPC purposes — all offer high aggregate throughput for large objects.

Local NVMe storage attached to instances provides the lowest latency option. The capacity and throughput of local storage varies by instance type and is an important consideration for workloads that benefit from local caching.

## Scheduling and orchestration

Each provider offers managed services for deploying and operating HPC clusters. These services handle instance provisioning, network configuration, shared filesystem mounting, and job scheduler installation.

The maturity of these services varies considerably. Some providers offer multiple orchestration options targeting different use cases — from fully managed platforms that abstract away the cluster entirely, to lightweight tools that automate provisioning but leave operational control to the user. The right choice depends on the team's operational maturity and the degree of control required. In my experience, teams consistently overestimate how much control they need and underestimate how much operational burden that control creates.

SLURM is the dominant job scheduler across all providers. All major orchestration services either install SLURM by default or support it as a first-class option. Kubernetes-based scheduling is available as an alternative, but it is less mature for traditional HPC workloads that require gang scheduling, topology-aware placement, and tight integration with MPI launchers. Whether Kubernetes will close this gap is genuinely uncertain — the ecosystem is moving fast, but SLURM has decades of head start in the patterns that matter most for tightly coupled jobs.

## Software ecosystem

The software ecosystem includes container support, pre-built machine images, and integration with ML frameworks.

Container support is important for reproducibility and portability. All providers support running containers on HPC instances, but the degree of integration with the networking fabric and GPU drivers varies. Enroot and Pyxis (for SLURM-based clusters) and standard Kubernetes container runtimes are the common options.

Pre-built images with optimized drivers, CUDA toolkit, NCCL, and ML frameworks reduce the time from cluster provisioning to first job submission. The quality and freshness of these images varies significantly between providers. A stale image with an outdated NCCL version can cost you days of debugging — I have seen it happen more than once.

## Pricing

GPU instance pricing is broadly comparable across providers for equivalent hardware. The meaningful differences are in:

- Spot/preemptible pricing and availability. Spot instances can reduce costs by 60-70%, but availability varies by region and instance type. For fault-tolerant training workloads with good checkpointing, spot instances are the single largest cost lever. If your workload can tolerate interruptions, ignoring spot pricing is leaving money on the table.
- Committed use discounts. All providers offer discounts for 1-year and 3-year commitments. The discount percentages and flexibility (ability to change instance types) differ.
- Storage costs. Managed parallel filesystem pricing varies significantly. Some providers charge separately for throughput and capacity, while others bundle them. Understanding the total storage cost — not just the per-GB price — is essential.
- Data transfer costs. Moving data between storage and compute, or between regions, incurs transfer charges that can be significant for data-intensive workloads.

## Choosing a provider

There is no universally best provider for HPC in the cloud. The right choice depends on your specific requirements:

If your workload is tightly coupled and latency-sensitive, prioritize the provider with the best networking fabric and placement group guarantees. If your workload is embarrassingly parallel and fault-tolerant, prioritize spot instance availability and pricing. If your team is small and operational simplicity matters, prioritize the maturity of the managed orchestration services.

The cloud HPC landscape is evolving rapidly. What is true today may not be true in six months — I have watched entire product categories appear and disappear in that timeframe. Benchmark your specific workload on your shortlisted providers before committing. Vendor benchmarks are marketing. Your benchmarks are engineering.
