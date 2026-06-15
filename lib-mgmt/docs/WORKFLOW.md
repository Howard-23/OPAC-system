# Project Workflow: PM → Code → QA → Tracker

This document defines the strict execution cycle for the Library Management System project. All agents and collaborators must adhere to this loop for every task.

## 1. Project Manager (Planning)
- **Artifacts**: `ROADMAP.md`, `CONTEXT.md`.
- **Action**: Define the scope, identify constraints, and set success criteria.
- **Goal**: Zero ambiguity before implementation begins.

## 2. Code (Implementation)
- **Artifacts**: `S##-PLAN.md`, `T##-PLAN.md`, Source Code.
- **Action**: Decompose work into atomic tasks and execute the implementation.
- **Goal**: Clean, modular, and high-parity code following the Design System.

## 3. QA (Verification)
- **Artifacts**: Browser Screenshots, Test Results, `verification_result`.
- **Action**: Run behavioral (browser), static, and command-level verification.
- **Goal**: Prove that the "Must-Haves" are met before marking a task as done.

## 4. Tracker (Documentation)
- **Artifacts**: `PROJECT-TRACKER.md`, `STATE.md`, `T##-SUMMARY.md`.
- **Action**: Update the project status, append to the decisions register, and summarize the delta for downstream tasks.
- **Goal**: Maintain 100% visibility on progress and architectural history.

---

**Protocol Update Rule**: If this workflow needs adjustment, the agent must propose the change, document it here, and update the Project Manager before proceeding.

## 5. Efficiency (Caveman Mode)
- **Tool**: Caveman plugin (`c:/projects/ai/caveman`).
- **Standard**: Speak terse. All technical substance stay. Only fluff die.
- **Goal**: Save tokens, keep context window deep.
