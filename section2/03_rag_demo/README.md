# RAG Demo - Instructor Guide

## Overview
This demo shows the progression from AI hallucination to accurate responses using Retrieval-Augmented Generation (RAG).

## Demo Structure

### Part 1: The Hallucination Problem (2 min)
- Show AI making up product features
- Demonstrate the business risk

### Part 2: Keyword Search RAG (3 min)
- Simple keyword matching
- Context injection
- Immediate accuracy improvement

### Part 3: Semantic Search (3 min)
- Embeddings demonstration
- Finding related concepts without exact keywords
- Production considerations

### Part 4: Cost & Performance (2 min)
- Compare approaches
- Discuss trade-offs

## Files

- `rag_demo.py` - Complete demo script
- `rag_demo.ipynb` - Jupyter notebook version
- `mock_products.json` - Product catalog data
- `semantic_search.py` - Advanced embedding demo

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set OpenAI API key (for embeddings demo)
export OPENAI_API_KEY="your-key-here"
```

## Running the Demo

### Option 1: Python Script
```bash
python rag_demo.py
```

### Option 2: Jupyter Notebook
```bash
jupyter notebook rag_demo.ipynb
```

## Key Teaching Points

1. **Hallucination is dangerous** - AI confidently provides wrong information
2. **RAG grounds responses** - Real data prevents fabrication
3. **Start simple** - Keyword search often sufficient
4. **Semantic when needed** - More intelligent but costs more
5. **Always handle edge cases** - No results, ambiguous queries

## Troubleshooting

### If OpenAI API fails:
- Use pre-computed embeddings in `backup_embeddings.json`
- Focus on concept over implementation

### If time runs short:
- Skip semantic search
- Focus on before/after comparison

### Common Questions:
- "When to use RAG?" - Dynamic data, domain-specific info
- "Cost?" - Pennies per thousand queries
- "vs Fine-tuning?" - RAG better for changing data