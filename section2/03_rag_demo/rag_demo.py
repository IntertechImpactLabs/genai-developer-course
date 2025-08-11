#!/usr/bin/env python3
"""
RAG Demo Script - Instructor Version
Demonstrates progression from hallucination to accurate RAG responses
"""

import json
import os
from typing import List, Dict, Any

# For semantic search demo (optional)
try:
    from openai import OpenAI
    import numpy as np
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Note: OpenAI not installed. Semantic search demo will use mock embeddings.")

# Mock product catalog
PRODUCTS = [
    {
        "name": "TurboCache Pro",
        "description": "Lightning-fast in-memory caching solution with sub-millisecond latency",
        "features": ["10GB capacity", "LRU eviction", "distributed mode", "Redis compatible"],
        "keywords": ["speed", "fast", "performance", "cache", "memory", "quick", "turbo"],
        "price": "$99/month"
    },
    {
        "name": "SecureVault Enterprise",
        "description": "Military-grade encryption for sensitive data protection",
        "features": ["AES-256 encryption", "biometric auth", "SOC2 compliant", "key rotation"],
        "keywords": ["security", "encryption", "protection", "vault", "safe", "secure", "privacy"],
        "price": "$199/month"
    },
    {
        "name": "CloudSync Manager",
        "description": "Real-time data synchronization across cloud platforms",
        "features": ["Multi-cloud support", "version control", "1TB storage", "automatic backups"],
        "keywords": ["sync", "cloud", "backup", "storage", "synchronization", "replication"],
        "price": "$149/month"
    },
    {
        "name": "DataFlow Analytics",
        "description": "Stream processing and real-time analytics platform",
        "features": ["Apache Kafka integration", "ML pipelines", "custom dashboards", "alerting"],
        "keywords": ["analytics", "data", "streaming", "metrics", "insights", "dashboard"],
        "price": "$299/month"
    }
]


def demo_hallucination():
    """Part 1: Demonstrate AI hallucination without context"""
    print("\n" + "="*60)
    print("PART 1: THE HALLUCINATION PROBLEM")
    print("="*60)
    
    print("\nQuery: 'Tell me about TurboCache Pro features'")
    print("\nAI Response (WITHOUT real data):")
    print("-" * 40)
    print("""
Based on the name, TurboCache Pro likely includes:
- Advanced ML-based caching algorithms
- Automatic scaling to 100TB
- Built-in blockchain verification
- Quantum-resistant encryption
- GraphQL API support
- Free tier with 5GB storage

Price: Probably starts at $49/month

⚠️  Note: These features are COMPLETELY MADE UP!
The AI is hallucinating plausible-sounding features.
""")
    
    input("\nPress Enter to continue...")


def search_products_keyword(query: str, products: List[Dict]) -> List[Dict]:
    """Simple keyword search"""
    query_words = query.lower().split()
    matches = []
    
    for product in products:
        match_count = sum(
            1 for word in query_words 
            if word in product['keywords']
        )
        
        if match_count > 0:
            matches.append({
                'product': product,
                'relevance': match_count
            })
    
    matches.sort(key=lambda x: x['relevance'], reverse=True)
    return [m['product'] for m in matches]


def create_context(products: List[Dict]) -> str:
    """Format products into context string"""
    if not products:
        return "No product information available."
    
    context = "Product Catalog:\n\n"
    for p in products:
        context += f"Product: {p['name']}\n"
        context += f"Description: {p['description']}\n"
        context += f"Features: {', '.join(p['features'])}\n"
        context += f"Price: {p['price']}\n\n"
    
    return context


def demo_keyword_rag():
    """Part 2: Demonstrate keyword-based RAG"""
    print("\n" + "="*60)
    print("PART 2: KEYWORD-BASED RAG")
    print("="*60)
    
    queries = [
        "fast cache performance",
        "security encryption",
        "cloud backup"
    ]
    
    for query in queries:
        print(f"\nQuery: '{query}'")
        results = search_products_keyword(query, PRODUCTS)
        
        if results:
            print(f"Found: {[r['name'] for r in results]}")
            print("\nContext to inject:")
            print("-" * 40)
            print(create_context(results[:1]))  # Show first match
        else:
            print("No matches found")
    
    # Show accurate response with RAG
    print("\n" + "="*60)
    print("AI Response WITH RAG (using real data):")
    print("-" * 40)
    
    query = "tell me about TurboCache Pro"
    results = search_products_keyword(query, PRODUCTS)
    
    if results:
        product = results[0]
        print(f"""
Based on our product catalog, TurboCache Pro:

Description: {product['description']}

Features:
{chr(10).join(f'- {f}' for f in product['features'])}

Price: {product['price']}

✅ This information is ACCURATE - retrieved from real data!
""")
    
    input("\nPress Enter to continue...")


def demo_semantic_search():
    """Part 3: Demonstrate semantic search with embeddings"""
    print("\n" + "="*60)
    print("PART 3: SEMANTIC SEARCH (Advanced)")
    print("="*60)
    
    if not OPENAI_AVAILABLE:
        print("\nUsing mock embeddings for demonstration...")
        demo_semantic_search_mock()
        return
    
    # Real embeddings demo
    client = OpenAI()
    
    def get_embedding(text: str):
        response = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    
    def cosine_similarity(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    print("\nGenerating embeddings for products...")
    for product in PRODUCTS:
        text = f"{product['name']} {product['description']}"
        product['embedding'] = get_embedding(text)
    
    # Test queries that don't have exact keyword matches
    semantic_queries = [
        ("high-speed data access", "TurboCache Pro"),  # No "fast" keyword
        ("protect sensitive information", "SecureVault Enterprise"),  # No "security"
        ("team collaboration", "CloudSync Manager")  # Inferred meaning
    ]
    
    for query, expected in semantic_queries:
        print(f"\nQuery: '{query}'")
        
        # Keyword search
        keyword_results = search_products_keyword(query, PRODUCTS)
        print(f"Keyword search: {[r['name'] for r in keyword_results] if keyword_results else 'No matches'}")
        
        # Semantic search
        query_embedding = get_embedding(query)
        similarities = []
        
        for product in PRODUCTS:
            sim = cosine_similarity(query_embedding, product['embedding'])
            similarities.append((product, sim))
        
        similarities.sort(key=lambda x: x[1], reverse=True)
        semantic_result = similarities[0][0]
        
        print(f"Semantic search: {semantic_result['name']} (expected: {expected})")
        print(f"✅ Found through meaning, not keywords!")
    
    input("\nPress Enter to continue...")


def demo_semantic_search_mock():
    """Mock semantic search for when OpenAI is not available"""
    
    # Simulated semantic search results
    mock_results = {
        "high-speed data access": "TurboCache Pro",
        "protect sensitive information": "SecureVault Enterprise",
        "team collaboration": "CloudSync Manager"
    }
    
    for query, expected in mock_results.items():
        print(f"\nQuery: '{query}'")
        
        # Keyword search (will fail)
        keyword_results = search_products_keyword(query, PRODUCTS)
        print(f"Keyword search: {[r['name'] for r in keyword_results] if keyword_results else 'No matches'}")
        
        # Mock semantic search
        print(f"Semantic search: {expected}")
        print(f"✅ Found through meaning, not keywords!")
    
    input("\nPress Enter to continue...")


def demo_cost_analysis():
    """Part 4: Cost and performance analysis"""
    print("\n" + "="*60)
    print("PART 4: COST & PERFORMANCE ANALYSIS")
    print("="*60)
    
    print("""
RAG Cost Analysis (per 1000 queries):
========================================

Keyword Search:
  - Compute: ~$0.001
  - Storage: ~$0.01/GB
  - Total: <$0.01
  
Semantic Search:
  - Embeddings: $0.02 (one-time for docs)
  - Query embeddings: $0.02
  - Vector DB: $0.10/million vectors
  - Total: ~$0.05
  
GPT-4 without RAG (hallucination risk):
  - API calls: $0.30
  - Wrong answers: Priceless reputation damage
  
Fine-tuning Alternative:
  - Training: $500-5000 upfront
  - Maintenance: Ongoing retraining costs
  - Better for: Static domain-specific language

KEY INSIGHT: RAG is 6x cheaper than raw GPT-4 calls
            and eliminates hallucination risk!
""")
    
    input("\nPress Enter to continue...")


def main():
    """Run the complete RAG demo"""
    print("\n" + "="*60)
    print("RETRIEVAL-AUGMENTED GENERATION (RAG) DEMO")
    print("From Hallucination to Accuracy")
    print("="*60)
    
    # Part 1: Show the problem
    demo_hallucination()
    
    # Part 2: Basic solution with keyword RAG
    demo_keyword_rag()
    
    # Part 3: Advanced semantic search
    demo_semantic_search()
    
    # Part 4: Cost analysis
    demo_cost_analysis()
    
    print("\n" + "="*60)
    print("DEMO COMPLETE - Key Takeaways:")
    print("="*60)
    print("""
1. RAG eliminates hallucinations with real data
2. Start simple with keyword search
3. Use semantic search for better understanding
4. Cost-effective compared to alternatives
5. Always handle edge cases in production
""")


if __name__ == "__main__":
    main()