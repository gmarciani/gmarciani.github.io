---
title: "Fine-tuning LLMs on a budget: LoRA + FSx"
description: "End-to-end walkthrough of fine-tuning a large language model on a constrained budget using LoRA to reduce trainable parameters, FSx for Lustre for fast dataset access, and carefully selected instance types — with a reproducible cost breakdown and guidance on when fine-tuning beats prompting."
date: 2027-10-17
draft: true
---

Fine-tuning a large language model does not require a thousand GPUs or a six-figure cloud bill. With the right combination of parameter-efficient techniques and storage architecture, meaningful fine-tuning is within reach for teams of any size — and the economics have shifted faster than most people realize.

## When fine-tuning beats prompting

Before spending money on fine-tuning, ask whether you need to. Prompting (including few-shot prompting and retrieval-augmented generation) is cheaper, faster to iterate on, and sufficient for many use cases.

Fine-tuning is the right choice when: the task requires a specific output format that prompting cannot reliably produce; the domain vocabulary is specialized enough that the base model struggles; latency requirements demand a smaller model that matches a larger model's quality on your specific task; or you need consistent behavior across thousands of similar inputs where prompt engineering becomes fragile.

If your use case does not meet any of these criteria, start with prompting. You can always fine-tune later.

## Why LoRA changes the economics

Full fine-tuning updates every parameter in the model. For a 70B parameter model, this requires storing the full model weights, gradients, and optimizer states — over 500 GB of GPU memory. You need multiple high-end GPUs just to fit the training state.

LoRA (Low-Rank Adaptation) takes a different approach. Instead of updating the original weight matrices, it freezes them and adds small trainable low-rank matrices alongside them. A rank-16 LoRA adapter for a 70B model adds roughly 100 million trainable parameters — 0.14% of the original model. The memory footprint drops dramatically because gradients and optimizer states are only needed for the small adapter matrices.

The practical impact: a 7B model can be fine-tuned with LoRA on a single GPU with 24 GB of memory. A 70B model can be fine-tuned on a single node with 4 GPUs. Most of the knowledge lives in the frozen weights — the adapter learns the delta for your specific task. The quality of LoRA fine-tuning is remarkably close to full fine-tuning for most tasks, especially when the rank is chosen appropriately.

## Choosing the right hardware

For budget-conscious fine-tuning, the instance selection matters more than for large-scale training because you are optimizing cost per experiment, not time to completion.

For models up to 7B parameters, a single GPU with 24-48 GB of memory is sufficient with LoRA. This is the most cost-effective option — a single GPU instance costs $1-4 per hour depending on the GPU generation.

For models in the 13B-30B range, a single GPU with 80 GB (like an A100 or H100) handles LoRA fine-tuning comfortably. With QLoRA (quantized LoRA), which loads the base model in 4-bit precision, even a 24 GB GPU can handle a 13B model.

For 70B models, a multi-GPU node is necessary even with LoRA. The base model weights (loaded in FP16 or quantized) must fit in aggregate GPU memory, plus room for activations and the LoRA adapter. A 4-GPU node with 80 GB per GPU provides 320 GB of total memory — sufficient for a 70B model with LoRA.

## The role of FSx for Lustre

Storage is the overlooked cost factor in fine-tuning. Teams obsess over GPU selection and ignore the data path entirely. The problem is that training data must be accessible to the GPU instances with enough throughput to keep the data pipeline from becoming a bottleneck — and the cheapest storage option is rarely the right one.

For small datasets (under 10 GB), the simplest approach is to copy the data to local NVMe at job start. Local storage provides the lowest latency and highest throughput, and the copy time is negligible for small datasets.

For larger datasets — instruction-tuning datasets with millions of examples, or domain-specific corpora — a shared filesystem becomes necessary. FSx for Lustre provides a parallel filesystem that can be mounted on all training nodes simultaneously. It integrates directly with S3, allowing you to create a filesystem that lazily loads data from an S3 bucket on first access and caches it for subsequent reads.

This lazy-loading behavior is particularly useful for fine-tuning. You create an FSx filesystem linked to your S3 dataset bucket, mount it on the training instance, and start training. The first epoch reads from S3 through FSx (with some latency), and subsequent epochs read from the FSx cache at full filesystem speed. For multi-epoch fine-tuning, the amortized I/O performance is excellent.

The cost of FSx for Lustre depends on the storage capacity and throughput tier. For fine-tuning workloads, the smallest persistent filesystem (1.2 TB) with baseline throughput is typically sufficient and costs a few dollars per hour. This is a fraction of the GPU instance cost.

## A concrete walkthrough

Here is a representative fine-tuning setup for a 7B model with LoRA on a single GPU instance.

The dataset: 50,000 instruction-response pairs in JSONL format, approximately 500 MB. Stored in S3.

The instance: a single GPU instance with 24 GB of memory. Cost: approximately $1.50/hour.

The storage: FSx for Lustre, 1.2 TB, linked to the S3 bucket containing the dataset. Cost: approximately $0.17/hour.

The training configuration:

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, TrainingArguments

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.float16,
    device_map="auto",
)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)

training_args = TrainingArguments(
    output_dir="/fsx/output",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    save_steps=500,
    logging_steps=10,
)
```

Training time: approximately 4 hours for 3 epochs on 50,000 examples.

Total cost: (4 hours × $1.50) + (4 hours × $0.17) = $6.68.

The LoRA adapter — the output of training — is approximately 50 MB. It can be merged with the base model for deployment or loaded separately at inference time.

## QLoRA: pushing the budget further

QLoRA combines LoRA with 4-bit quantization of the base model. The base model weights are loaded in NF4 (4-bit NormalFloat) precision, reducing memory consumption by 4x compared to FP16. Only the LoRA adapter weights are kept in higher precision for training.

This allows fine-tuning a 13B model on a 24 GB GPU, or a 70B model on a single 48 GB GPU. The quality trade-off is minimal for most tasks — the quantization affects only the frozen base weights, not the trainable adapter.

The training code changes are minimal:

```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto",
)
```

## Evaluating the result

Fine-tuning without evaluation is guessing. Set aside 10-15% of your dataset for evaluation. Measure both automated metrics (loss, perplexity) and task-specific metrics (accuracy, F1, ROUGE, or human preference ratings depending on the task).

Compare the fine-tuned model against the base model with the best prompt you can write. This is the comparison that matters — not fine-tuned vs. nothing, but fine-tuned vs. the best alternative. If the fine-tuned model does not meaningfully outperform prompted inference, the fine-tuning did not add enough value to justify the cost and operational complexity of maintaining a custom model.

## The bottom line

LoRA and QLoRA have democratized LLM fine-tuning. A meaningful experiment costs single-digit dollars. It takes hours, not days. The combination of parameter-efficient methods, quantization, and fast shared storage makes it possible to iterate quickly without a large infrastructure budget. The barrier is no longer cost — it is knowing when fine-tuning is the right tool for the job. That judgment requires experience, and no amount of cheap compute substitutes for it.
