"""
Payment processing system for e-commerce platform.
This module handles payment transactions, fraud detection, and rate limiting.
"""

import asyncio
import random
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime


class ValidationError(Exception):
    """Raised when payment data validation fails."""
    pass


class RateLimitError(Exception):
    """Raised when rate limit is exceeded."""
    pass


class FraudError(Exception):
    """Raised when payment is flagged as fraudulent."""
    pass


class PaymentGatewayError(Exception):
    """Raised when payment gateway encounters an error."""
    def __init__(self, message: str, code: Optional[str] = None):
        super().__init__(message)
        self.code = code


@dataclass
class PaymentData:
    """Payment transaction data."""
    user_id: str
    amount: float
    currency: str
    card_number: str
    cvv: str
    email: str
    billing_zip: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class TransactionResult:
    """Result of a payment transaction."""
    transaction_id: str
    status: str
    amount: float
    currency: str
    timestamp: datetime
    gateway_response: Dict[str, Any]


class RateLimiter:
    """Simple rate limiter implementation."""
    
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}
    
    def allow(self, user_id: str) -> bool:
        """Check if request is allowed for user."""
        now = datetime.now()
        
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # Clean old requests
        self.requests[user_id] = [
            timestamp for timestamp in self.requests[user_id]
            if (now - timestamp).seconds < self.window_seconds
        ]
        
        if len(self.requests[user_id]) >= self.max_requests:
            return False
        
        self.requests[user_id].append(now)
        return True


class PaymentProcessor:
    """
    Main payment processing class.
    Handles validation, fraud detection, rate limiting, and payment processing.
    """
    
    def __init__(self, gateway, database, email_service):
        """
        Initialize payment processor with dependencies.
        
        Args:
            gateway: Payment gateway service
            database: Database service for transaction storage
            email_service: Email notification service
        """
        self.gateway = gateway
        self.db = database
        self.email = email_service
        self.rate_limiter = RateLimiter(100, 60)  # 100 requests per minute
        self.fraud_threshold = 0.8
    
    async def process_payment(self, payment_data: PaymentData) -> Dict[str, Any]:
        """
        Process a payment transaction.
        
        Args:
            payment_data: Payment details
            
        Returns:
            Transaction result dictionary
            
        Raises:
            ValidationError: If payment data is invalid
            RateLimitError: If rate limit is exceeded
            FraudError: If payment is flagged as fraudulent
            PaymentGatewayError: If payment processing fails
        """
        # Step 1: Validate payment data
        if not self.validate_payment_data(payment_data):
            raise ValidationError("Invalid payment data")
        
        # Step 2: Check rate limiting
        if not self.rate_limiter.allow(payment_data.user_id):
            raise RateLimitError(f"Too many payment attempts for user {payment_data.user_id}")
        
        # Step 3: Perform fraud check
        fraud_score = await self.check_fraud(payment_data)
        if fraud_score > self.fraud_threshold:
            await self.email.send_fraud_alert(payment_data)
            raise FraudError(f"Payment flagged as fraudulent (score: {fraud_score:.2f})")
        
        # Step 4: Process payment through gateway
        try:
            result = await self.gateway.charge(payment_data)
            
            # Step 5: Save transaction to database
            await self.db.save_transaction(result)
            
            # Step 6: Send receipt email
            await self.email.send_receipt(payment_data.email, result)
            
            return result
            
        except Exception as error:
            await self.handle_payment_error(error, payment_data)
            raise
    
    def validate_payment_data(self, data: PaymentData) -> bool:
        """
        Validate payment data for required fields and constraints.
        
        Args:
            data: Payment data to validate
            
        Returns:
            True if valid, False otherwise
        """
        # Check required fields
        if not all([data.user_id, data.email, data.card_number, data.cvv, data.currency]):
            return False
        
        # Validate amount
        if data.amount <= 0 or data.amount > 10000:
            return False
        
        # Basic card number validation (length check)
        if len(data.card_number.replace(" ", "")) != 16:
            return False
        
        # CVV validation
        if not (3 <= len(data.cvv) <= 4):
            return False
        
        # Currency validation
        valid_currencies = ["USD", "EUR", "GBP", "CAD"]
        if data.currency not in valid_currencies:
            return False
        
        return True
    
    async def check_fraud(self, data: PaymentData) -> float:
        """
        Perform fraud detection on payment data.
        
        Args:
            data: Payment data to check
            
        Returns:
            Fraud score between 0 and 1 (higher = more likely fraud)
        """
        # Simplified fraud detection for demo purposes
        # In production, this would use ML models and various signals
        
        score = 0.0
        
        # High amount increases fraud score
        if data.amount > 5000:
            score += 0.3
        elif data.amount > 2000:
            score += 0.2
        
        # Missing billing zip increases score
        if not data.billing_zip:
            score += 0.2
        
        # Suspicious email patterns
        if "test" in data.email.lower() or "temp" in data.email.lower():
            score += 0.3
        
        # Add some randomness for demo purposes
        score += random.random() * 0.3
        
        return min(score, 1.0)
    
    async def handle_payment_error(self, error: Exception, payment_data: PaymentData):
        """
        Handle payment processing errors.
        
        Args:
            error: The error that occurred
            payment_data: Payment data associated with the error
        """
        # Log error to database
        await self.db.log_error({
            'error_type': type(error).__name__,
            'error_message': str(error),
            'user_id': payment_data.user_id,
            'amount': payment_data.amount,
            'timestamp': datetime.now()
        })
        
        # Send appropriate notification based on error type
        if isinstance(error, PaymentGatewayError):
            if error.code == "INSUFFICIENT_FUNDS":
                await self.email.send_payment_failure(
                    payment_data.email,
                    "Payment failed due to insufficient funds"
                )
            elif error.code == "CARD_DECLINED":
                await self.email.send_payment_failure(
                    payment_data.email,
                    "Your card was declined"
                )
        
    async def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """
        Process a refund for a previous transaction.
        
        Args:
            transaction_id: ID of the transaction to refund
            amount: Optional partial refund amount
            
        Returns:
            Refund result dictionary
        """
        # Fetch original transaction
        transaction = await self.db.get_transaction(transaction_id)
        if not transaction:
            raise ValueError(f"Transaction {transaction_id} not found")
        
        # Determine refund amount
        refund_amount = amount or transaction['amount']
        if refund_amount > transaction['amount']:
            raise ValueError("Refund amount exceeds original transaction")
        
        # Process refund through gateway
        result = await self.gateway.refund(transaction_id, refund_amount)
        
        # Record refund in database
        await self.db.save_refund(result)
        
        return result
    
    async def get_transaction_history(self, user_id: str, limit: int = 10) -> list:
        """
        Get transaction history for a user.
        
        Args:
            user_id: User ID to fetch history for
            limit: Maximum number of transactions to return
            
        Returns:
            List of transaction records
        """
        return await self.db.get_user_transactions(user_id, limit)