# Section 2B: Chain-of-Thought Exercise

## Exercise: Multi-Component System Design (30 minutes)

### The Challenge
Design a real-time notification system for a social media platform with complex requirements.

### System Requirements

**Scale & Performance:**
- 10 million users
- 1,000 notifications/second peak load
- <100ms delivery latency for push notifications
- 99.9% delivery guarantee

**Delivery Channels:**
- Push notifications (iOS/Android)
- Email (transactional and digest)
- SMS (critical alerts only)
- In-app notifications

**Features:**
- User preference management
- Rate limiting per user/channel
- Retry logic with exponential backoff
- Analytics and delivery tracking
- A/B testing support

**Constraints:**
- Budget: $5,000/month infrastructure
- Team: 3 developers
- Timeline: 2 months to production
- Must integrate with existing PostgreSQL database
- GDPR compliant (EU users)

### Your Task

#### Part 1: Model Selection (5 minutes)

Choose your approach and explain why:

**Option A: Standard Model with CoT**
```xml
<reasoning>
Step 1: Analyze requirements and constraints
Step 2: Design system architecture
Step 3: Select technology stack
Step 4: Plan data flow and storage
Step 5: Design monitoring and scaling strategy
</reasoning>

<architecture>
[Your detailed solution here]
</architecture>
```

**Option B: Thinking Model (o3/Claude Reasoning)**
```
Design a notification system for 10M users, 1K notifications/sec, multiple channels, with $5K/month budget. Include architecture, implementation plan, and monitoring.
```

#### Part 2: System Design (15 minutes)

Using your chosen approach, generate:

1. **System Architecture**
   - Component diagram
   - Data flow
   - Service boundaries
   
2. **Technology Stack**
   - Message queue (e.g., SQS, RabbitMQ, Kafka)
   - Storage (e.g., PostgreSQL, Redis, DynamoDB)
   - Delivery services (e.g., SNS, SendGrid, Twilio)
   
3. **Implementation Strategy**
   - Database schema
   - API design
   - Queue architecture
   - Retry mechanism
   
4. **Monitoring & Operations**
   - Key metrics to track
   - Alerting thresholds
   - Debugging approach

#### Part 3: Implementation Plan (10 minutes)

Create a markdown implementation plan following the template:

```markdown
# Implementation Plan: Notification System

## Overview
[Brief description]

## Current Status
Session: 1
Progress: 0%

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up message queue infrastructure
- [ ] Create notification service skeleton
- [ ] Design database schema
- [ ] Implement basic push notification

### Phase 2: Multi-Channel (Week 3-4)
- [ ] Add email integration
- [ ] Add SMS integration
- [ ] Implement channel preference logic
- [ ] Create rate limiting

### Phase 3: Reliability (Week 5-6)
- [ ] Add retry logic
- [ ] Implement circuit breakers
- [ ] Create dead letter queues
- [ ] Add monitoring

### Phase 4: Scale & Polish (Week 7-8)
- [ ] Load testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deployment automation

## Technical Decisions
[Key choices and rationale]

## Open Questions
[Unresolved issues]
```

### Sample Solutions

#### Sample CoT Prompt (Standard Model)

```xml
<thinking>
Analyzing notification system requirements:

1. Scale Analysis:
   - 10M users, 1K/sec = need distributed queue
   - Multiple channels = need routing logic
   - 99.9% delivery = need retry mechanism

2. Architecture Pattern:
   - Event-driven with message queues
   - Microservices for each channel
   - Circuit breakers for external services

3. Technology Selection:
   - Queue: SQS (managed, scales automatically)
   - Storage: PostgreSQL + Redis cache
   - Delivery: SNS, SendGrid, Twilio

4. Data Design:
   - Notifications table (id, user_id, type, payload)
   - User_preferences (user_id, channel, enabled)
   - Delivery_logs (notification_id, status, attempts)

5. Monitoring:
   - CloudWatch for queue depth
   - Datadog for application metrics
   - PagerDuty for critical alerts
</thinking>

<solution>
[Detailed implementation based on reasoning]
</solution>
```

#### Sample Thinking Model Prompt

```
Design notification system:
- 10M users, 1K notifications/sec
- Push, email, SMS, in-app channels
- User preferences, rate limiting, retries
- $5K/month budget, 3 developers, 2 months
- PostgreSQL existing, GDPR compliant

Provide complete architecture, implementation plan, and cost breakdown.
```

### Expected Outputs

Your solution should include:

1. **Architecture Diagram** (text representation)
```
Users → API Gateway → Notification Service
                           ↓
                    Message Queue (SQS)
                    ↙    ↓     ↓    ↘
            Push    Email   SMS   In-App
            Service Service Service Service
```

2. **Database Schema**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP,
    INDEX idx_user_created (user_id, created_at)
);

CREATE TABLE user_preferences (
    user_id BIGINT,
    channel VARCHAR(20),
    enabled BOOLEAN,
    rate_limit INT,
    PRIMARY KEY (user_id, channel)
);

CREATE TABLE delivery_logs (
    notification_id UUID,
    channel VARCHAR(20),
    status VARCHAR(20),
    attempts INT,
    delivered_at TIMESTAMP,
    INDEX idx_notification (notification_id)
);
```

3. **Cost Estimate**
```
- SQS: $0.40 per million requests = $1,200/month
- SNS: $0.50 per million push = $500/month
- SendGrid: 100K emails = $89/month
- Twilio: 10K SMS = $75/month
- Redis: ElastiCache t3.medium = $50/month
- EC2: 3x t3.large = $180/month
- Total: ~$2,100/month (well under budget)
```

### Evaluation Criteria

Your solution will be evaluated on:

1. **Completeness** (25%)
   - All requirements addressed
   - All channels implemented
   - Monitoring included

2. **Scalability** (25%)
   - Can handle 10x growth
   - Efficient resource usage
   - Proper caching strategy

3. **Reliability** (25%)
   - Retry mechanism robust
   - Circuit breakers in place
   - Graceful degradation

4. **Practicality** (25%)
   - Within budget constraints
   - Achievable in 2 months
   - Maintainable by small team

### Common Pitfalls to Avoid

1. **Over-engineering**: Don't use Kafka for 1K messages/sec
2. **Under-specifying**: Include concrete technology choices
3. **Ignoring constraints**: Stay within $5K budget
4. **Missing GDPR**: Include data retention/deletion strategy
5. **No monitoring**: Always include observability

### Bonus Challenge

If you finish early, add:

1. **A/B Testing Framework**
   - How to route users to experiments
   - Metrics collection strategy
   - Statistical significance calculation

2. **Digest Notifications**
   - Batching logic for email digests
   - Optimal send time calculation
   - User engagement tracking

3. **Machine Learning Enhancement**
   - Optimal channel prediction
   - Send time optimization
   - Content personalization

### Discussion Questions

After completing the exercise:

1. How did your approach differ between CoT and thinking models?
2. What trade-offs did you make for the budget constraint?
3. How would you handle a 10x traffic spike?
4. What's your strategy for debugging delivery failures?
5. How would you implement gradual rollout?

### Resources

- [AWS SQS Pricing](https://aws.amazon.com/sqs/pricing/)
- [SendGrid Pricing](https://sendgrid.com/pricing/)
- [Twilio SMS Pricing](https://www.twilio.com/sms/pricing)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Notification System Design](https://highscalability.com/blog/2014/9/15/how-we-built-a-distributed-notification-system.html)

---

*Remember: The goal isn't perfection, but demonstrating how Chain-of-Thought and thinking models approach complex problems differently.*