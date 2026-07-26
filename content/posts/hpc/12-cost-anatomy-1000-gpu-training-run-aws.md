---
title: "Cost anatomy of a 1,000-GPU training run on AWS"
description: "A bottom-up breakdown of every cost component in a large-scale training job: instance hours, storage I/O, data transfer, and idle time from failures and restarts. Includes an adaptable cost model and identifies the three levers with the highest impact on total spend."
date: 2027-05-30
draft: true
---

Running a thousand GPUs for days is expensive in ways that are not always obvious from the pricing page. Instance hours are only the beginning. This article builds a complete cost model from first principles and shows where the real money goes — and where to find it again.

## The baseline scenario

Consider a concrete training run: 1,000 GPUs (125 eight-GPU instances), running for 14 days to train a large language model. I will build the cost model component by component, using representative pricing to illustrate the relative magnitudes. The exact numbers will vary by instance type, region, and pricing model — the structure of the cost breakdown is what matters.

## Component 1: instance hours

This is the obvious cost and typically the largest. At on-demand pricing, GPU instances cost between $20 and $40 per hour depending on the generation and configuration. For 125 instances running 14 days continuously:

125 instances × 336 hours × $32/hour = $1,344,000

That is the sticker price. It is also the number that most cost estimates stop at. They should not.

## Component 2: storage

Training data must be stored on a filesystem that can deliver sufficient throughput to keep 1,000 GPUs fed. A managed parallel filesystem provisioned for high throughput is not cheap.

A Lustre filesystem provisioned at 1 TB capacity with high throughput might cost $0.14 per GB per month for persistent storage, plus additional charges for throughput provisioning. For a training run that needs 100 GB/s of aggregate read throughput, the storage cost over 14 days can reach $15,000 to $40,000 depending on the configuration.

Checkpoint storage adds to this. If you checkpoint every 30 minutes and each checkpoint is 500 GB (model state, optimizer state, and RNG state for a large model), you are writing 672 checkpoints over 14 days. Even with a retention policy that keeps only the last few, the peak storage requirement and the I/O throughput needed for writes are significant cost factors.

## Component 3: data transfer

Data transfer costs are the silent budget killer. Moving training data from object storage to the parallel filesystem, transferring checkpoints between storage tiers, and any cross-availability-zone traffic all incur charges. They do not show up in the instance pricing calculator. They show up in the bill.

For a training dataset of 10 TB transferred from object storage to the parallel filesystem, the transfer cost is modest. But if the cluster spans multiple availability zones (which it should not, but sometimes does due to capacity constraints), the inter-AZ data transfer for NCCL communication can be enormous. At $0.01 per GB, the gradient synchronization traffic alone — hundreds of gigabytes per iteration, thousands of iterations per day — can add tens of thousands of dollars.

The lesson: keep all instances in the same availability zone. The networking cost of cross-AZ traffic for tightly coupled workloads is prohibitive. I have watched teams learn this the hard way — a single training run with cross-AZ traffic can generate a data transfer bill that exceeds the storage cost for the entire month.

## Component 4: idle time from failures

This is the cost that nobody budgets for and everybody pays. In a 1,000-GPU cluster running for 14 days, hardware failures are not a possibility — they are a certainty. GPU memory errors, network interface failures, NVMe drive failures, and instance terminations (for spot instances) will occur. The math is unforgiving: with enough nodes and enough time, something breaks. The only variable is when.

When a node fails in a distributed training job, the entire job stops. All 1,000 GPUs idle while the failed node is replaced, the job restarts, and the model state loads from the last checkpoint. Every GPU waiting. Every dollar burning. If the mean time between failures is 8 hours and each recovery takes 15 minutes, you lose approximately 42 recovery events × 15 minutes × 125 instances × $32/hour = $42,000 in idle GPU time.

But that is the optimistic case. If checkpointing is infrequent — say every 2 hours — each failure also loses up to 2 hours of training progress that must be recomputed. That recomputation cost is:

42 failures × 1 hour average lost progress × 125 instances × $32/hour = $168,000

The total cost of failures — idle time plus recomputation — can easily reach 10-15% of the total instance cost.

## Component 5: networking infrastructure

Placement groups, elastic IP addresses, and NAT gateways for instances in private subnets all have associated costs. These are typically small relative to the instance costs, but they are not zero. For a 125-instance cluster, networking infrastructure costs might add $2,000 to $5,000 over the 14-day run.

## The complete picture

| Component | Estimated cost | % of total |
|-----------|---------------|------------|
| Instance hours (on-demand) | $1,344,000 | 82% |
| Storage (filesystem + checkpoints) | $40,000 | 2.5% |
| Data transfer | $15,000 | 1% |
| Failure-related idle time | $42,000 | 2.5% |
| Failure-related recomputation | $168,000 | 10% |
| Networking infrastructure | $5,000 | 0.3% |
| **Total** | **~$1,614,000** | **100%** |

## The three highest-impact levers

### Lever 1: spot instances

Switching from on-demand to spot instances can reduce the instance cost by 60-70%. For this scenario, that drops the instance cost from $1.34M to roughly $400K-$540K. The trade-off is interruption risk, which requires robust checkpointing and automated restart logic. For training workloads that already need checkpointing for fault tolerance, the additional engineering cost is minimal. This is the single highest-leverage decision in the entire cost model — an engineering decision, not a procurement decision.

### Lever 2: checkpointing frequency

More frequent checkpointing reduces the recomputation cost after failures. Checkpointing every 15 minutes instead of every 2 hours reduces the average lost progress per failure from 1 hour to 7.5 minutes. The recomputation cost drops from $168,000 to approximately $21,000. The trade-off is the I/O overhead of checkpointing itself, which must be measured against the savings. In practice, the savings almost always win — the math strongly favors frequent checkpointing once you account for the true cost of recomputation.

### Lever 3: training efficiency (MFU)

Model FLOP Utilization directly determines how long the training run takes. Improving MFU from 40% to 50% reduces the training time by 20%, which reduces every time-based cost by 20%. For our scenario, that is a savings of approximately $320,000. MFU improvements come from better communication-computation overlap, optimized data loading, and kernel-level optimizations — all of which are engineering investments with measurable returns. This is where profiling pays for itself many times over.

## Building your own cost model

The specific numbers in this article are illustrative. Your actual costs will depend on your instance type, region, pricing model, and workload characteristics. But the structure of the cost model is universal. Every large-scale training run has the same five components, and the relative magnitudes are consistent: instance hours dominate, failure-related costs are larger than expected, and the three levers — spot pricing, checkpointing, and MFU — have the highest impact on total spend.

Build the model before you start the run. Update it as you learn the actual failure rate and MFU. Use it to justify engineering investments in checkpointing and performance optimization. The model pays for itself on the first training run. I have never regretted building one. I have regretted not building one.
