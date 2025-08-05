# GenAI Course

Complete repository for the Generative AI developer course with organized sections, demos, and exercises.

## Repository Structure

```
genai-course/
├── section1/
│   ├── part-a/
│   │   ├── demo1/          # First demo
│   │   ├── demo2/          # Second demo (current)
│   │   └── exercises/      # Practice exercises
│   └── part-b/             # Advanced topics
├── section2/               # Future sections
├── section3/               # Future sections
├── shared/                 # Common utilities and datasets
│   ├── utils/             # Shared Python utilities
│   └── datasets/          # Course datasets
└── .vscode/               # Launch configurations
```

## Getting Started

1. **Open in Dev Container**: Use VS Code and reopen in the configured dev container
2. **Select Launch Profile**: Use `Ctrl+Shift+P` → "Debug: Select and Start Debugging" to choose your demo
3. **Run Code**: Each demo has its own launch configuration with proper Python paths

## Launch Profiles

Available launch configurations:
- **Section 1 - Part A - Demo 1**: First demonstration
- **Section 1 - Part A - Demo 2**: Second demonstration (current)
- **Section 1 - Part A - Exercise 1**: Practice exercise
- **Section 1 - Part B - Demo 1**: Advanced demo
- **Section 2 - Demo 1**: Future section
- **Section 3 - Demo 1**: Future section

## Development

- **Dependencies**: All packages listed in `requirements.txt`
- **Shared Code**: Use `shared/utils/` for common functions
- **Testing**: Each demo has its own `tests/` directory
- **Python Path**: Launch configs automatically set PYTHONPATH for imports

## Adding New Content

1. Create new demo/exercise directory following the structure
2. Add corresponding launch configuration in `.vscode/launch.json`
3. Update this README with navigation details