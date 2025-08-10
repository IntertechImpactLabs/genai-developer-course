# Section 2B: Thinking Models & Chain-of-Thought Demo Materials

## Overview

This directory contains demonstration materials for Section 2 Part B: Advanced Prompting Patterns, focusing on Chain-of-Thought (CoT) prompting and thinking models (o3, Claude reasoning mode).

## Demo Structure (10 minutes)

### Part 1: Standard Model with CoT (3 min)
- Use GPT-4o or Claude standard mode
- Apply explicit Chain-of-Thought prompting
- Show structured reasoning approach

### Part 2: Thinking Model (3 min)  
- Use o3-mini or Claude reasoning mode
- Minimal prompt, no explicit CoT needed
- Demonstrate internal reasoning capabilities

### Part 3: Comparison (2 min)
- Response time: 5s vs 20s
- Cost: $0.02 vs $0.06
- Quality: Good vs Excellent for complex tasks

### Buffer: Q&A (2 min)

## Files in This Directory

### 1. `prompts.md`
Complete collection of prompts for the database optimization demo:
- Standard model with XML-structured CoT
- Thinking model minimal prompts
- Claude reasoning mode examples
- Comparison scenarios

### 2. `api-demos.http`
Live API examples using REST Client extension:
- Anthropic Claude (standard and reasoning modes)
- OpenAI GPT-4o with CoT
- OpenAI o3-mini reasoning model
- Side-by-side comparisons

**Requirements:**
- VS Code with REST Client extension
- Environment variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

### 3. `implementation-plan-example.md`
Production-ready implementation plan template showing:
- How to maintain context across AI sessions
- Tracking progress and decisions
- Combining CoT with project management
- Real database optimization example

### 4. `exercise-instructions.md`
30-minute hands-on exercise:
- Design a notification system (10M users, 1K/sec)
- Choose between CoT and thinking models
- Create implementation plan
- Includes solution examples and evaluation criteria

## Quick Start for Instructors

### Pre-Demo Setup (5 minutes before)
1. Open two browser tabs:
   - Tab 1: ChatGPT or Claude
   - Tab 2: ChatGPT with o3 access (if available)
2. Open `api-demos.http` in VS Code
3. Have `prompts.md` ready for copy/paste
4. Start timer/stopwatch for timing comparisons

### Demo Flow

1. **Introduction** (1 min)
   - "Complex problems need structured reasoning"
   - "Two approaches: guided CoT vs thinking models"

2. **Standard + CoT Demo** (3 min)
   - Copy prompt from `prompts.md`
   - Paste into ChatGPT/Claude
   - Point out structured reasoning steps
   - Note response time

3. **Thinking Model Demo** (3 min)
   - Use minimal prompt
   - Explain the waiting time
   - Compare depth of analysis
   - Show creative solutions

4. **Wrap-up** (2 min)
   - Show cost comparison
   - Discuss when to use each
   - Connect to next section

### Backup Plan

If models are unavailable:
1. Use pre-captured screenshots (create these in advance)
2. Focus on the conceptual differences
3. Use `api-demos.http` to show the API structure
4. Emphasize the decision framework over specific outputs

## Key Teaching Points

### 1. Task Complexity Assessment
- **Simple** (<3 steps): No CoT needed
- **Medium** (3-5 steps): CoT helps significantly  
- **Complex** (5+ steps): Consider thinking models

### 2. Cost-Performance Trade-offs
- 3x cost difference
- 4x time difference
- 50-100% accuracy improvement on complex tasks

### 3. When to Use Each Approach

**Standard Model + CoT:**
- Daily development tasks
- Need reasoning transparency
- Cost-sensitive projects
- Quick iterations

**Thinking Models:**
- Complex debugging
- Architecture decisions
- Algorithm design
- High-stakes problems

## Common Questions & Answers

**Q: "Is the extra cost worth it?"**
A: For complex bugs that could take hours to solve manually, yes. For routine tasks, no.

**Q: "Can I see the thinking process?"**
A: Only Claude shows thinking (in tags). OpenAI's o3 keeps reasoning internal.

**Q: "Should I always use thinking models for production?"**
A: No - use the simplest approach that reliably solves your problem.

## Troubleshooting

### Issue: Models give similar outputs
- Focus on process differences
- Point out subtle improvements
- Emphasize the time/cost trade-offs

### Issue: Demo taking too long
- Start o3 query during explanation
- Have pre-generated examples ready
- Show partial results

### Issue: API calls failing
- Check API keys in environment
- Verify model availability
- Use backup screenshots

## Exercise Support

For the 30-minute exercise:
1. Participants design a notification system
2. They choose CoT vs thinking approach
3. Provide `exercise-instructions.md` 
4. Walk around to help with prompts
5. Share 2-3 solutions at the end

## Additional Resources

- [Claude Extended Thinking Tips](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips)
- [OpenAI Reasoning Best Practices](https://platform.openai.com/docs/guides/reasoning)
- [Chain-of-Thought Paper](https://arxiv.org/abs/2201.11903)

## Time Management

Total: 45 minutes
- Slides: 30 min
- Demo: 10 min  
- Exercise intro: 2 min
- Exercise work time: (concurrent with next break)
- Discussion: 3 min

## Success Metrics

Participants should understand:
1. ✅ When to use CoT vs thinking models
2. ✅ How to structure CoT prompts
3. ✅ Cost-performance trade-offs
4. ✅ How to create implementation plans
5. ✅ Strategic model selection for their projects

---

*Remember: Focus on practical application over theory. Show real trade-offs and let participants decide what fits their needs.*