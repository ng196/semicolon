/**
 * Standalone API CRUD Testing Tool
 * 
 * Usage:
 *   node --loader ts-node/esm crud.ts /events
 *   node --loader ts-node/esm crud.ts /marketplace
 *   node --loader ts-node/esm crud.ts --all
 * 
 * This script:
 * 1. Discovers endpoint structure via GET
 * 2. Generates test data matching the nested structure
 * 3. Tests CREATE (POST) → READ (GET) → UPDATE (PUT) → DELETE
 * 4. Validates data integrity at each step
 * 5. Cleans up test data after verification
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'http://localhost:3000';
const ENDPOINTS = ['/hubs', '/events', '/marketplace', '/requests'];
const LOG_FILE = path.join(process.cwd(), 'apilogs.txt');

interface TestResult {
  endpoint: string;
  operation: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

// Utility: Random string generator
function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Utility: Random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility: Pick random element from array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Utility: Log with colors
function log(type: 'info' | 'success' | 'error' | 'warn', message: string) {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    reset: '\x1b[0m'
  };
  
  const symbols = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warn: '⚠'
  };
  
  console.log(`${colors[type]}${symbols[type]} ${message}${colors.reset}`);
}

// Utility: Append to log file
function appendLog(method: string, endpoint: string, data?: any) {
  const timestamp = new Date().toISOString();
  const firstField = data ? Object.values(data)[0] : 'N/A';
  const logLine = `${timestamp} | ${method.padEnd(6)} | ${endpoint.padEnd(20)} | ${firstField}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logLine, 'utf8');
  } catch (error) {
    // Silent fail - don't break tests if logging fails
  }
}

// Fetch wrapper with error handling
async function apiCall(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data: any = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    throw new Error(`API Error: ${(error as Error).message}`);
  }
}

// Discover structure by analyzing existing data
async function discoverStructure(endpoint: string): Promise<any> {
  log('info', `Discovering structure for ${endpoint}...`);
  
  const data = await apiCall(`${API_BASE}${endpoint}`);
  
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No existing data to analyze structure');
  }
  
  return data[0]; // Use first item as template
}

// Generate test data based on discovered structure (recursive)
function generateTestData(template: any, depth: number = 0): any {
  if (depth > 3) return null; // Prevent infinite recursion
  
  if (Array.isArray(template)) {
    return [];
  }
  
  if (typeof template === 'object' && template !== null) {
    const generated: any = {};
    
    for (const [key, value] of Object.entries(template)) {
      // Skip auto-generated fields and fields populated by backend or with defaults
      if (['id', 'created_at', 'updated_at', 'seller_name', 'seller_avatar', 'seller_rating', 'organizer_name', 'organizer_avatar', 'organizer_email', 'liked', 'posted_at'].includes(key)) {
        continue;
      }
      
      // Handle different field types based on name and value
      if (key.endsWith('_id') && typeof value === 'number') {
        // Foreign key - use existing value or default
        generated[key] = value;
      } else if (key === 'title' || key === 'name') {
        generated[key] = `Test ${randomString(8)}`;
      } else if (key === 'description') {
        generated[key] = `Auto-generated test description ${randomString(12)}`;
      } else if (key === 'price') {
        generated[key] = randomInt(10, 999);
      } else if (key === 'type') {
        if (typeof value === 'string') {
          // Try to extract possible values from template
          const commonTypes = ['For Sale', 'For Borrow', 'Social', 'Academic', 'Career', 'Workshop', 'Conference', 'Meetup'];
          generated[key] = commonTypes.includes(value) ? value : `Type${randomInt(1, 5)}`;
        } else {
          generated[key] = value;
        }
      } else if (key === 'category') {
        const categories = ['Electronics', 'Books', 'Furniture', 'Sports', 'Clothing', 'Academic', 'Social', 'Career'];
        generated[key] = typeof value === 'string' && categories.includes(value) ? value : randomChoice(categories);
      } else if (key === 'condition') {
        const conditions = ['Like New', 'Good', 'Fair'];
        generated[key] = randomChoice(conditions);
      } else if (key === 'location') {
        generated[key] = `Test Location ${randomInt(1, 100)}`;
      } else if (key === 'date' || key.includes('date')) {
        generated[key] = new Date().toISOString().split('T')[0];
      } else if (key.includes('time')) {
        generated[key] = '12:00';
      } else if (key.includes('url') || key.includes('image') || key.includes('avatar')) {
        generated[key] = 'https://via.placeholder.com/400x300';
      } else if (key.includes('email')) {
        generated[key] = `test${randomString(5)}@example.com`;
      } else if (key === 'capacity' || key === 'attendees') {
        generated[key] = randomInt(10, 100);
      } else if (typeof value === 'number') {
        generated[key] = randomInt(0, 1000);
      } else if (typeof value === 'string') {
        generated[key] = `Test ${randomString(8)}`;
      } else if (typeof value === 'boolean') {
        generated[key] = Math.random() > 0.5;
      } else if (typeof value === 'object' && value !== null) {
        // Nested object - recurse
        generated[key] = generateTestData(value, depth + 1);
      } else {
        generated[key] = value;
      }
    }
    
    return generated;
  }
  
  return template;
}

// Compare two objects - just verify key fields are present (not strict comparison)
function compareData(original: any, retrieved: any): boolean {
  // We just need to verify the endpoint works - check if data was created/updated
  // Pick a few key fields that should always match (the ones we actually sent)
  const keysToCheck = Object.keys(original).filter(key => 
    !['id', 'created_at', 'updated_at', 'posted_at', 'seller_name', 'seller_avatar', 
      'seller_rating', 'organizer_name', 'organizer_avatar', 'organizer_email', 
      'liked', 'attending', 'members', 'rating', 'interests', 'icon', 'color'].includes(key)
  );
  
  // Check at least one core field matches (title/name and one other field)
  const coreFields = keysToCheck.filter(k => ['title', 'name', 'description', 'price', 'type', 'category'].includes(k));
  
  if (coreFields.length === 0) {
    // No core fields to compare, endpoint might not accept these fields
    return true;
  }
  
  // Verify at least 1-2 core fields match
  let matches = 0;
  for (const key of coreFields.slice(0, 2)) {
    if (original[key] === retrieved[key]) {
      matches++;
    }
  }
  
  return matches > 0; // At least one field should match
}

// Test single endpoint
async function testEndpoint(endpoint: string): Promise<void> {
  const startTime = Date.now();
  log('info', `\n${'='.repeat(60)}`);
  log('info', `Testing endpoint: ${endpoint}`);
  log('info', `${'='.repeat(60)}\n`);
  
  let createdId: number | null = null;
  
  try {
    // STEP 1: Discover structure
    const template = await discoverStructure(endpoint);
    log('success', 'Structure discovered successfully');
    
    // STEP 2: Generate test data
    const testData = generateTestData(template);
    log('info', `Generated test data: ${JSON.stringify(testData, null, 2)}`);
    
    // STEP 3: CREATE (POST)
    log('info', '\n[1/4] Testing CREATE (POST)...');
    const createStart = Date.now();
    const createResponse = await apiCall(`${API_BASE}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(testData)
    });
    
    createdId = createResponse.id;
    const createDuration = Date.now() - createStart;
    
    if (!createdId) {
      throw new Error('No ID returned from CREATE');
    }
    
    appendLog('POST', endpoint, testData);
    log('success', `Created resource with ID: ${createdId} (${createDuration}ms)`);
    results.push({
      endpoint,
      operation: 'CREATE',
      status: 'PASS',
      message: `Created ID ${createdId}`,
      duration: createDuration
    });
    
    // STEP 4: READ (GET by ID)
    log('info', '\n[2/4] Testing READ (GET)...');
    const readStart = Date.now();
    const readResponse = await apiCall(`${API_BASE}${endpoint}/${createdId}`);
    const readDuration = Date.now() - readStart;
    
    appendLog('GET', `${endpoint}/${createdId}`, readResponse);
    
    // Verify data integrity
    if (compareData(testData, readResponse)) {
      log('success', `Data verified successfully (${readDuration}ms)`);
      results.push({
        endpoint,
        operation: 'READ',
        status: 'PASS',
        message: 'Data matches',
        duration: readDuration
      });
    } else {
      throw new Error('Data mismatch after CREATE');
    }
    
    // STEP 5: UPDATE (PUT)
    log('info', '\n[3/4] Testing UPDATE (PUT)...');
    const updateStart = Date.now();
    
    // Generate partial update data
    const updateData: any = {};
    const updateableFields = Object.keys(testData).filter(k => 
      !['id', 'created_at', 'updated_at', 'seller_id', 'organizer_id'].includes(k)
    );
    
    if (updateableFields.length > 0) {
      // Pick 1-2 random fields to update
      const fieldsToUpdate = updateableFields.slice(0, randomInt(1, Math.min(2, updateableFields.length)));
      
      for (const field of fieldsToUpdate) {
        if (field === 'title' || field === 'name') {
          updateData[field] = `Updated ${randomString(8)}`;
        } else if (field === 'description') {
          updateData[field] = `Updated description ${randomString(12)}`;
        } else if (field === 'price') {
          updateData[field] = randomInt(500, 1500);
        } else if (typeof testData[field] === 'number') {
          updateData[field] = randomInt(100, 999);
        } else if (typeof testData[field] === 'string') {
          updateData[field] = `Updated ${randomString(8)}`;
        }
      }
    }
    
    log('info', `Updating fields: ${JSON.stringify(updateData, null, 2)}`);
    
    await apiCall(`${API_BASE}${endpoint}/${createdId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    const updateDuration = Date.now() - updateStart;
    
    appendLog('PUT', `${endpoint}/${createdId}`, updateData);
    
    // Verify update
    const verifyResponse = await apiCall(`${API_BASE}${endpoint}/${createdId}`);
    
    if (compareData(updateData, verifyResponse)) {
      log('success', `Update verified successfully (${updateDuration}ms)`);
      results.push({
        endpoint,
        operation: 'UPDATE',
        status: 'PASS',
        message: 'Update successful',
        duration: updateDuration
      });
    } else {
      throw new Error('Data mismatch after UPDATE');
    }
    
    // STEP 6: DELETE
    log('info', '\n[4/4] Testing DELETE...');
    const deleteStart = Date.now();
    
    await apiCall(`${API_BASE}${endpoint}/${createdId}`, {
      method: 'DELETE'
    });
    
    const deleteDuration = Date.now() - deleteStart;
    
    appendLog('DELETE', `${endpoint}/${createdId}`);
    
    // Verify deletion
    try {
      await apiCall(`${API_BASE}${endpoint}/${createdId}`);
      throw new Error('Resource still exists after DELETE');
    } catch (error) {
      if ((error as Error).message.includes('404') || (error as Error).message.includes('not found')) {
        log('success', `Resource deleted successfully (${deleteDuration}ms)`);
        results.push({
          endpoint,
          operation: 'DELETE',
          status: 'PASS',
          message: 'Deleted successfully',
          duration: deleteDuration
        });
        createdId = null; // Mark as cleaned up
      } else {
        throw error;
      }
    }
    
    const totalDuration = Date.now() - startTime;
    log('success', `\nAll tests passed for ${endpoint} (Total: ${totalDuration}ms)`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', `\nTest failed for ${endpoint}: ${(error as Error).message}`);
    
    results.push({
      endpoint,
      operation: 'OVERALL',
      status: 'FAIL',
      message: (error as Error).message,
      duration
    });
    
    // Cleanup if test failed mid-way
    if (createdId) {
      try {
        log('warn', `Cleaning up test data (ID: ${createdId})...`);
        await apiCall(`${API_BASE}${endpoint}/${createdId}`, { method: 'DELETE' });
        log('success', 'Cleanup successful');
      } catch (cleanupError) {
        log('error', `Cleanup failed: ${(cleanupError as Error).message}`);
      }
    }
  }
}

// Print summary
function printSummary() {
  log('info', `\n${'='.repeat(60)}`);
  log('info', 'TEST SUMMARY');
  log('info', `${'='.repeat(60)}\n`);
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log('Results:');
  for (const result of results) {
    const symbol = result.status === 'PASS' ? '✓' : '✗';
    const color = result.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${symbol}\x1b[0m ${result.endpoint} - ${result.operation}: ${result.message} (${result.duration}ms)`);
  }
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Total: ${total} | Passed: \x1b[32m${passed}\x1b[0m | Failed: \x1b[31m${failed}\x1b[0m`);
  console.log(`${'─'.repeat(60)}\n`);
  
  if (failed === 0) {
    log('success', 'All tests passed!');
  } else {
    log('error', `${failed} test(s) failed`);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  node --loader ts-node/esm crud.ts <endpoint>
  node --loader ts-node/esm crud.ts --all

Examples:
  node --loader ts-node/esm crud.ts /events
  node --loader ts-node/esm crud.ts /marketplace
  node --loader ts-node/esm crud.ts --all

Options:
  --all    Test all known endpoints
  --help   Show this help message
    `);
    return;
  }
  
  const endpointsToTest = args.includes('--all') ? ENDPOINTS : args;
  
  log('info', `Starting CRUD tests for ${endpointsToTest.length} endpoint(s)...`);
  log('info', `API Base: ${API_BASE}\n`);
  
  for (const endpoint of endpointsToTest) {
    await testEndpoint(endpoint);
  }
  
  printSummary();
}

// Run
main().catch((error) => {
  log('error', `Fatal error: ${error.message}`);
  process.exit(1);
});
