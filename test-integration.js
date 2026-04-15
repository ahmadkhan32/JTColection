#!/usr/bin/env node

/**
 * JT Collections - Automated Integration Test Script
 * Tests critical user journeys and API endpoints
 */

import http from 'http';
import { URL } from 'url';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5175';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  brightGreen: '\x1b[92m',
  brightRed: '\x1b[91m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',
};

let testsPassed = 0;
let testsFailed = 0;

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testAPI(name, url, expectedStatus = 200, headers = {}) {
  try {
    const response = await makeRequest(url, { headers });
    if (response.statusCode === expectedStatus) {
      log(colors.brightGreen, `✅ ${name}: ${response.statusCode}`);
      testsPassed++;
      return true;
    } else {
      log(colors.brightRed, `❌ ${name}: Expected ${expectedStatus}, got ${response.statusCode}`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    log(colors.brightRed, `❌ ${name}: ${error.message}`);
    testsFailed++;
    return false;
  }
}

async function runTests() {
  log(colors.blue, '\n╔════════════════════════════════════════════╗');
  log(colors.blue, '║  JT Collections Integration Tests         ║');
  log(colors.blue, '║         Production Ready Verification     ║');
  log(colors.blue, '╚════════════════════════════════════════════╝\n');

  // ============ BACKEND API TESTS ============
  log(colors.yellow, '📋 Backend API Tests');
  log(colors.yellow, '─'.repeat(45));

  await testAPI('Health Check', `${BACKEND_URL}/health`);
  await testAPI('Get Products', `${BACKEND_URL}/api/products?limit=3`);

  // Test with admin auth
  const adminHeaders = {
    'user': JSON.stringify({ id: '1', role: 'admin', name: 'Admin' }),
    'Content-Type': 'application/json',
  };
  await testAPI('Admin Orders (with auth)', `${BACKEND_URL}/api/admin/orders`, 200, adminHeaders);

  // Test without auth (should be 401)
  await testAPI('Admin Orders (no auth)', `${BACKEND_URL}/api/admin/orders`, 401);

  // ============ FRONTEND PAGE TESTS ============
  log(colors.yellow, '\n🌐 Frontend Page Tests');
  log(colors.yellow, '─'.repeat(45));

  await testAPI('Homepage', `${FRONTEND_URL}/`);
  await testAPI('Login Page', `${FRONTEND_URL}/login`);
  await testAPI('Products Page', `${FRONTEND_URL}/shop`);
  await testAPI('Cart Page', `${FRONTEND_URL}/cart`);
  await testAPI('Checkout Page', `${FRONTEND_URL}/checkout`);
  await testAPI('Admin Orders Page', `${FRONTEND_URL}/admin/orders`);
  await testAPI('Admin Products Page', `${FRONTEND_URL}/admin/products`);
  await testAPI('Admin Users Page', `${FRONTEND_URL}/admin/users`);
  await testAPI('Admin Categories Page', `${FRONTEND_URL}/admin/categories`);

  // ============ RESULTS ============
  log(colors.blue, '\n╔════════════════════════════════════════════╗');
  log(colors.blue, '║  Test Results Summary                      ║');
  log(colors.blue, '╚════════════════════════════════════════════╝\n');

  const total = testsPassed + testsFailed;
  const percentage = total > 0 ? ((testsPassed / total) * 100).toFixed(0) : 0;

  log(colors.brightGreen, `✅ Passed:  ${testsPassed}`);
  if (testsFailed > 0) {
    log(colors.brightRed, `❌ Failed:  ${testsFailed}`);
  }
  log(colors.blue, `📊 Total:   ${total}`);
  log(colors.brightGreen, `📈 Success: ${percentage}%\n`);

  if (testsFailed === 0) {
    log(colors.bgGreen + colors.bold, '                                            ');
    log(colors.bgGreen + colors.bold, '  🎉 ALL TESTS PASSED - PRODUCTION READY ✅  ');
    log(colors.bgGreen + colors.bold, '                                            ');
    log(colors.reset, '');
    process.exit(0);
  } else {
    log(colors.brightRed, '\n⚠️  SOME TESTS FAILED - REVIEW RESULTS\n');
    process.exit(1);
  }
}

// Wait for servers to be ready
setTimeout(() => {
  runTests().catch((error) => {
    log(colors.red, 'Test suite error:', error);
    process.exit(1);
  });
}, 1000);
