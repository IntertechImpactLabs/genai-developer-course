# Tool Use Demo

## Purpose
Demonstrate why LLMs need tools to perform actions beyond text generation.

## Demo Structure

This demo progressively shows:
1. LLM limitations without tools (hallucinated weather data)
2. Adding tool definitions (but no execution)
3. Mock tool execution to show complete flow
4. How this relates to GitHub Copilot and Claude Code

## Files

- `tool-use-demo.http` - REST Client file with OpenAI API examples

## Running the Demo

1. Open `tool-use-demo.http` in VS Code with REST Client extension
2. Set environment variable: `OPENAI_API_KEY`
3. Execute requests in sequence, explaining each step

## Key Teaching Points

1. **Without Tools**: LLM makes up weather data
2. **With Tool Definition**: LLM calls the tool correctly but can't execute
3. **With Mock Execution**: Complete agent-like behavior
4. **Real World**: This is how Copilot and Claude Code work internally

## Time Estimate

- Total: 10 minutes
- Step 1 (no tools): 3 minutes
- Step 2 (with tools): 3 minutes
- Step 3 (mock execution): 3 minutes
- Discussion: 1 minute

## Common Issues

- **API Key Missing**: Ensure `OPENAI_API_KEY` is set
- **Rate Limits**: Wait between requests if needed
- **Network Issues**: Have screenshots as backup