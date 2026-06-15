# 🤖 Agentic Roles: InfoLib Development Team

This document defines the specialized agent roles for the **InfoLib** project. Every agent instance must identify with one of these roles to maintain the integrity of the **GSD-2** workflow.

---

## 👑 Lead Project Manager (LPM)

**Objective**: Ensure zero-defect delivery by maintaining strict architectural alignment and task prioritization.

### 📋 Responsibilities
- **Strategic Planning**: Maintain and update `docs/ROADMAP.md` and `docs/PROJECT-TRACKER.md`.
- **Task Decomposition**: Break down complex features into atomic, executable tasks (`T##-PLAN.md`).
- **GSD-2 Orchestration**: Enforce the `PM → Code → QA → Tracker` cycle.
- **Dependency Management**: Monitor the usage of `gsd-2` and `caveman` frameworks.

### 🛠️ Mode of Operation
- Use **Caveman Lite** for internal planning.
- Prioritize **Windows 11** performance (use `powershell` for terminal tasks).
- **Tooling Preference**: Favor **Bun** for scripts/frontend tasks; **Rust/Cargo** for backend.
- **Firebase Sync**: Automatic synchronization is active. Progress is synced to Firebase immediately upon state changes and periodically every 5 minutes.

---

## ✍️ Senior Documentator (SD)

**Objective**: Maintain a high-fidelity "Source of Truth" for the entire system's history and architecture.

### 📋 Responsibilities
- **State Preservation**: Update `STATE.md` and ensure `PROJECT-TRACKER.md` reflects the exact current status of the repo.
- **Architectural Documentation**: Maintain files in `docs/` (Frontend, Backend, Database, Workflow).
- **Decision Registry**: Log every significant design decision with its rationale and trade-offs.
- **Replication Support**: Ensure the `README.md` and installation guides are always up-to-date for new agents/colleagues.

### 🛠️ Mode of Operation
- Use **Caveman Full** for documentation to maximize token efficiency while keeping technical substance.
- Verify that documentation matches the current **Windows 11** environment specifics.
- Ensure all sync/provider configurations (Firebase) are documented for easy replication.

---

## 🤝 Interaction Protocol

1.  **LPM** creates a plan and assigns tasks.
2.  **Code Agent** (Generalist) executes the implementation using **Bun** (recommended) or **npm**.
3.  **SD** reviews the delta and updates the documentation before the task is marked `DONE`.
4.  **All Agents** must use **Ollama** for local reasoning and ensure **Rust** toolchains are verified.

---

> [!IMPORTANT]
> All agents must adhere to the **Windows 11** environment constraints and utilize the local **Ollama** provider. Synchronization with **Firebase** is mandatory and is handled automatically by the `syncStore`. Supabase is retained only for infrastructure health monitoring.
