# 🚼 DevPulse – Internal Tech Issue & Feature Tracker

DevPulse is a collaborative issue-tracking platform designed for software engineering teams to log system bugs, request infrastructure or application features, and manage development lifecycle status shifts smoothly and securely.

---

## 🔗 Project Details & Production References
* **Project Name:** DevPulse Tracker Engine
* **Live Deployment URL:** [https://assignmentb7a2.vercel.app/](https://assignmentb7a2.vercel.app/)
* **API Environment:** Production Tier Gateway-V1

---

## ✨ Features
* **Role-Based Security Assertions:** Complete isolation between general `contributor` accounts and system `maintainer` profiles.
* **Zero-JOIN Architecture Optimization:** Blazing-fast raw atomic single-table querying backed by batch memory application-layer grouping mechanisms.
* **Dynamic Issue Pipeline Querying:** Real-time query parameter filtering for workflow stages, item classifications, and chronologically reversible timeline sorts.
* **Granular Action Safeguards:** Strict modification filters preventing contributors from interfering with active, resolved, or unowned issues.
* **Automated Temporal Tracking:** Automated native stateful trigger updates tracking structural mutations directly within PostgreSQL database layers.

---

## 🛠️ Technology Stack
* **Runtime:** Node.js LTS (v24.x or higher)
* **Language Variant:** TypeScript (Latest Stable Edition)
* **Server Framework:** Express.js (Modular Router Design)
* **Database Infrastructure:** PostgreSQL (Native `pg` pool driver connections)
* **Querying Engine:** Raw Functional SQL (Strictly zero Query Builders or Object-Relational Mappers)
* **Encryption System:** bcrypt (Salt difficulty factor range: 10)
* **Token Security:** jsonwebtoken (Standard Cryptographic JWT)

---

## ⚙️ Project Setup & Local Initialization

Follow these clear, step-by-step procedures to provision, construct, and boot the application engine locally.

### 1. Repository Installation & Dependencies Extraction
```bash
# Clone or navigate to project directory
cd devpulse-api

# Install production and development compilation engines
npm install
