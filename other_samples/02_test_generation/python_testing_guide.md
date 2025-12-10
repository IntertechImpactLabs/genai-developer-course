# Python Testing Quick Start Guide

## What You Need to Know for This Exercise

This guide covers the minimum Python testing knowledge needed to complete the exercise. You don't need to be a Python expert!

## 1. Installing pytest

```bash
# Install testing dependencies
pip install pytest pytest-asyncio pytest-mock

# Verify installation
pytest --version
```

## 2. Basic Test Structure

Every Python test file follows this pattern:

```python
import pytest
from unittest.mock import Mock, AsyncMock

# Import the code you're testing
from payment_processor import PaymentProcessor, PaymentData

# Test functions start with "test_"
def test_something():
    # Arrange: Set up test data
    # Act: Call the function
    # Assert: Check the result
    assert 1 + 1 == 2
```

## 3. Key Concepts for This Exercise

### Test Functions
- Must start with `test_`
- Use `assert` to check conditions
- pytest automatically finds and runs them

### Fixtures (Test Setup)
Fixtures provide reusable test data:

```python
@pytest.fixture
def payment_processor():
    """This runs before each test that uses it."""
    gateway = Mock()  # Fake object
    database = Mock()
    email = Mock()
    return PaymentProcessor(gateway, database, email)

def test_example(payment_processor):
    # payment_processor is automatically provided
    result = payment_processor.validate_payment_data(data)
    assert result is True
```

### Mocking (Fake Objects)
Mocks simulate external dependencies:

```python
# Create a mock object
mock_gateway = Mock()

# Set a return value
mock_gateway.charge.return_value = {"status": "success"}

# For async functions, use AsyncMock
mock_gateway.charge = AsyncMock(return_value={"status": "success"})
```

### Testing Async Functions
For async functions, use `@pytest.mark.asyncio`:

```python
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result == expected_value
```

### Testing Exceptions
Check that errors are raised correctly:

```python
def test_validation_error():
    with pytest.raises(ValidationError, match="Invalid payment"):
        # This should raise ValidationError
        payment_processor.process_payment(bad_data)
```

## 4. Running Tests

```bash
# Run all tests in a file
pytest test_payment_processor.py

# Run with verbose output
pytest test_payment_processor.py -v

# Run a specific test
pytest test_payment_processor.py::test_validation_error

# See print statements (helpful for debugging)
pytest test_payment_processor.py -s
```

## 5. What Your Generated Tests Should Include

When prompting AI to generate tests, ask for:

1. **Test fixtures** - Reusable setup code
2. **Mocked dependencies** - Fake gateway, database, email services
3. **Happy path tests** - When everything works correctly
4. **Error tests** - When things go wrong
5. **Edge cases** - Boundary values, empty data, etc.

## 6. Example Prompt for AI

```
Generate pytest unit tests for this PaymentProcessor class:
- Use unittest.mock for mocking dependencies
- Include fixtures for common setup
- Test both success and failure cases
- Use pytest.mark.asyncio for async tests
- Mock the gateway, database, and email services
- Test validation with invalid data
- Test rate limiting behavior

[paste PaymentProcessor code here]
```

## Common Patterns You'll See

### Pattern 1: Testing a validation method
```python
def test_validate_payment_data_invalid_amount(payment_processor):
    data = PaymentData(
        user_id="user123",
        amount=-100,  # Invalid negative amount
        currency="USD",
        card_number="4111 1111 1111 1111",
        cvv="123",
        email="test@example.com"
    )
    
    result = payment_processor.validate_payment_data(data)
    assert result is False
```

### Pattern 2: Testing with mocked dependencies
```python
@pytest.mark.asyncio
async def test_process_payment_success(payment_processor, mock_gateway):
    # Setup mock to return success
    mock_gateway.charge.return_value = {"status": "success"}
    
    # Call the method
    result = await payment_processor.process_payment(valid_data)
    
    # Check the result
    assert result["status"] == "success"
    
    # Verify mock was called
    mock_gateway.charge.assert_called_once()
```

### Pattern 3: Testing error handling
```python
@pytest.mark.asyncio
async def test_rate_limit_error(payment_processor):
    # Make rate limiter reject requests
    payment_processor.rate_limiter.allow = Mock(return_value=False)
    
    # Should raise RateLimitError
    with pytest.raises(RateLimitError):
        await payment_processor.process_payment(valid_data)
```

## Tips for Success

1. **Start simple** - Get one test working before adding complexity
2. **Use the error messages** - pytest gives helpful error details
3. **Mock external dependencies** - Don't actually call databases or APIs
4. **Test one thing per test** - Keep tests focused and simple
5. **Name tests clearly** - `test_process_payment_with_invalid_card_number`

## Quick Reference

| Concept | Syntax |
|---------|--------|
| Basic test | `def test_name(): assert condition` |
| Fixture | `@pytest.fixture` |
| Mock object | `Mock()` or `AsyncMock()` |
| Async test | `@pytest.mark.asyncio` |
| Test exception | `with pytest.raises(ErrorType):` |
| Run tests | `pytest filename.py -v` |

## Ready to Start!

You now have enough knowledge to complete the exercise. Remember:
1. Let AI generate the test structure
2. Review what it creates
3. Run the tests to see them work
4. Calculate your ROI based on time saved!