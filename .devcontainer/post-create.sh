#!/bin/bash
set -e

echo "=== Setting up development environment ==="

# 1. Create Python virtual environment in workspace root
echo "Creating Python virtual environment..."
python -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# 2. Install Python packages from requirements.txt
if [ -f "requirements.txt" ]; then
    echo "Installing Python packages from requirements.txt..."
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "No requirements.txt found, skipping Python package installation"
fi

# 3. Recursively find and install npm packages
echo "Looking for package.json files and installing npm dependencies..."
find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/.venv/*" | while read -r package_file; do
    dir=$(dirname "$package_file")
    echo "Installing npm packages in $dir..."
    (cd "$dir" && npm install)
done

# Install global packages
echo "Installing global npm packages..."
npm install -g @anthropic-ai/claude-code

echo "=== Development environment setup complete ==="