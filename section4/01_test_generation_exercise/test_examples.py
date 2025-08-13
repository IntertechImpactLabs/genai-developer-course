"""
Example tests for PaymentProcessor to demonstrate testing patterns.
Students should create their own test_payment_processor.py file.

To run these example tests:
    pytest example_tests.py -v
"""

import pytest
from unittest.mock import Mock, AsyncMock
from payment_processor import (
    PaymentProcessor, 
    PaymentData,
    ValidationError,
    RateLimitError,
    FraudError
)


# FIXTURES - Reusable test setup
@pytest.fixture
def mock_gateway():
    """Create a mock payment gateway."""
    gateway = Mock()
    # Make charge method async and return success
    gateway.charge = AsyncMock(return_value={
        'transaction_id': 'txn_test_123',
        'status': 'success',
        'amount': 100.00
    })
    return gateway


@pytest.fixture
def mock_database():
    """Create a mock database."""
    db = Mock()
    db.save_transaction = AsyncMock()
    db.log_error = AsyncMock()
    return db


@pytest.fixture
def mock_email():
    """Create a mock email service."""
    email = Mock()
    email.send_receipt = AsyncMock()
    email.send_fraud_alert = AsyncMock()
    email.send_payment_failure = AsyncMock()
    return email


@pytest.fixture
def payment_processor(mock_gateway, mock_database, mock_email):
    """Create a PaymentProcessor with all mocked dependencies."""
    return PaymentProcessor(mock_gateway, mock_database, mock_email)


@pytest.fixture
def valid_payment_data():
    """Create valid payment data for testing."""
    return PaymentData(
        user_id='test_user_123',
        amount=50.00,
        currency='USD',
        card_number='4111 1111 1111 1111',  # Test card number
        cvv='123',
        email='test@example.com',
        billing_zip='12345'
    )


# EXAMPLE TESTS - These work! Run them to see.

def test_validate_payment_data_with_valid_data(payment_processor, valid_payment_data):
    """Test that valid payment data passes validation."""
    # Act
    result = payment_processor.validate_payment_data(valid_payment_data)
    
    # Assert
    assert result is True


def test_validate_payment_data_with_negative_amount(payment_processor, valid_payment_data):
    """Test that negative amounts fail validation."""
    # Arrange - modify the valid data to be invalid
    valid_payment_data.amount = -10.00
    
    # Act
    result = payment_processor.validate_payment_data(valid_payment_data)
    
    # Assert
    assert result is False


def test_validate_payment_data_with_invalid_card_length(payment_processor, valid_payment_data):
    """Test that invalid card numbers fail validation."""
    # Arrange - card number too short
    valid_payment_data.card_number = '1234'
    
    # Act
    result = payment_processor.validate_payment_data(valid_payment_data)
    
    # Assert
    assert result is False


@pytest.mark.asyncio
async def test_process_payment_success(payment_processor, valid_payment_data, mock_gateway, mock_email):
    """Test successful payment processing."""
    # Act - process a valid payment
    result = await payment_processor.process_payment(valid_payment_data)
    
    # Assert - check the result
    assert result['status'] == 'success'
    assert result['transaction_id'] == 'txn_test_123'
    
    # Verify mocks were called
    mock_gateway.charge.assert_called_once_with(valid_payment_data)
    mock_email.send_receipt.assert_called_once()


@pytest.mark.asyncio
async def test_process_payment_with_validation_error(payment_processor):
    """Test that invalid data raises ValidationError."""
    # Arrange - create invalid payment data
    invalid_data = PaymentData(
        user_id='test_user',
        amount=0,  # Invalid: amount must be > 0
        currency='USD',
        card_number='4111 1111 1111 1111',
        cvv='123',
        email='test@example.com'
    )
    
    # Act & Assert - should raise ValidationError
    with pytest.raises(ValidationError, match="Invalid payment data"):
        await payment_processor.process_payment(invalid_data)


# TODO: Add more tests here!
# 
# Suggested tests to add:
# - test_process_payment_rate_limit_exceeded
# - test_process_payment_fraud_detected  
# - test_validate_payment_data_missing_email
# - test_validate_payment_data_invalid_currency
# - test_check_fraud_high_amount
# - test_handle_payment_error_insufficient_funds
# - test_refund_payment_success
# - test_refund_payment_exceeds_original_amount
#
# Use AI to generate these tests based on the patterns above!