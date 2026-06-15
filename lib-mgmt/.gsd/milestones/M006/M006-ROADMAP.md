# Milestone M006: AI & Semantic Intelligence

## Vision
Transform infoLib from a traditional database-driven catalog into an "Intelligent Library Assistant." This milestone focuses on offline-first AI integration using Gemma 2, semantic search via vector embeddings (pgvector), and a context-aware chat system that respects user permissions.

## Slices

### S01: Semantic Infrastructure (pgvector)
- **Objective**: Prepare the database for vector storage.
- **Tasks**:
  - Install/Enable `pgvector` extension.
  - Create embedding columns for `tblCat` (Title, Author, Subject).
  - Implement a background task to generate embeddings for all 6,619 legacy records.

### S02: Offline LLM Integration (Ollama + Gemma 4)
- **Objective**: Establish the local AI brain.
- **Tasks**:
  - Integrate Ollama API (localhost:11434).
  - Configure **Gemma 4** for low-latency CPU inference.
  - Implement a Rust-based bridge to manage LLM lifecycle.

### S03: AI UI & Hover Badge
- **Objective**: Create the entry point for AI interaction.
- **Tasks**:
  - Build a floating badge (bottom-right) with dynamic opacity.
  - Implement a "Glassmorphism" chat window (Win98 Style variant).
  - Add "Advanced Search" toggle to enable vector-based semantic lookup.

### S04: Context-Aware RAG (Retrieval Augmented Generation)
- **Objective**: Enable AI to answer specific library questions.
- **Tasks**:
  - **Patron Context**: AI can access the logged-in user's `tblRent` data.
  - **Admin Context**: AI can access global circulation and user data.
  - **Semantic Search**: Use cosine similarity for "Fuzzy/Conceptual" book searching.

## Technical Decisions
- **D035**: Use **Gemma 4** via Ollama for offline privacy and performance.
- **D036**: Use **pgvector** for the vector database to avoid adding external dependencies like Chroma or Qdrant.
- **D037**: Use **nomic-embed-text** for high-quality, local embeddings.
