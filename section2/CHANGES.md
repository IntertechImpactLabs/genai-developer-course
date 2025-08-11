# Section 2 Updates - RAG Integration

## Changes Made (August 11, 2025)

### Removed (Obsolete CoT-focused content)
- ❌ `03_thinking_models_demo/` - Database optimization with CoT
- ❌ `04_notification_system_exercise/` - Complex system design with CoT

### Added (RAG-focused content)
- ✅ `03_rag_demo/` - Instructor-led RAG demonstration
  - Python script and Jupyter notebook versions
  - Shows progression: hallucination → keyword → semantic search
  - Includes cost analysis and production considerations
  
- ✅ `04_rag_exercise/` - Student hands-on RAG exercise
  - Jupyter notebook format for interactive learning
  - Simple keyword search (no embedding complexity)
  - Mock product catalog with obvious keyword differences
  - Edge case handling practice

### Key Files
- `mock_products.json` - Consistent product data across demos/exercises
- `rag_demo.py` - Complete instructor demo script
- `rag_exercise.ipynb` - Student exercise notebook
- `requirements.txt` - Minimal dependencies (jupyter, optional openai)

## Rationale
- CoT less critical with reasoning models (o3, Claude reasoning mode)
- RAG immediately practical for eliminating hallucinations
- Keyword search sufficient for structured data
- Semantic search shown in demo only (instructor controls complexity)

## Learning Path
1. Part A: Basic prompt clarity with cache exercise
2. Part B: RAG for accuracy with product catalog exercise
3. Demo shows advanced semantic search capabilities
4. Students understand when to use each technique

## Time Allocation
- Part A: 45 minutes (unchanged)
- Part B: 45 minutes
  - CoT overview: 8 minutes
  - RAG concepts: 12 minutes
  - RAG demo: 10 minutes
  - RAG exercise: 20 minutes

## Testing Instructions
```bash
# Test the demo
cd 03_rag_demo
python rag_demo.py

# Test the exercise
cd ../04_rag_exercise
jupyter notebook rag_exercise.ipynb
```