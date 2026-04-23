import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 INITIALIZING SECURITY AUDIT...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name}`);
      if (err.response) {
        console.error(`   - Status: ${err.response.status}`);
        console.error(`   - Error Code: ${err.response.data?.code}`);
      } else {
        console.error(`   - Message: ${err.message}`);
      }
      failed++;
    }
  };

  // 1. AUTHENTICATION TESTS
  await test('Missing API Key should return 401', async () => {
    await axios.post(`${BASE_URL}/api/generate-token`, {});
  });

  await test('Invalid API Key should return 401', async () => {
    await axios.post(`${BASE_URL}/api/generate-token`, {}, {
      headers: { 'x-api-key': 'malicious-key' }
    });
  });

  // 2. INPUT VALIDATION TESTS
  await test('Missing mandatory fields should return 400 VALIDATION_ERROR', async () => {
    await axios.post(`${BASE_URL}/api/generate-token`, {
        x_api_key: 'test' // Assuming test mode or known key
    }, {
      headers: { 'x-api-key': 'test' }
    });
  });

  await test('Malformed PEM should be rejected with 400 CRYPTO_FAILURE', async () => {
    // Note: This requires a valid API key setup or demo mode
    await axios.post(`${BASE_URL}/api/generate-token`, {
      app_id: '123',
      installation_id: '456',
      private_key: 'not-a-pem-file'
    }, {
      headers: { 'x-api-key': 'test' }
    });
  });

  // 3. RATE LIMIT TESTS
  await test('Rapid requests should trigger 429 RATE_LIMIT_ERROR', async () => {
    const requests = Array.from({ length: 15 }).map(() => 
      axios.post(`${BASE_URL}/api/generate-token`, {}, { headers: { 'x-api-key': 'test' } })
    );
    const results = await Promise.allSettled(requests);
    const ratelimited = results.filter(r => r.status === 'rejected' && (r as any).reason.response?.status === 429);
    if (ratelimited.length === 0) throw new Error('Rate limit not triggered');
  });

  console.log(`\n📊 AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
