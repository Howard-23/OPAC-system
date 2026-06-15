# Task T01: Installer Requirements & Dependency Analysis

## Overview
Analyze the required components for the infoLib LMS installer to ensure a seamless "one-click" setup experience for General de Jesus College.

## Components to Bundle

### 1. PostgreSQL 18 (Portable)
- **Role**: Primary database engine.
- **Requirement**: Must include `pgvector` extension (v0.8.2).
- **Setup**: 
  - Bundle a zip/portable version of PG18.
  - Automate `initdb` and `pg_ctl start` via Tauri backend.
  - Default credentials to be user-configurable.

### 2. Ollama (Binary)
- **Role**: AI Inference engine for semantic search and chat.
- **Requirement**: Must handle `phi3` or `nomic-embed-text` models.
- **Setup**:
  - Bundle Ollama CLI as a Tauri sidecar.
  - Implement logic to check if Ollama is running; if not, launch in background.

### 3. Application Settings & Credentials
- **Role**: Secure storage for DB strings and user preferences.
- **Feature**: 
  - Downloadable settings file (JSON/YAML).
  - Encrypted fields for passwords.
  - User-configurable via a "Setup Wizard" on first launch.

## Branding Specs (GJC)
- **Primary Green**: `#00401A`
- **Secondary Gold**: `#C5A059`
- **Logo**: GJC Seal (to be placed in sidebar and header).

## Manual QA Checklist
- [ ] Installer launches with correct brand colors.
- [ ] First-run wizard detects missing PG/Ollama.
- [ ] Database credentials can be changed and persisted.
- [ ] Settings export generates a valid file on an external drive.
- [ ] App restarts correctly with new credentials.
