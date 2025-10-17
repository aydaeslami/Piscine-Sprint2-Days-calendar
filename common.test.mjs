import { getGreeting } from "./common.mjs";
import assert from "node:assert";
import test from "node:test";

import { getTargetDay } from "./common.mjs";

// Simple test framework
let passedTests = 0;
let failedTests = 0;

// Helper function to run a test
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

// Test suite for getTargetDay function
console.log("\n=== Testing getTargetDay Function ===\n");

// Test 1: First Monday of January 2024
test("First Monday of January 2024 should be day 1", () => {
  // January 1, 2024 is a Monday (day 1 of week)
  const firstDayOfMonth = new Date(2024, 0, 1).getDay(); // 1 (Monday)
  const result = getTargetDay(firstDayOfMonth, "Monday", 1, 2024, 0);
  assertEqual(result, 1, "First Monday should be January 1st");
});

// Test 2: Second Tuesday of October 2024 (Ada Lovelace Day)
test("Second Tuesday of October 2024 should be day 8", () => {
  // October 1, 2024 is a Tuesday (day 2 of week)
  const firstDayOfMonth = new Date(2024, 9, 1).getDay(); // 2 (Tuesday)
  const result = getTargetDay(firstDayOfMonth, "Tuesday", 2, 2024, 9);
  assertEqual(result, 8, "Second Tuesday should be October 8th");
});

test("Greeting is correct", () => {
  assert.equal(getGreeting(), "Hello");
});





test("getTargetDay returns correct day for 2nd Tuesday of October 2024", () => {
  // October 1, 2024 → Tuesday
  const firstDay = new Date(2024, 9, 1).getDay(); // 2
  const result = getTargetDay(firstDay, "Tuesday", 2, 2024, 9);

  // Expected: second Tuesday = October 8, 2024
  assert.strictEqual(result, 8);
});