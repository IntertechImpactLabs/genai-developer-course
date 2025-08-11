# Section 2: Core Prompting Techniques

This folder contains hands-on exercises and demos for Section 2 of the course.

## Structure

### Part A: Effective Prompt Design (45 min)
- `01_rate_limiter_demo/` - Demo: Building with clear prompts
- `02_cache_helper_exercise/` - Exercise: Thread-safe cache implementation (TypeScript)

### Part B: Advanced Prompting & Context Augmentation (45 min)
- `03_rag_demo/` - Demo: RAG from hallucination to accuracy (Instructor-led)
- `04_rag_exercise/` - Exercise: Build a RAG system (Python/Jupyter)

## Setup Instructions

### For Part A Exercises (TypeScript)
```bash
cd 02_cache_helper_exercise
npm install
npm test
```

### For Part B RAG Exercises (Python)
```bash
cd 04_rag_exercise
pip install -r requirements.txt
jupyter notebook rag_exercise.ipynb
```

## Learning Path

1. **Start with clarity** - See how precise prompts improve results (Part A)
2. **Add context** - Learn to provide the right background information
3. **Eliminate hallucinations** - Use RAG to ground responses in real data (Part B)
4. **Understand trade-offs** - When to use keyword vs semantic search

## Key Concepts

### Part A: Prompt Design
- Clarity and specificity
- Context setting
- Few-shot examples
- XML-tagged templates

### Part B: RAG & Advanced Techniques
- Retrieval-Augmented Generation (RAG)
- Keyword vs semantic search
- Chain-of-Thought overview
- Cost-performance optimization

## Files

- `data/` - Shared database for SQL demos (if needed)
- Mock product data used consistently across RAG demos and exercises

## Notes for Instructors

- Part A focuses on fundamental prompt engineering
- Part B introduces RAG as the primary advanced technique
- CoT is briefly covered but not emphasized due to reasoning models
- Semantic search is demonstrated by instructor only (complexity management)