---
title: "Securing Terraform state"
description: "Terraform state holds secrets in plaintext. How to store, encrypt, lock, and access-control remote state so it stops being the weakest link in your IaC."
date: 2024-01-13
draft: true
---

Terraform state is the most sensitive file in your infrastructure repository, and the one most likely to be mishandled. It holds resource identifiers, connection strings, and — despite every warning — plaintext secrets. Leave it on a laptop or in an unencrypted bucket and you have handed an attacker a map of everything you run. Here is how to store, encrypt, and lock Terraform state so it stops being your weakest link.
