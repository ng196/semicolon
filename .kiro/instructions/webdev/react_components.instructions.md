---
applyTo: 'src/components/**'
description: Updated React component rules covering hooks, structure, debugging, and best practices.    
---

## ⚙️ Props, State, and Types

* Validate props using **PropTypes** or **TypeScript interfaces** for type safety.
* Maintain consistent **naming conventions**:

  * Hooks start with `use` (e.g., `useUserProfile`).
  * Component files should match their export name (`UserCard.tsx`).
* Pass only what’s necessary as props — avoid deep prop chains.
* Use **default values** and **optional chaining** to prevent crashes.

---

## ⚡ Performance

* Use **React.memo** to avoid unnecessary re-renders for pure components.
* Use **useMemo** and **useCallback** for expensive computations or callbacks passed as props.
* Avoid inline arrow functions and object literals directly inside JSX.
* Implement **lazy loading** (`React.lazy`, `Suspense`) for heavy or rarely used components.
* Use **fragments (`<>...</>`)** to avoid unnecessary wrapper `<div>`s.
* Ensure **list rendering** always includes stable keys.

---

## 🧩 Structure & Organization

* Maintain a consistent component file structure:

  ```
  ComponentName/
  ├── index.tsx        # Entry export
  ├── ComponentName.tsx # Logic/UI
  ├── ComponentName.module.css (or styled.ts) # Styling
  └── ComponentName.test.tsx # Optional tests
  ```
* Separate reusable logic (`hooks/`) and UI elements (`components/`).
* Document exported components with short JSDoc-style comments.
* Keep files small and easy to scan — split if a file exceeds ~200 lines.

---

## 🔍 Debugging & Logging

* Use **React Developer Tools** for inspecting components and props in the browser.
* Wrap uncertain components with an **Error Boundary** to capture crashes:

  ```jsx
  <ErrorBoundary fallback={<FallbackUI />}>
    <ProblematicComponent />
  </ErrorBoundary>
  ```
* Add **custom debug hooks** (e.g., `useDebugValue`) to expose hook state in React DevTools.
* Use **console.group()** or prefixed logs (`[ComponentName]`) for clear, scoped debugging.
* For production, use a lightweight **logging utility** (e.g., `pino`, `winston`, or a custom `logger.ts`) to track warnings and API errors.
* Clean up all logs before deployment using ESLint rules (no-console in production builds).

---

## ♿ Accessibility & UI Hygiene

* Use semantic HTML and proper ARIA roles.
* Ensure keyboard navigation and focus states are present.
* Test color contrast for WCAG 2.1 AA compliance.
* Handle dynamic content changes with appropriate ARIA live regions.

---

## 🧠 Development Philosophy

* Build **predictable components** — same input, same output.
* Embrace **error-driven development** — add boundaries, validate inputs, and fail visibly.
* Maintain **readability over cleverness** — the next developer (often you) should understand it instantly.
* Consistency beats perfection — follow one pattern across the codebase.

# Component Development Cycle (For Copilot / Agents)

This is the canonical, step-by-step cycle to build one component at a time. Follow it exactly. Keep things small, ask for missing inputs, and run simple functional tests before moving on.

**Key constraints to follow before coding**

* Do not change `package.json` or config files unless explicitly requested. Use `npm install` / `npm uninstall` / `npm update` instead.
* Do not generate summarization markdowns for tasks.
* Always ask precise questions if inputs or outputs are unspecified (input shape, expected output, error behavior, environment).
* Log errors to console and append them to a single general logfile `dev-errors.log` in project root. Do not attempt advanced error recovery.
* No emojis in any file.

---

## Component Cycle (single component) — steps

1. **Define purpose (ask if missing)**

   * One-sentence purpose: what user problem does this component solve? (Ask if not provided.)
   * Inputs: list required props / parameters and expected types.
   * Outputs: what the component returns/emits or side effects (API calls, events).

2. **Decide complexity (choose one)**

   * Minimal: only core behavior, no bells (fast to produce).
   * Standard: validation, basic edge cases, minimal UX states (loading/error).
   * Advanced: caching, accessibility attributes, detailed error messages.
   * Full: everything in Advanced plus analytics hooks and performance tuning.

   Ask the user to pick one before continuing.

3. **Write imports & small dependency check**

   * List required external libs and internal modules.
   * If a library is missing, do not edit `package.json` — instruct to run `npm install <pkg>` and pause.

4. **Scaffold the component file**

   * Provide module name and exact file path.
   * Create the component with clear comments: props, responsibilities, and side effects.

5. **Implement core logic**

   * Keep functions single-purpose.
   * Break logic into small helper functions inside same file if short; otherwise place helpers in `utils/` with explicit path.
   * Use descriptive names, avoid `any` types in TypeScript.

6. **Add basic performance checks (simple)**

   * If component will render lists, confirm it uses keys and memoization where appropriate.
   * If expensive computation exists, wrap with `useMemo` or separate function to be tested.
   * Emit a console.info line at initialization that includes component name and environment for trace: `console.info('[ComponentName] init', { env: process.env.NODE_ENV });`

7. **Export the component**

   * Default or named export as per project convention.
   * Document props and expected behavior at the top of the file (JSDoc or TypeScript types).

8. **Write inline unit test function (same file or tests aggregator)**

   * Add a small test function directly after the export or in a single test aggregation file (see testing pattern below).
   * Tests must check functionality (data-wise or side-effects) using real calls where applicable (curl for API endpoints) or invoking functions directly.
   * Do not write tests that only parse syntax. Tests should assert behavior and return structured results.

   Example minimal test function signature (JavaScript/TypeScript):

   ```js
   export async function __test_ComponentName() {
     try {
       // setup
       // call component logic or API via fetch/curl
       // assert expected output
       return { ok: true, details: 'passed' };
     } catch (err) {
       console.error('[ComponentName] test error', err);
       appendLog(err);
       return { ok: false, details: String(err) };
     }
   }
   ```

9. **Run single test runner entry**

   * Add or update a single test aggregator file `src/__tests__/run-tests.ts` (or `.js`) that imports and runs all `__test_*` functions sequentially and prints a concise report.
   * The agent should modify this aggregator only to add references to the new test function; do not create multiple test files for each component.

10. **Integration & environment checks**

    * If the component depends on server endpoints, use `curl` or `fetch` to call the running dev server (`API_BASE_URL` from `.env`).
    * For DB-checking flows, perform requests through API endpoints (do not connect directly to DB).
    * Confirm responses and log any unexpected payloads.

11. **Final verification before moving on**

    * Confirm tests passed in the aggregator and summary printed.
    * Confirm no unhandled exceptions in console output.
    * Confirm any errors were appended to `dev-errors.log`.
    * Only then proceed to the next component.

---

## Utility expectations & conventions

* **Logging helper**

  * Use a small helper `appendLog(error)` exported from a shared `utils/log.ts` which appends `timestamp | component | error.message | stack` to `dev-errors.log`.
  * Always call `appendLog` in `catch` blocks.

* **Testing aggregator**

  * Single file `src/__tests__/run-tests.ts` (or `.js`) that imports all exported `__test_*` functions and runs them.
  * Output: a JSON-like summary with counts and list of failed components.

* **API calls in tests**

  * Use `curl` via child process or `node` fetch, depending on environment. Use `curl` if you want exact HTTP behavior and easy debug logs (shell out with `child_process.exec` and capture stdout/stderr).

* **Random data for test**

  * If tests need sample payloads, use small helpers in `utils/random.ts`:

    * `randomString(len)`, `randomEmail()`, `randomDate()`.

---

## Safety checks & human-in-the-loop steps

* If any required input or endpoint URL is missing, stop and ask the exact question.
* Before installing any dependency, list it and require confirmation.
* Provide up to 4 options for complexity/features before coding.

---

Follow this cycle for every component. The agent must not move on to the next component until all steps finish and tests pass in the single run-tests file.

---

## Enhancements & Safeguards (added guidance)

These pragmatic rules and safety checks are appended to the Component Development Cycle and must be followed by agents and humans running the cycle.

1. **Scope error handling narrowly**

   * Wrap only risky operations (event handlers, external calls) in try/catch. Log and append errors; do not wrap entire render functions.

2. **Keep inline tests focused on behavior**

   * Inline tests should assert data shapes and functional behavior only. Do not attempt complex DOM mounting or browser-only assertions in Node.

3. **Centralize test registration**

   * Use a single test aggregator (`src/__tests__/run-tests.ts`) that imports and executes all exported `__test_*` functions sequentially.
   * The aggregator is the single entry for local test runs and CI.

4. **Optional CLI runner**

   * Add a safe CLI entry in the aggregator: if executed directly, it will run all tests. This enables `ts-node src/__tests__/run-tests.ts` to work without modifying package.json.

5. **Log folder existence**

   * Ensure `logs/` exists before writing. Use a defensive mkdir call (`fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })`) in the logger helper.

6. **Gate progression: no move until pass**

   * Do not begin a new component cycle until the current component's inline tests pass and `dev-errors.log` received no new error entries during verification.

7. **Performance logging in dev only**

   * Emit render and operation timing only when `NODE_ENV === 'development'` to avoid noise in production.

8. **Component registry**

   * Maintain `components/catalog.json` to track status (`in-progress`, `done`, `blocked`). Update it automatically when a cycle completes successfully.

9. **Minimal error handling policy**

   * Since advanced recovery is disallowed, always `console.error()` and append an entry to `dev-errors.log`. Include timestamp, component name, and stack.

10. **Merge with backend cycle**

    * Ensure the CDC references backend flow rules where components depend on API endpoints: verify endpoints exist before integration steps and ask for missing URLs.

11. **Human-in-loop checkpoints**

    * If the agent is missing any data, endpoints, or decisions, it must pause and ask exactly one clear question (input shape, expected output, or choice among up to 4 options). Do not guess.

12. **Automatic safety confirmations**

    * Before running any file-modifying actions beyond the component file itself (creating new files under `utils/` or `__tests__`), present a short list of files to be created and request confirmation.

Follow these additions as authoritative extensions to the Component Development Cycle. The agent must not proceed without obeying the gates above.
