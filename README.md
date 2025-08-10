# GenAI Developer Course - Demo & Exercise Repository

This repository contains all demonstration code and hands-on exercises for the Generative AI Developer Course.

## Repository Structure

```
genai-developer-course/
├── section1/                         # Foundations
│   ├── 01_tool_use_demo/           # Demo: LLM limitations without tools
│   ├── 02_password_validator_demo/  # Demo: Copilot vs Claude Code comparison
│   └── 03_currency_formatter_exercise/ # Exercise: CLEAR framework practice
├── section2/                         # Prompting
│   ├── 01_rate_limiter_demo/       # Demo: Basic vs advanced prompts
│   ├── 02_cache_helper_exercise/    # Exercise: Focused prompts with testing
│   ├── 03_thinking_models_demo/     # Demo: o3/Claude reasoning vs standard
│   └── 04_notification_system_exercise/ # Exercise: CoT system design
├── section3/                         # Agents
│   └── (To be implemented)
├── section4/                         # Production
│   └── (To be implemented)
└── shared/                           # Common utilities
    ├── utils/                       # Shared Python utilities
    └── datasets/                    # Course datasets
```

## Activity Types

### 🎭 Demos (Instructor-Led)
Live demonstrations during the course to illustrate concepts:
- **Tool Use API** - Shows why LLMs need tools
- **Password Validator** - Compares AI coding assistants
- **Rate Limiter** - Demonstrates prompt evolution
- **Thinking Models** - Compares reasoning approaches

### 💻 Exercises (Student Hands-On)
Practical activities for students to complete:
- **Currency Formatter** (35 min) - TypeScript with Jest tests
- **Cache Helper** (30 min) - TypeScript with performance optimization
- **Notification System** (30 min) - System design with CoT prompting

## Quick Start

### For Instructors

1. **Section 1 Demos**:
   - `01_tool_use_demo/tool-use-demo.http` - REST Client file for API demos
   - `02_password_validator_demo/` - Python implementation for live coding

2. **Section 2 Demos**:
   - `01_rate_limiter_demo/` - Node.js server with test endpoints
   - `03_thinking_models_demo/` - Prompts and API examples

### For Students

1. **Section 1 Exercise**:
   ```bash
   cd section1/03_currency_formatter_exercise
   npm install
   npm test
   ```

2. **Section 2 Exercises**:
   ```bash
   cd section2/02_cache_helper_exercise
   npm install
   npm test
   ```

## Folder Structure

### Standard Files
Every demo and exercise folder contains:
- `README.md` - Primary instructions and documentation
- Additional supporting files based on activity type

### Exercise Folders Include:
- `README.md` - Exercise instructions and requirements
- `prompt-hints.md` (optional) - Guidance for AI assistance
- `prompt-template.md` (optional) - Template for students to fill out
- Test files to validate solutions
- Starter code (when applicable)

### Demo Folders Include:
- `README.md` - Demo script and teaching notes
- `prompts.md` (optional) - Example prompts for demonstrations
- API examples (`.http` files for REST Client)
- Sample implementations
- Expected outputs

## Environment Setup

### Required Tools
- Node.js 18+ and npm
- Python 3.10+
- VS Code with REST Client extension
- API Keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (for demos)

### Installation
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies for specific exercises
cd section1/03_currency_formatter_exercise
npm install
```

## Progress Tracking

### Completed ✅
- Section 1: All demos and exercises
- Section 2: Rate limiter demo, cache helper exercise

### In Progress 🚧
- Section 2: Thinking models demo, notification system exercise

### Upcoming ⏳
- Section 3: Agent demos and MCP exercise
- Section 4: Test generation exercise

## Contributing

When adding new content:
1. Follow the naming convention: `##_name_[demo|exercise]/`
2. Include clear README with instructions
3. Add test files for exercises
4. Provide sample solutions (in separate files)
5. Update this README and COURSE_ACTIVITIES_TRACKER.md

## Notes for AI Assistants

When helping with exercises:
- Follow the CLEAR framework (Context, Language, Examples, Audience, Refinement)
- Use structured prompts with XML tags when appropriate
- Consider Chain-of-Thought for complex problems
- Provide production-ready code with error handling
- Include comprehensive tests

## Support

For questions or issues:
- Check exercise README files for specific instructions
- Review demo scripts for implementation examples
- Refer to course slides for conceptual understanding