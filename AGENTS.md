# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

This is a **GitHub Action** written in JavaScript (ES modules) that randomly
assigns Dependabot pull requests to members of a GitHub team. Source code in
`src/` is bundled to `dist/` using Rollup.

## Build, Lint, and Test Commands

| Command                | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `npm install`          | Install dependencies                                       |
| `npm run test`         | Run all Jest tests                                         |
| `npm run test -- path` | Run a single test file (e.g., `-- __tests__/main.test.js`) |
| `npm run lint`         | Run ESLint on all files                                    |
| `npm run format:check` | Check formatting with Prettier                             |
| `npm run format:write` | Auto-fix formatting with Prettier                          |
| `npm run bundle`       | Format and package source to `dist/`                       |
| `npm run all`          | Run format, lint, test, coverage, and package              |

### Running a Single Test

```bash
npm run test -- __tests__/main.test.js
npm run test -- --testNamePattern="assigns a random"
```

### Critical Workflow

After modifying any file in `src/`:

1. Run `npm run test` to verify tests pass
2. Run `npm run bundle` to update `dist/`

**Never modify `dist/` directly** - it is generated code.

## Code Style Guidelines

### Formatting (Prettier)

- **No semicolons**
- **Single quotes** for strings
- **No trailing commas**
- 2-space indentation
- 80 character line width
- Always wrap arrow function parameters in parentheses

```javascript
// Correct
const foo = 'bar'
const fn = (x) => x + 1

// Incorrect
const foo = 'bar'
const fn = (x) => x + 1
```

### Imports

Use **ES modules** with namespace imports for packages:

```javascript
import * as core from '@actions/core'
import * as github from '@actions/github'
```

Use **relative imports with `.js` extension** for local files:

```javascript
import { run } from './main.js'
import * as core from '../__fixtures__/core.js'
```

### Naming Conventions

- **camelCase** for variables and functions: `githubTeam`, `prNumber`
- **PascalCase** for classes
- Descriptive names that convey purpose

### Error Handling

Use try/catch with `core.setFailed()` for errors:

```javascript
export async function run() {
  try {
    // Validation with early returns
    if (!context.payload.pull_request) {
      core.setFailed('This action must be run on a pull_request event')
      return
    }

    // Main logic here
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
```

### Logging

Use `@actions/core` methods instead of `console`:

```javascript
core.debug('Verbose debugging info') // Only shown with ACTIONS_STEP_DEBUG
core.info('Normal output') // Always shown
core.warning('Warning message') // Shown as warning
core.setFailed('Error message') // Fails the action
core.setOutput('name', value) // Set action output
```

### Documentation

Use **JSDoc** for functions. Focus on explaining **why**, not what:

```javascript
/**
 * Selects a random team member and assigns them to the PR.
 *
 * @param {string[]} members - List of team member logins
 * @returns {Promise<string>} The selected member's login
 */
export async function selectAndAssign(members) {
```

## Testing

- Test framework: **Jest** with ES modules
- Tests go in `__tests__/` directory
- Mock fixtures go in `__fixtures__/` directory

### Test Structure

```javascript
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mock modules BEFORE importing the module under test
jest.unstable_mockModule('@actions/core', () => core)

// Dynamic import AFTER mocking
const { run } = await import('../src/main.js')

describe('main.js', () => {
  beforeEach(() => {
    // Setup mocks
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('describes expected behavior', async () => {
    // Arrange, Act, Assert
  })
})
```

## File Structure

```
src/                  # Source code (ES modules)
  index.js            # Entry point
  main.js             # Main action logic
__tests__/            # Unit tests
__fixtures__/         # Test mocks
dist/                 # Generated bundle (do not edit)
action.yml            # Action metadata
```

## Key Reminders

1. **Always run `npm run bundle` after changing `src/`**
2. **Never edit files in `dist/`**
3. **Use `@actions/core` for logging, not `console`**
4. **No semicolons, single quotes, no trailing commas**
5. **Include `.js` extension in relative imports**
6. **Run tests before committing: `npm run test`**
7. **Node.js version: 24** (see `.node-version`)
