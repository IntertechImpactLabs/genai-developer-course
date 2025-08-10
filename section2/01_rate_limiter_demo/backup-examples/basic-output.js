// Simple in-memory rate limiter middleware for Express
// Allows maxRequests per windowMs per IP

function rateLimiter({ maxRequests, windowMs }) {
  // Store request timestamps per IP
  const ipRequests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, []);
    }
    // Remove old requests outside window
    const timestamps = ipRequests.get(ip).filter(ts => now - ts < windowMs);
    timestamps.push(now);
    ipRequests.set(ip, timestamps);
    if (timestamps.length > maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    next();
  };
}

module.exports = rateLimiter;
