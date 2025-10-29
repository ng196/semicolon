/**
 * Component Test Registry
 * All component inline tests are imported and run from here
 * Format: Each component exports testComponentName function
 */

import { logInfo, logError } from '@/shared/utils/logger';
// import { testButton } from '@/components/primitives/Button';
// import { testAvatar } from '@/components/primitives/Avatar';
// import { testBadge } from '@/components/primitives/Badge';
// import { testInput } from '@/components/primitives/Input';

interface ComponentTest {
  name: string;
  tests: Array<{
    name: string;
    test: () => boolean | Promise<boolean>;
  }>;
}

interface TestResult {
  componentName: string;
  passed: number;
  failed: number;
  total: number;
  tests: Array<{
    name: string;
    passed: boolean;
    error?: string;
  }>;
}

/**
 * Registry of all component tests
 */
const componentTests: Array<() => ComponentTest> = [
  // testButton,
  // testAvatar,
  // testBadge,
  // testInput,
  // Remaining: SearchInput, Checkbox, Radio, Icon
];

/**
 * Run all component tests
 */
export const runAllComponentTests = async () => {
  logInfo('ComponentTests', 'Starting component test suite...\n');

  const results: TestResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('            COMPONENT TEST SUITE                              ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const testFn of componentTests) {
    try {
      const testSuite = testFn();
      const result: TestResult = {
        componentName: testSuite.name,
        passed: 0,
        failed: 0,
        total: testSuite.tests.length,
        tests: [],
      };

      console.log(`\n📦 ${testSuite.name}`);
      console.log('─'.repeat(60));

      for (const test of testSuite.tests) {
        try {
          const passed = await test.test();
          result.tests.push({
            name: test.name,
            passed,
          });

          if (passed) {
            console.log(`  ✅ ${test.name}`);
            result.passed++;
            totalPassed++;
          } else {
            console.log(`  ❌ ${test.name}`);
            result.failed++;
            totalFailed++;
          }
        } catch (error) {
          console.log(`  ❌ ${test.name}`);
          console.log(`     Error: ${error}`);
          result.tests.push({
            name: test.name,
            passed: false,
            error: String(error),
          });
          result.failed++;
          totalFailed++;
        }
      }

      results.push(result);
    } catch (error) {
      logError('ComponentTests', error);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('                    TEST SUMMARY                                ');
  console.log('═'.repeat(60));
  console.log(`\n✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📊 Total:  ${totalPassed + totalFailed}\n`);

  if (totalFailed === 0) {
    console.log('🎉 All tests passed!\n');
    logInfo('ComponentTests', 'All tests passed!');
  } else {
    console.log(`⚠️  ${totalFailed} test(s) failed!\n`);
    logError('ComponentTests', `${totalFailed} test(s) failed`);
  }

  return {
    total: totalPassed + totalFailed,
    passed: totalPassed,
    failed: totalFailed,
    results,
  };
};

/**
 * Register a component test
 * Call this from each component's test function
 */
export const registerComponentTest = (testFn: () => ComponentTest) => {
  componentTests.push(testFn);
};

/**
 * Get test results by component name
 */
export const getComponentTestResults = async () => {
  const allResults = await runAllComponentTests();
  return allResults.results;
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).runAllComponentTests = runAllComponentTests;
}
