---
title: "LLM serving infrastructure: from training cluster to inference fleet"
description: "The architectural shift from training to serving: batching strategies, KV cache management, tensor parallelism for inference, and the latency-throughput trade-off. Compares serving frameworks, maps infrastructure requirements to business SLAs, and includes a cost-per-token analysis."
date: 2027-10-17
draft: true
---

Training a large language model and serving it are fundamentally different infrastructure problems. The cluster that minimizes training time is rarely the fleet that minimizes inference cost. I have watched teams learn this the hard way — deploying their training setup for inference and wondering why the economics do not work.

## Why inference is different

Training is throughput-oriented. You want to process as many tokens as possible per second across the entire cluster. Latency for individual samples does not matter — nobody is waiting for a single training step to complete. The optimization target is aggregate FLOPS utilization.

Inference is latency-sensitive. A user is waiting for a response. The time to first token (TTFT) and the inter-token latency (ITL) directly affect user experience. A chatbot that takes 5 seconds to start responding feels broken. One that generates tokens at 10 tokens per second feels sluggish. The optimization target is latency under a throughput constraint — or throughput under a latency constraint.

This difference changes everything: the hardware selection, the parallelism strategy, the batching approach, and the memory management.

## The two phases of generation

LLM inference has two distinct phases with different computational profiles.

The prefill phase processes the entire input prompt in parallel. It is compute-bound — the model performs a full forward pass over all input tokens simultaneously, and the matrix multiplications are large enough to saturate the GPU's compute units. Prefill looks like a single training forward pass.

The decode phase generates tokens one at a time, autoregressively. Each step produces one token, which is appended to the sequence and fed back as input for the next step. The matrix multiplications in the decode phase have a batch dimension of 1 (per sequence), making them extremely memory-bandwidth-bound. The GPU reads the entire model's weights from HBM to produce a single token. Compute utilization during decode is typically below 5%.

This asymmetry is the central challenge of LLM serving. Prefill is compute-bound and fast. Decode is memory-bound and slow. The same hardware, the same model, two completely different bottlenecks. The infrastructure must handle both efficiently.

## Batching strategies

The key to improving decode-phase efficiency is batching — processing multiple sequences simultaneously so that the weight reads from HBM are amortized across more useful work.

Static batching groups requests into fixed-size batches. All sequences in the batch start and end together. The problem is that sequences have different lengths. Short sequences finish early and pad the batch with wasted computation until the longest sequence completes.

Continuous batching (also called iteration-level batching) solves this. Instead of waiting for all sequences to finish, the scheduler inserts new requests into the batch as soon as a slot opens. Each decode iteration processes a dynamic set of sequences, maximizing GPU utilization. This is the approach used by modern serving frameworks like vLLM and TensorRT-LLM.

## KV cache management

During generation, the model caches the key and value tensors from the attention layers for all previously generated tokens. This KV cache avoids recomputing attention over the entire sequence at every step, but it consumes significant GPU memory.

For a 70B parameter model with 80 attention layers, a KV cache for a single sequence of 4,096 tokens requires approximately 5 GB of GPU memory. With a batch of 32 concurrent sequences, the KV cache alone consumes 160 GB — more than the capacity of two H100 GPUs.

KV cache management is therefore a critical component of the serving system. Naive implementations pre-allocate memory for the maximum sequence length, wasting memory on sequences that are shorter. PagedAttention, introduced by vLLM, manages KV cache memory in fixed-size pages, allocating them on demand and freeing them when sequences complete. This reduces memory waste and allows significantly higher batch sizes, which directly improves throughput.

## Tensor parallelism for inference

Training uses data parallelism as the primary scaling strategy — each GPU processes a different batch of data. Inference uses tensor parallelism — each GPU holds a slice of every layer, and they collaborate to process the same batch.

Tensor parallelism is preferred for inference because it reduces the per-GPU memory requirement (the model is split across GPUs) and, critically, it reduces the latency of each decode step. With tensor parallelism across 4 GPUs, each GPU reads only one-quarter of the model weights per step, reducing the memory-bandwidth bottleneck by 4x.

The trade-off is communication overhead. Tensor parallelism requires an all-reduce after every attention and MLP layer. Within a node, NVLink provides sufficient bandwidth for this communication to be fast. Across nodes, the network latency makes tensor parallelism impractical — pipeline parallelism is used instead for models that span multiple nodes.

For most serving deployments, the model should fit within a single node using tensor parallelism across all available GPUs. A 70B model in FP16 fits on 4 H100 GPUs (80 GB each) with room for KV cache.

## The latency-throughput trade-off

Larger batch sizes improve throughput (more tokens per second) but increase latency (each individual request waits longer). The serving system must balance these competing objectives based on the business SLA.

For interactive applications (chatbots, code completion), the SLA typically specifies a maximum TTFT (e.g., 500 ms) and a minimum token generation rate (e.g., 30 tokens/second). The serving system must limit batch size to stay within these bounds.

For batch applications (document summarization, data extraction), latency is less critical and throughput is the primary objective. Larger batch sizes and longer queuing times are acceptable.

The optimal operating point depends on the model size, the hardware, and the SLA. Profiling the serving system under realistic load — not synthetic benchmarks — is the only way to find it.

## Quantization

Quantization reduces the model's memory footprint and increases inference throughput by using lower-precision data types. FP16 to INT8 quantization halves the memory requirement and roughly doubles the decode throughput, because the memory-bandwidth bottleneck is relaxed.

INT4 quantization (GPTQ, AWQ) goes further, reducing memory by 4x relative to FP16. A 70B model in INT4 fits on a single GPU with 80 GB of HBM, eliminating the need for tensor parallelism entirely. The quality impact of INT4 quantization is model-dependent but generally acceptable for most applications.

The decision to quantize is almost always correct for inference. The throughput improvement and cost reduction are substantial, and the quality degradation is typically small. Profile the quantized model on your evaluation set to confirm — but in my experience, the answer is almost always "yes, quantize." The rare exceptions are tasks requiring maximum precision on numerical reasoning or fine-grained factual recall.

## Serving frameworks

The serving framework manages batching, KV cache, model execution, and the API layer. The major options:

vLLM provides PagedAttention, continuous batching, and tensor parallelism out of the box. It is open source, well-documented, and the default choice for many deployments.

TensorRT-LLM is NVIDIA's optimized inference engine. It compiles the model into an optimized execution plan with kernel fusion, quantization, and hardware-specific optimizations. It typically delivers higher throughput than vLLM on NVIDIA hardware but requires a compilation step and is less flexible.

Text Generation Inference (TGI) by Hugging Face provides a production-ready serving solution with continuous batching and quantization support. It integrates well with the Hugging Face ecosystem.

The choice depends on your optimization priority (latency vs. throughput), your hardware, and your operational preferences. All three are production-viable. The landscape is evolving fast — what I write here about relative performance may shift within months. Benchmark on your workload, with your model, on your hardware.

## Cost per token

The unit economics of LLM serving are measured in cost per token (or cost per million tokens). The calculation is straightforward:

Cost per token = (GPU instance cost per second) / (tokens generated per second)

For a 70B model on 4 H100 GPUs generating 2,000 tokens per second with INT8 quantization, at an instance cost of $12/hour:

Cost per million tokens = ($12/3600) / 2000 × 1,000,000 = $1.67

Improving throughput — through better batching, quantization, or hardware selection — directly reduces cost per token. This is the metric that determines whether self-hosted inference is cheaper than API providers, and it is the metric that justifies infrastructure investment. Get this number right, and the business case writes itself. Get it wrong, and you are running an expensive hobby.

## The transition

Moving from training to serving is not a deployment step — it is an architectural redesign. The hardware changes. The parallelism strategy changes. The memory management changes. The optimization targets change. Teams that treat serving as an afterthought end up with inference costs that dwarf their training costs. Plan the serving architecture before training completes. Size the infrastructure based on expected request load and SLA requirements.
