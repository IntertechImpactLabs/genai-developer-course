# Implementation Plan: Database Performance Optimization

## Overview
Optimizing e-commerce product search from 2.3s to <200ms response time using PostgreSQL optimizations, caching, and query improvements.

## Current Status
Last updated: 2025-01-10  
Session: 1  
Progress: 15% complete

## Technical Context
- **Database**: PostgreSQL 14 on AWS RDS (db.m5.large)
- **Data Volume**: 50K users, 200K orders, 10K products
- **Current Performance**: 2.3s product search latency
- **Target**: <200ms response time
- **Budget**: $500/month infrastructure

## Implementation Plan

### Phase 1: Quick Wins ✅
- [x] Analyze current query patterns with EXPLAIN ANALYZE
- [x] Identify missing indexes
- [ ] Add basic B-tree indexes for foreign keys
- [ ] Implement connection pooling (pgBouncer)

### Phase 2: Search Optimization 🚧
- [ ] Replace LIKE '%term%' with PostgreSQL full-text search
- [ ] Create GIN indexes for text search
- [ ] Implement trigram similarity search fallback
- [ ] Add materialized view for popular searches

### Phase 3: Caching Layer ⏳
- [ ] Set up Redis for query result caching
- [ ] Implement cache warming for popular products
- [ ] Add cache invalidation strategy
- [ ] Create application-level cache for static data

### Phase 4: Advanced Optimizations ⏳
- [ ] Partition orders table by date
- [ ] Set up read replica for search queries
- [ ] Implement query result pagination
- [ ] Add database query monitoring

### Phase 5: Testing & Monitoring ⏳
- [ ] Load testing with 10x current volume
- [ ] Set up performance monitoring dashboard
- [ ] Create alerting for slow queries
- [ ] Document runbooks for common issues

## Session Notes

### Session 1 (2025-01-10)
**Discoveries:**
- Main bottleneck: `LIKE '%search%'` causing full table scans
- Missing indexes on foreign keys causing slow JOINs
- No connection pooling - each request opens new connection
- Query returns all columns when only 5 needed

**Completed:**
```sql
-- Analyzed slow query
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM products 
WHERE name LIKE '%laptop%';
-- Result: Seq Scan, 2300ms execution

-- Identified missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'products';
```

**Next Actions:**
1. Install pg_trgm extension for trigram search
2. Create GIN index on products.name
3. Rewrite query to use text search instead of LIKE

**Blockers:**
- Need DBA approval for pg_trgm extension
- Unsure about cache invalidation strategy for real-time inventory

## Technical Decisions

### Indexing Strategy
```sql
-- Text search index (chosen approach)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_gin ON products 
USING gin(name gin_trgm_ops);

-- Alternative considered: Full-text search
-- Rejected because: Overkill for product names
```

### Caching Architecture
- **L1 Cache**: Application memory (100 most popular products)
- **L2 Cache**: Redis with 5-minute TTL
- **Cache Key Pattern**: `search:{query_hash}:{page}:{sort}`
- **Invalidation**: Time-based + event-driven for inventory changes

### Query Optimization
```sql
-- Original (2.3s)
SELECT * FROM products 
WHERE name LIKE '%laptop%';

-- Optimized (<200ms)
SELECT id, name, price, image_url, in_stock
FROM products
WHERE name % 'laptop'  -- Trigram similarity
ORDER BY similarity(name, 'laptop') DESC
LIMIT 20;
```

## Performance Metrics

### Baseline (Before)
- Search latency: 2.3s (p50), 4.5s (p95)
- Database CPU: 78% during peak
- Connection pool: None (opening 50-100 connections/sec)

### Target Metrics
- Search latency: <200ms (p50), <500ms (p95)
- Database CPU: <50% during peak
- Connection pool: 20 connections max

### Current Progress
- Latency improvement: 2.3s → 1.8s (after query analysis)
- Next milestone: <1s after adding indexes

## Code Changes Required

### 1. Database Migration
```javascript
// migrations/001_add_search_indexes.js
exports.up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  await knex.raw(`
    CREATE INDEX CONCURRENTLY idx_products_name_gin 
    ON products USING gin(name gin_trgm_ops)
  `);
};
```

### 2. Search Service Update
```javascript
// services/productSearch.js
class ProductSearchService {
  async search(term, limit = 20) {
    // Check L1 cache
    const cached = this.memoryCache.get(term);
    if (cached) return cached;
    
    // Check L2 cache (Redis)
    const redisKey = `search:${hash(term)}`;
    const redisCached = await redis.get(redisKey);
    if (redisCached) return JSON.parse(redisCached);
    
    // Query database with optimized search
    const results = await db.query(`
      SELECT id, name, price, image_url, in_stock
      FROM products
      WHERE name % $1
      ORDER BY similarity(name, $1) DESC
      LIMIT $2
    `, [term, limit]);
    
    // Cache results
    await this.cacheResults(term, results);
    return results;
  }
}
```

### 3. Connection Pool Configuration
```javascript
// config/database.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'ecommerce',
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Testing Plan

### Load Testing Script
```bash
# Using Apache Bench
ab -n 10000 -c 100 \
  -H "Content-Type: application/json" \
  "http://api.example.com/search?q=laptop"

# Expected results:
# - Response time <200ms for 95% of requests
# - No errors under 100 concurrent connections
# - Database CPU <50%
```

### Test Scenarios
1. Single term search: "laptop"
2. Multi-word search: "gaming laptop 16gb"
3. Typo tolerance: "laptp" → finds "laptop"
4. Special characters: "laptop's"
5. No results: "xyz123abc"

## Open Questions

1. **Cache Invalidation**: How to handle real-time inventory updates?
   - Option A: Short TTL (5 min) - simple but may show stale data
   - Option B: Event-driven invalidation - complex but accurate
   
2. **Search Relevance**: Should we add ML-based ranking?
   - Current: Simple trigram similarity
   - Potential: Elasticsearch for advanced relevance
   
3. **Scaling Strategy**: When do we need to shard?
   - Current: 10K products fits in single instance
   - At 100K products: Consider partitioning
   - At 1M products: Definitely need sharding

## Rollback Plan

If optimizations cause issues:

1. **Immediate rollback**: Remove new indexes
   ```sql
   DROP INDEX CONCURRENTLY idx_products_name_gin;
   ```

2. **Revert code changes**: Deploy previous version
   ```bash
   git revert HEAD
   kubectl rollout undo deployment/search-api
   ```

3. **Clear caches**: Flush Redis to prevent stale data
   ```bash
   redis-cli FLUSHDB
   ```

## Next Session Goals

### Session 2 Focus
1. Implement GIN indexes (pending DBA approval)
2. Deploy Redis caching layer
3. Update search service with new query logic
4. Run initial load tests
5. Document performance improvements

### Success Criteria
- [ ] Search latency <1s for 90% of queries
- [ ] All existing tests still passing
- [ ] No increase in error rate
- [ ] Monitoring dashboard operational

## AI Assistant Instructions

When continuing this optimization work:

1. **Read this plan first** to understand current progress
2. **Check session notes** for latest discoveries and blockers
3. **Follow the phase sequence** - complete Phase 2 before starting Phase 3
4. **Update metrics** after each optimization
5. **Document decisions** with reasoning in Technical Decisions section
6. **Test each change** before marking tasks complete

### Specific Prompts for Next Session

```
Continue the database optimization project:
1. Read IMPLEMENTATION_PLAN.md for context
2. Focus on Phase 2: Search Optimization
3. Implement GIN indexes as specified
4. Update the plan with results
```

```
Review the cache invalidation options in Open Questions.
Recommend approach based on:
- 5% of products update hourly
- Real-time inventory critical for checkout
- Redis available with 2GB RAM
```

## Resources

- [PostgreSQL Text Search Documentation](https://www.postgresql.org/docs/current/textsearch.html)
- [pg_trgm Module](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [pgBouncer Configuration](https://www.pgbouncer.org/config.html)

---

*This implementation plan is a living document. Update after each session to maintain context for AI assistants and team members.*