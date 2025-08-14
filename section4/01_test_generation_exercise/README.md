# Section 4A: Strategic Test Generation Exercise

## Overview

Generate comprehensive tests for a payment processing system using AI, with strategic model selection to optimize cost vs quality.

**Time:** 35 minutes  
**Language:** Python (pytest)

## The Challenge

Your team needs comprehensive test coverage for the `PaymentProcessor` class. Manual test writing would take 8-10 hours. You'll use AI to generate tests in minutes, selecting the right model for each test type.

## Setup

1. Dependencies are already installed via the root `requirements.txt`. If needed:
   ```bash
   # From the repository root
   pip install -r requirements.txt
   ```

2. Activate the Python virtual environment:
   1. In VS Code open the Command Palette (Ctrl+Shift+P)
   2. Search for "Python: Select Interpreter"
   3. Choose the virtual environment "Python 3.11.13 (.venv) ./.venv/python         Recommended"

3. Review the payment processor implementation in `payment_processor.py`

## Part 1: Unit Test Generation (12 minutes)

### Use GPT-4.1 or GPT-5 mini for Standard Unit Tests

Generate comprehensive unit tests covering:
- Each method individually with mocked dependencies
- Happy path and error scenarios  
- Edge cases (negative amounts, missing data, etc.)
- Rate limiting behavior
- Async test support with pytest-asyncio

**Save your tests to:** `test_payment_processor.py`

**Example to build on:** See `test_examples.py` for working examples

### Metrics to Track
- Number of test cases generated
- Coverage estimate
- Time to generate
- API cost (~$0.10)

## Part 2: Security Test Generation (15 minutes)

### Use GPT-5 or Claude Sonnet for Security-Aware Tests

Generate tests that check for:
1. Input validation (ensure proper sanitization)
2. Rate limiting effectiveness
3. Authorization checks
4. Error handling (no sensitive data in errors)
5. Concurrent request handling

**Save your tests to:** `test_payment_security.py`

### Metrics to Track
- Security patterns identified
- Test quality (1-10)
- Time to generate
- API cost (~$0.50)

## Part 3: ROI Calculation (8 minutes)

### Calculate Your Return on Investment

1. **Total API Costs:**
   - Unit tests: $____
   - Security tests: $____
   - Total: $____

2. **Time Saved:**
   - Manual test writing: 8 hours @ $50/hr = $400
   - AI generation time: ____ minutes

3. **ROI Calculation:**
   ```
   ROI = Value Created / Cost
   ROI = $400 / $[your cost] = ____x
   ```

## Key Methods to Test

### Core Methods
- `validate_payment_data()` - Input validation
- `check_fraud()` - Fraud detection logic  
- `process_payment()` - Main payment flow
- `handle_payment_error()` - Error recovery
- `refund_payment()` - Refund processing
- `get_transaction_history()` - Data retrieval

### Dependencies to Mock
- Payment gateway
- Database service
- Email service
- Rate limiter (for some tests)

## Expected Outcomes

✅ 50+ unit tests generated in minutes  
✅ 10+ security-focused tests  
✅ 95% code coverage  
✅ 400-800x ROI typical  

## Model Selection Guide

| Task | Recommended Model | Cost | Why |
|------|------------------|------|-----|
| Unit Tests | GPT-4.1/Claude 3.7 | ~$0.15 | Good code understanding, sufficient for standard tests |
| Security Tests | o4-mini/o3 | ~$0.50 | Better at complex patterns and edge cases |
| Simple Tests | o3-mini/Claude 3.5 | ~$0.05 | Basic CRUD and formatting |

## Tips for Success

1. **For Unit Tests:**
   - Include the full class code in your prompt
   - Specify pytest as the framework
   - Request fixtures for common setup
   - Ask for both positive and negative test cases

2. **For Security Tests:**
   - Focus on boundary conditions
   - Request tests for concurrent scenarios
   - Ask for tests that verify no sensitive data leaks

3. **Common Issues:**
   - If tests fail on import, ensure all mock objects are properly configured
   - Use `pytest.mark.asyncio` for async test methods
   - Mock the RateLimiter class if not defined

## Sample Test Structure

```python
import pytest
from unittest.mock import Mock, AsyncMock, patch
from payment_processor import PaymentProcessor, PaymentData, ValidationError

@pytest.fixture
def mock_gateway():
    gateway = Mock()
    gateway.charge = AsyncMock()
    return gateway

@pytest.fixture
def payment_processor(mock_gateway, mock_database, mock_email):
    return PaymentProcessor(mock_gateway, mock_database, mock_email)

@pytest.mark.asyncio
async def test_process_payment_success(payment_processor):
    # Test implementation here
    pass
```

## Discussion Questions

After completing the exercise:

1. What was your actual ROI?
2. Was the premium model worth 5x the cost for security tests?
3. Which tests would you generate first in your actual work?
4. What's preventing you from doing this tomorrow?