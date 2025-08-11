# RAG (Retrieval-Augmented Generation) Exercise

## Overview
This exercise demonstrates how RAG eliminates AI hallucinations by grounding responses in real data. You'll build a simple keyword-based retrieval system and see the dramatic difference it makes in accuracy.

## Learning Objectives
- Understand how RAG prevents hallucinations
- Implement simple keyword-based retrieval
- See the impact of context on AI responses
- Handle edge cases in retrieval systems

## Prerequisites
- Python 3.7+
- Jupyter Notebook or JupyterLab
- Basic Python knowledge

## Setup Instructions

### Option 1: Local Jupyter
```bash
# Install dependencies
pip install jupyter

# Start Jupyter
jupyter notebook rag_exercise.ipynb
```

### Option 2: Google Colab
1. Upload `rag_exercise.ipynb` to Google Colab
2. Run cells sequentially

### Option 3: VS Code
1. Open `rag_exercise.ipynb` in VS Code
2. Select Python kernel
3. Run cells with Shift+Enter

## Exercise Structure

### Part 1: Setup (2 min)
- Load mock product catalog data
- Understand the data structure

### Part 2: Baseline (5 min)
- Query without context
- Observe hallucinated responses

### Part 3-4: Build RAG (10 min)
- Implement keyword search
- Create context from search results
- Inject context into prompts

### Part 5-6: Testing (5 min)
- Compare with/without RAG
- Test different queries

### Part 7: Edge Cases (3 min)
- Handle no results
- Handle ambiguous queries

## Key Concepts

### The RAG Pipeline
1. **Retrieve**: Search for relevant information
2. **Augment**: Add context to the prompt
3. **Generate**: AI responds based on real data

### Why It Works
- AI can't hallucinate when given explicit facts
- Context grounds responses in reality
- Search quality directly impacts answer quality

## Extension Ideas
- Add semantic search with embeddings
- Implement citation tracking
- Build a web interface
- Connect to real databases

## Instructor Notes
- Emphasize the hallucination problem first
- Show clear before/after comparison
- Discuss when keyword search is sufficient
- Preview semantic search in demo