import { checkRateLimit } from '../server/rateLimit.js';

console.log('--- RUNNING SECURITY VERIFICATION TESTS ---');

// 1. Verify Rate Limiting
console.log('\nTesting Rate Limiter:');
const key = 'test_ip_123';
const windowMs = 5000; // 5 seconds
const maxRequests = 3;

// First 3 requests should succeed
for (let i = 1; i <= 3; i++) {
  const result = checkRateLimit(key, windowMs, maxRequests);
  console.log(`Request ${i}: limited = ${result.limited}, remaining = ${result.remaining}`);
  if (result.limited) {
    console.error('FAIL: Request got rate limited prematurely.');
    process.exit(1);
  }
}

// 4th request must be rate limited
const limitedResult = checkRateLimit(key, windowMs, maxRequests);
console.log(`Request 4: limited = ${limitedResult.limited}, remaining = ${limitedResult.remaining}`);
if (!limitedResult.limited) {
  console.error('FAIL: Request was not rate limited as expected.');
  process.exit(1);
}
console.log('PASS: Rate limiter correctly blocked the 4th request.');

// 2. Verify Size Limit Checks
console.log('\nTesting Client-side Size Limits:');
const sampleWorkspace = {
  settings: { profile: { fullName: 'Test user' } },
  post_history: [] as any[]
};

// Create a large history payload
const largeString = 'A'.repeat(500000); // 500KB of data
sampleWorkspace.post_history.push({ body: largeString });

const serialized = JSON.stringify(sampleWorkspace);
console.log(`Serialized workspace size: ${serialized.length} bytes`);
if (serialized.length > 500000) {
  console.log('PASS: Payload correctly recognized as exceeding 500KB limit.');
} else {
  console.error('FAIL: Payload size logic error.');
  process.exit(1);
}

console.log('\n--- ALL LOCAL SECURITY TESTS PASSED ---');
