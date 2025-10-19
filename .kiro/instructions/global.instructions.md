---
applyTo: '**'

---

# Development Workflow Rules (Concise)

* Do **not** create summarization or markdown overview files for tasks.
* Write **functions** that perform one clear action at a time.
* If functionality isn’t specified, **ask precise questions** about:

  1. Input data
  2. Expected output
  3. Context of use
  4. Complexity level (provide up to 4 options)
* Never modify `package.json` or config files unless explicitly told to. Use CLI commands instead:

  * Add: `npm install <pkg>`
  * Remove: `npm uninstall <pkg>`
  * Update: `npm update <pkg>`
* Refer to **official documentation** for library-specific details and use MCP servers (e.g., Context7) for verified data.
* Follow patterns and structures from:

  * `.github/instructions` → code generation & workflow style
  * `./files/` → product and project reference files
* Prioritize **simplicity over complexity**: build a quick, working version first.
* Always **confirm desired complexity** before coding a feature or automation.
* Deliver clear, maintainable code that adheres to existing repo patterns.

do not use emojis in any file , do not write tests that checks syntax , but write checks that the function works as intended

write the unit tests as in should be in production login , test api calls , database calls etc using actual curl commands or any other tool 

