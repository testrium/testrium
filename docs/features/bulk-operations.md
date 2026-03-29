# Bulk Operations

Update multiple test execution statuses in one action — introduced in **v1.7.0**.

## Why It Matters

In large test runs (100+ test cases), updating each result one by one is slow. Bulk operations let you select a group of tests and apply a status to all of them simultaneously.

Common use cases:
- Mark all smoke tests as `PASS` at the start of a regression run
- Block all tests in a module when a build is unstable
- Skip a set of tests that are out of scope for a cycle

## How to Use

1. Open a **Test Run** execution page
2. Use the **checkboxes** to select individual tests
3. Or click **Select All** to select every test in the run
4. To select all tests within a specific module, use the **module-level select** checkbox
5. Choose a status from the **bulk update dropdown**
6. Click **Update Selected**

All selected tests update in a single request — fast and atomic.

## Selected Count

The UI shows how many tests are currently selected so you always know what will be affected before you apply the update.
