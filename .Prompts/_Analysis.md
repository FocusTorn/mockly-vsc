# Task: Comprehensive Analysis


This task performs a comprehensive analysis of the codebase, including code quality, architecture, and dependency injection patterns.

## Triggering <!-- Start Fold -->

- `code-base`: Perform only the code-base analysis aspects (Error Handling, Security, Performance, Testability, Documentation, Consistency, Style, Naming, Dependencies, Configuration, Best Practices, DRY, Cleaner, Execution Speed, I18n/L10n, Accessibility, Import Paths).
- `injection`: Perform only the dependency injection analysis aspects (DI Functionality, Resolution, Configuration, Lifecycle, Performance, Style, Framework Features, Integration, DI Error Handling, Dependency Relationships & Resolution, DI Token Verification).
- `both` (Default): Perform both code-base and injection analysis.rem

- A request like "analyze the files in src" or "perform comprehensive analysis on the project" will trigger both code-base and injection analysis by default.
- Requests like "perform code-base analysis on src/core" or "analyze the injections in module_injection.ts" will trigger only the specified analysis type.rem

<!-- Close Fold -->

## Reporting Directives <!-- Start Fold -->

**Do not reiterate these directives within the analysis output.**

- **Detailed Analysis Output:** Present a detailed, granular analysis for **all** numbered criteria from **both** 'Code-base Analysis' and 'Dependency Injection Analysis' as standard markdown text before the 'Action Items' block. For each criterion, structure the analysis using the following sub-sections:
  - **Good:** Positive observations and well-implemented aspects.
  - **Bad:** Negative observations, shortcomings, or areas needing improvement (distinct from the "Action Items" which are remediation steps).
  - **General:** Other notes, observations, or opinions that don't fit neatly into "Good" or "Bad".
- When identifying a(n):

  - pattern where code elements **often lack** a desired convention
    - EG. "Services often lack comprehensive unit tests"
    - State the pattern clearly in the "Bad" sub-section of the detailed analysis output for the relevant criterion.
    - **Do not list specific examples** for this type of finding, as it implies a widespread absence.

  - pattern where code elements **often use** a convention that deviates from the expected convention
    - EG. "Services often use concrete types instead of interfaces for dependencies"
    - State the pattern clearly in the "Bad" sub-section of the detailed analysis output for the relevant criterion.
    - Provide **specific examples** (file, class, method) of where this pattern is observed in the "Patterns Deviating from Expected Conventions" section of the Action Items block.

  - area that seems **reasonably** or **moderately** well-implemented _and_ has potential for enhancement
    - EG. "Caching seems reasonably effective but could be improved for specific data types"
    - State the finding clearly including the area in which it fell under in the "General" sub-section of the detailed analysis output for the relevant criterion.
    - Provide **concrete suggestions** for improvement along with their potential pros and cons in the "Areas for Potential Enhancement" section of the Action Items block.

- **For Dependency Relationships & Resolution**
  - For each example in the "Patterns Deviating from Expected Conventions" section, add a sub-bullet point showing the correct resolution syntax using the registered interface type and token
  - EG. `- container.resolve<InterfaceType>('InterfaceToken')`

- **For any other code behavior issue** that were identified during the analysis:
  - This is for issues that:
    - Don't fit the "often lack", "often use", or "reasonably/moderately" patterns
    - Represent a deviation from established or best practices, like inconsistent directory structure or specific implementation limitations
  - State the issue clearly in the "Bad" or "General" sub-section of the detailed analysis output for the relevant criterion _and_ provide **specific examples** (file, class, method) of where this issue is observed in the "Potential Logical or Type-Related Bugs" section of the Action Items block.

<!-- Close Fold -->

## Analysis Output Format <!-- Start Fold -->

- The main detailed analysis report content (excluding the sections intended for the Action Items block) **MUST** be presented as standard markdown text, not enclosed in a ````text` block.
- In the detailed analysis output, include a markdown heading `### Code-base Analysis` before criterion 1 of that group and a markdown heading `### Dependency Injection Analysis` before criterion 1 of that group.
- Immediately following the main detailed analysis report text, a ````markdown` code block **MUST** be presented.
- This markdown block **MUST** contain the sections "Patterns Deviating from Expected Conventions", "Areas for Potential Enhancement", "Potential Logical or Type-Related Bugs", and "Observations and Notes" under the top-level heading `# Action Items`.
- The `# Action Items` heading **MUST NOT** have a horizontal rule (`---`) immediately following it.
- Each of the four sections (`## Patterns Deviating from Expected Conventions`, `## Areas for Potential Enhancement`, `## Potential Logical or Type-Related Bugs`, `## Observations and Notes`) **MUST** have a horizontal rule (`---`) immediately following its heading.
- There **MUST** be exactly two blank lines (`<br><br>`) between the four main sections within the markdown block.
- Within the ````markdown`code block, the content of the included sections **MUST** be formatted as a markdown checklist (`- [ ]`or`- [x]`).
- There **MUST** be exactly one blank line between each top-level checklist item (e.g., between the item for "Use of Concrete Class Tokens" and the item for "Lifecycle Management Standardization"). Sub-items (like examples or suggestions) should follow standard markdown list spacing within their parent item.
- **For the "Patterns Deviating from Expected Conventions" section:**
  - Group findings by file. Each file name should be presented as a level 4 markdown heading (e.g., `#### test/file.vite.ts`) and should _not_ be a checklist item.
  - Under each file name heading, list the specific instances of deviation as checklist sub-bullet points (`- [ ]`).
  - For the "Resolving Concrete Classes Directly" pattern, each sub-bullet should state the concrete class being resolved and the incorrect token used, followed by the correct resolution syntax using the interface type and token (e.g., `- [ ] Resolving \`ConcreteClass\` using \`'ConcreteToken'\`. Correct: \`container.resolve<InterfaceType>('InterfaceToken')\``).
  - For the "Resolving Services with Incorrect Tokens" pattern, each sub-bullet should state the service being resolved and the incorrect token used, followed by the correct resolution syntax using the registered type/interface and token (e.g., `- [ ] Resolving \`Service\` using \`'IncorrectToken'\`. Correct: \`container.resolve<CorrectType>('CorrectToken')\``).
- **For the "Areas for Potential Enhancement" section:**
  - The description, suggestions, and pros/cons **MUST** be **bold**.
  - Pros and Cons **MUST** be separate bullet points under each suggestion.
- **For the "Potential Logical or Type-Related Bugs" section:**
  - Each bug finding should be a checklist item (`- [ ]`).
  - Under each bug checklist item, include sub-bullet points with bold labels for "Description:", "Side Effects:", and "Fix:".
- **For the "Observations and Notes" section:**
  - Focus on potential issues or things worth noting, not declarations of functionality.
- **This markdown block MUST be the very last element in the response turn.**rem

<!-- Close Fold -->

## Analysis Criteria <!-- Start Fold -->

**Dependency Injection Analysis** <!-- Start Fold -->

- **1. Component Registration & Configuration (`module_injection.ts`):**
  - **Completeness of Registrations:**
    - Are all services, modules, and namespaces that require DI correctly registered in `module_injection.ts`?
    - Are there any components being instantiated manually that should be managed by the DI container?
  - **Correctness of Types & Tokens:**
    - Are components registered with the correct interface types as tokens (e.g., `container.registerSingleton<ICoreUtilitiesService>('ICoreUtilitiesService', CoreUtilitiesService)`)?
    - Are string tokens used consistently and do they accurately reflect the interface they represent?
    - Is the `Uri` registration (`container.register('Uri', { useValue: vUri })`) appropriate for its usage?
  - **Scope Management (Lifecycles):**
    - Are components registered with appropriate lifecycles (e.g., `registerSingleton`)?
    - Does the chosen lifecycle align with the intended use and statefulness of each component (e.g., services holding state are singletons)?
  - **Clarity and Organization of `module_injection.ts`:**
    - Is `module_injection.ts` well-organized and easy to understand?
    - Are registrations grouped logically (e.g., by core services, by module)?
  - **Suggestions for Improvement:**
    - Review if any non-singleton scopes might be beneficial for specific components (though singletons are common for service-oriented architectures).
    - Ensure all registered components are indeed used or necessary.

- **2. Dependency Resolution & Injection (`@inject`, `@injectable`):**
  - **Accuracy of Injection:**
    - Are dependencies correctly injected into constructors using the `@inject('Token')` decorator?
    - Do the injected tokens precisely match those used during registration in `module_injection.ts`?
  - **`@injectable()` Decorator Usage:**
    - Is the `@injectable()` decorator consistently applied to all classes that are either injected or have dependencies injected into them?
  - **Constructor Injection:**
    - Is constructor injection the primary method used, promoting immutability and clear dependency declaration?
  - **Resolution Errors (Potential):**
    - Are there any potential runtime resolution errors if tokens mismatch or if a class is not marked `@injectable`? (Static analysis can hint, runtime is definitive).
  - **Clarity of Injected Dependencies:**
    - Is it clear from a class's constructor what its dependencies are?
  - **Suggestions for Improvement:**
    - Systematically verify all `@inject` tokens against `module_injection.ts` registrations.
    - Double-check all injectable classes have the `@injectable()` decorator.

- **3. Lifecycle Management by `tsyringe`:**
  - **Singleton Behavior:**
    - For components registered as singletons, does the application consistently receive the same instance when resolved multiple times?
  - **Initialization:**
    - Are constructors of services effectively acting as their initialization logic?
    - If more complex initialization is needed, are appropriate patterns used (e.g., an `init()` method called after construction, though `tsyringe` doesn't have explicit init hooks like some frameworks)?
  - **Disposal/Cleanup (if applicable):**
    - While `tsyringe` doesn't have built-in disposal for singletons in the same way as scoped instances in other frameworks, are resources managed by services (e.g., event emitters in `EventBusService`) handled correctly, especially during `reset` operations?
  - **Suggestions for Improvement:**
    - Ensure that `reset` methods in services effectively clean up any state or resources managed by singletons to mimic a fresh start.

- **4. `tsyringe` Framework-Specific Usage:**
  - **Effective Use of Features:**
    - Is `reflect-metadata` correctly imported once at the application entry point (implied by `module_injection.ts` importing it, and test setups should do the same)?
    - Are decorators like `@injectable()`, `@singleton()` (via `registerSingleton`), and `@inject()` used according to `tsyringe` conventions?
  - **Token Usage:**
    - Is the use of string tokens for interfaces standard and well-managed?
  - **Container Usage:**
    - Is the global `container` from `tsyringe` used appropriately for registrations and resolutions (primarily in `module_injection.ts` and the main `index.ts` for initial resolution)?
  - **Suggestions for Improvement:**
    - Review if any other `tsyringe` features (e.g., injection of optional dependencies, named injections, child containers) could be beneficial, though the current usage seems appropriate for this library's scale.

- **5. DI and Testability:**
  - **Mocking Dependencies:**
    - Does the use of DI make it easier to mock dependencies when testing individual services or modules? (e.g., providing a mock `ICoreUtilitiesService` to a service under test).
  - **Replacing Implementations:**
    - While not a common user scenario for this library, does the DI setup allow for potentially replacing implementations for specific testing needs internally?
  - **Clarity for Testing:**
    - Does the DI structure make it clear what dependencies a service has, simplifying test setup?
  - **Suggestions for Improvement:**
    - Ensure test examples (if any are testing services directly) demonstrate how to leverage DI for mocking.

- **6. Error Handling & Debugging Related to DI:**
  - **Resolution Errors:**
    - If a token is incorrect or a dependency is missing, how informative are `tsyringe`'s error messages?
    - How easy is it to debug DI-related issues (e.g., circular dependencies, token mismatches)?
  - **Circular Dependencies:**
    - Are there any (potential) circular dependencies? (e.g., ServiceA needs ServiceB, ServiceB needs ServiceA). `tsyringe` can handle some via property injection or `lazyInject`, but constructor injection cycles are problematic.
  - **Suggestions for Improvement:**
    - Document common DI pitfalls or debugging tips if they become apparent during usage.

- **7. Consistency and Best Practices in DI Usage:**
  - **Uniformity:**
    - Is DI applied consistently across all modules and services?
    - Are all relevant components managed by the container?
  - **Interface-Based Dependencies:**
    - Is the practice of depending on interfaces (e.g., `ICoreUtilitiesService`) rather than concrete classes (`CoreUtilitiesService`) consistently followed in constructors?
  - **Token Naming Conventions:**
    - Are string tokens for interfaces consistently named (e.g., matching the interface name)?
  - **Suggestions for Improvement:**
    - Identify any inconsistencies in DI application or adherence to interface-based programming.

<!-- Close Fold -->

**General TypeScript Code-base Analysis** <!-- Start Fold -->

1. **Code Readability & Structure:**
   - **Overall Organization:**
     - Is the project directory structure logical and easy to navigate (e.g., `src`, `core`, `modules`, `_interfaces`, `implementations`, `services`)?
     - Are files and folders named clearly and consistently?
     - Is there a clear separation of concerns between different parts of the codebase?
   - **Code Clarity:**
     - Is the code within files generally easy to follow and understand?
     - Are variable and function names descriptive and unambiguous?
     - Is the control flow straightforward, or are there overly complex/nested structures?
   - **Coding Style & Formatting:**
     - Is a consistent coding style applied throughout the project?
     - Is a linter (ESLint) and formatter (Biome/Dprint) effectively used and configured (`eslint.config.js`, `biome.jsonc`)? Are there linting/formatting errors?
   - **Modularity:**
     - Are components (classes, functions) small and focused on a single responsibility?
     - Is code appropriately broken down into reusable modules/functions?
   - **Suggestions for Improvement:**
     - Specific areas where structure or readability could be enhanced.
     - Recommendations for refactoring complex sections.

2. **TypeScript Usage & Type Safety:**
   - **Type Definitions:**
     - Are interfaces (`_interfaces/I*.ts`) and types used effectively to define contracts and data structures?
     - Are types precise and comprehensive?
     - Is the use of `any` minimized and justified where present?
   - **Strictness & Compiler Options:**
     - Does the `tsconfig.json` enforce strict type checking (`strict: true`)?
     - Are other relevant compiler options (e.g., `noImplicitAny`, `strictNullChecks` - implied by `strict:true`) effectively utilized?
   - **Generics:**
     - Are generics used appropriately to create reusable and type-safe components (e.g., `EventEmitter<T>`)?
   - **Enums:**
     - Are enums (`vscEnums.ts`) used effectively for representing sets of named constants?
   - **Type Inference vs. Explicit Types:**
     - Is there a good balance, promoting clarity without excessive verbosity?
   - **Suggestions for Improvement:**
     - Instances where types could be more precise or `any` could be avoided.
     - Opportunities for leveraging more advanced TypeScript features if beneficial.

3. **Software Design Principles & Patterns:**
   - **SOLID Principles:**
     - To what extent does the codebase adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles?
   - **Dependency Injection (`tsyringe`):**
     - Is `tsyringe` used effectively for managing dependencies and promoting loose coupling (`module_injection.ts`, `@injectable`, `@inject`, `@singleton`)?
     - Are injection tokens clear and consistently used?
     - Is the scope of injected dependencies (singleton vs. transient) appropriate?
   - **Design Patterns:**
     - Are any other design patterns (e.g., Factory, Service Locator - though DI is preferred) evident and appropriately used?
   - **Code Duplication (DRY - Don't Repeat Yourself):**
     - Are there significant instances of duplicated code that could be refactored into shared functions or classes?
   - **Suggestions for Improvement:**
     - Areas where applying design principles could improve modularity or maintainability.
     - Specific instances of code duplication to address.

4. **Comments & Internal Documentation:**
   - **TSDoc/JSDoc for Public APIs:**
     - Are public classes, methods, interfaces, and properties within the library (especially in interface files) documented using TSDoc/JSDoc style comments?
     - Do comments clearly explain the purpose, parameters, and return values?
   - **Inline Comments for Complex Logic:**
     - Is complex, non-obvious, or critical internal logic adequately explained with inline comments?
     - Are "TODO" or "FIXME" comments used appropriately and are they actionable?
   - **Clarity and Maintenance of Comments:**
     - Are comments clear, concise, and up-to-date with the code?
   - **User-Facing Documentation (e.g., README.md):**
     - Is there comprehensive user-facing documentation?
     - Is it clear, accurate, well-structured, and easy for users of the library to understand?
     - Does it adequately cover installation, setup, core concepts, API usage, and examples?
   - **Suggestions for Improvement:**
     - Key areas lacking sufficient documentation or comments.
     - Comments that are unclear or outdated.

5. **Error Handling (Internal Library Errors):**
   - **Robustness:**
     - How does the library handle unexpected internal states or errors within its own logic (not related to mocking VSCode errors)?
     - Are there try-catch blocks in appropriate places?
   - **Logging of Internal Errors:**
     - Are internal errors logged effectively using the `ICoreUtilitiesService`?
   - **Stability:**
     - Does the library appear stable, or are there potential unhandled exceptions?
   - **Suggestions for Improvement:**
     - Specific areas where internal error handling could be improved.

6. **Testing (of the Mockly-VSC Library Itself):**
   - _(This section would be based on the `test/` directory if its contents were provided for analysis. Assuming it exists based on the project tree.)_
   - **Unit Test Coverage:**
     - Are individual services, classes, and complex functions within Mockly-VSC well-covered by unit tests?
     - Do tests cover both happy paths and edge cases/error conditions?
   - **Integration Test Coverage:**
     - Are there tests that verify the correct interaction between different internal modules and services of Mockly-VSC?
   - **Test Quality & Maintainability:**
     - Are the tests clear, concise, and easy to understand?
     - Do they avoid being overly brittle to minor implementation changes?
     - Is there good use of test setup (`beforeEach`, `afterEach`) and teardown?
   - **Use of Testing Utilities (Vitest):**
     - Is Vitest (`vitest.config.ts`) and its features (e.g., `vi.spyOn`, `expect`) used effectively?
   - **Suggestions for Improvement:**
     - Areas of the library lacking sufficient test coverage.
     - Recommendations for improving test quality or structure.

7. **Dependencies & Build Process:**
   - **Dependency Management (`package.json`):**
     - Are dependencies appropriate and necessary?
     - Are versions reasonably up-to-date? (Consider `check_depreciated.js`)
     - Is there a clear distinction between `dependencies` and `devDependencies`?
   - **Build Scripts (`package.json` scripts, `gulpfile.mjs`, ESBuild config):**
     - Are the build scripts clear, reliable, and efficient?
     - Does the project build successfully without errors?
     - Is the process for generating declaration files (`build:types`) correct?
   - **Utility Scripts (`src/scripts/js`):**
     - Are the utility scripts (e.g., `bump_version_num.js`, `check_excess_packages.js`) functional and useful for project maintenance?
   - **Suggestions for Improvement:**
     - Potential issues with dependencies or build processes.
     - Improvements to development or maintenance scripts.

<!-- Close Fold -->

**Mockly-VSC Specific Analysis** <!-- Start Fold -->

1. **Mocking Accuracy & Completeness:**
   - **VSCode API Behavior Replication (Per Namespace):**
     - **`workspace`:** How accurately is `vscode.workspace` (folders, documents, fs, findFiles, applyEdit, events) mocked?
     - **`window`:** How accurately is `vscode.window` (editors, user interactions, terminals, output channels, status bar, events) mocked?
     - **`commands`:** How accurately is `vscode.commands` (registering, executing, listing) mocked?
     - **`env`:** How accurately is `vscode.env` (properties, clipboard, external URIs) mocked?
     - **`extensions`:** How accurately is `vscode.extensions` (getting, listing, events) mocked?
     - **Core Types:** How accurately are core types like `Uri`, `Position`, `Range`, `Selection`, `Disposable`, `EventEmitter`, `TextEdit`, `WorkspaceEdit`, `FileSystemError`, Enums replicated?
   - **Return Values & Side Effects:**
     - Do mocked functions return values that match the real API signatures and typical outputs?
     - Do mocked functions produce the expected side effects (e.g., updating internal state, firing events)?
   - **Error Condition Mimicking:**
     - When a mocked operation should fail (e.g., file not found), does it throw errors similar to the real VSCode API (e.g., using `FileSystemError` with correct codes)?
   - **Event Firing Logic:**
     - Are events fired at the correct junctures in the mocked operations?
     - Is the payload of fired events accurate (e.g., `WorkspaceFoldersChangeEvent` structure)?
   - **Known Discrepancies/Simplifications:**
     - Are there any documented or observed areas where the mock intentionally simplifies or deviates from the real API? (e.g., `TextEditor.edit` event payload as noted in `textEditor.ts`)
     - How significant are these discrepancies for typical testing scenarios?
   - **Suggestions for Improvement:**
     - Specific API methods/properties needing more accurate mocking.
     - Event firing logic that could be improved.
     - Error conditions that should be better simulated.

2. **API Design & Usability (of Mockly-VSC's Public API for Testers):**
   - **`mockly` Object Intuitiveness:**
     - Is the `mockly` object easy to use as a drop-in replacement for `vscode` in tests?
     - Are the mocked namespaces and types easily discoverable and accessible?
   - **`vscodeSimulator` Object Utility:**
     - Is the purpose and usage of `vscodeSimulator.reset()` clear and effective?
     - Is the access to internal modules/services (`vscodeSimulator._workspaceModule`, etc.) well-structured for advanced test setup or verification?
     - Are the methods for controlling user interactions (e.g., `expectQuickPickAndReturn`) intuitive?
   - **Consistency with VSCode API:**
     - Where `mockly` mirrors `vscode`, is the naming and behavior consistent enough to minimize confusion for users familiar with the real API?
   - **Test Setup Ergonomics:**
     - How easy is it to set up specific preconditions for a test using Mockly (e.g., creating files, opening documents, setting workspace folders)?
   - **Clarity of Exposed Mockly Types/Enums:**
     - Are the types and enums re-exported by `mockly` (e.g., `mockly.FileType`, `mockly.Position`) clear and correctly representing the VSCode equivalents?
   - **Suggestions for Improvement:**
     - Aspects of the `mockly` or `vscodeSimulator` API that could be made more user-friendly for test authors.
     - Additional helper methods on `vscodeSimulator` that could simplify common test setups.

3. **State Management & Isolation (Mock Internals):**
   - **Correctness of Simulated State:**
     - Is the internal state representing the VSCode environment (open documents, VFS content, active editor, etc.) managed correctly by the respective services (e.g., `TextDocumentService`, `FileSystemStateService`, `TextEditorService`)?
   - **Effectiveness of `vscodeSimulator.reset()`:**
     - Does `reset()` comprehensively clear all relevant states across all modules to ensure test isolation?
     - Are there any states that might persist across tests unintentionally?
   - **Event Emitter Management:**
     - Does `EventBusService.reset()` correctly dispose of and reinitialize event emitters to prevent listener leakage between tests?
   - **Resource Disposal:**
     - Are `Disposable` objects managed correctly within the mock implementations (e.g., for command registrations, event listeners)?
   - **Suggestions for Improvement:**
     - Potential areas where state might not be fully reset or isolated.
     - Improvements to resource management within the mocks.

4. **Extensibility & Maintainability (of Mockly's Mocking Logic):**
   - **Adding New VSCode API Mocks:**
   - How easy would it be to add mocking support for a new VSCode API namespace or a new method/property within an existing mocked namespace?
   - Is the pattern for creating new services, interfaces, and integrating them via `tsyringe` clear?
   - **Updating Existing Mocks:**
   - If the real VSCode API changes, how difficult would it be to update the corresponding mocks in Mockly-VSC?
   - **Modularity of Mocking Components:**
   - Are the different mocked parts (e.g., file system mock, text document mock) sufficiently decoupled to allow independent development and maintenance?
   - **Clarity of DI for Mocking Services:**
   - Does the use of `tsyringe` make it clear how different parts of the mock infrastructure are connected and how to replace or extend them if needed for very specific testing scenarios (though generally users wouldn't do this)?
   - **Suggestions for Improvement:**
   - Architectural considerations for improving extensibility or maintainability of the mocking logic.

5. **Developer Experience (for Users of Mockly-VSC):**
   - **Clarity of Error Messages from Mockly:**
     - When a user misuses the Mockly API in their tests (e.g., trying to open a non-existent file without creating it first in the mock VFS), are the error messages from Mockly clear and helpful for debugging the test?
   - **Logging Usefulness:**
     - Does the logging provided by Mockly (via `ICoreUtilitiesService`) offer good insights into the mock's behavior during test execution, aiding in debugging tests?
     - Is the default log level appropriate? Is it easy to change?
   - **TypeScript Typings for `mockly` API:**
     - Are the TypeScript typings for the `mockly` object and its sub-properties accurate and helpful for autocompletion and type checking in user tests?
   - **Performance in Tests:**
     - Does Mockly-VSC perform efficiently enough not to significantly slow down test suites? (While not a primary goal, extreme slowness would be an issue).
   - **Clarity and Helpfulness of User Documentation (e.g., readme.md):**
     - How effectively does the primary user documentation (like readme.md) explain how to use Mockly-VSC?
     - Are the examples clear and practical?
     - Does it help users write tests efficiently and debug issues they might encounter when using the library?
   - **Suggestions for Improvement:**
     - Ways to make debugging tests written with Mockly easier.
     - Improvements to Mockly's own error reporting or logging.

<!-- Close Fold -->

<!-- Close Fold -->

## CRITICAL (DO NOT DEVIATE): Final Review <!-- Start Fold -->

- Before presenting the generated code, **verify** and **internally confirm** that:
  - **NEVER** more than 1 consecutive blank line within the import section.
  - no import banners are present if they are not followed by imports.
  - all import paths are correct and valid relative to the file's location.
  - all class body section banners are formatted according to the guidelines (100 characters wide)"
  - the top, center and bottom lines of the class body section banners are all the same character length.
  - each banner's center line has _exactly_ two spaces after the opening `│` character.
  - banner spacing rules (1 blank line above, 1 blank line below) are applied correctly in **both class and interface** bodies.
  - member spacing rules (0 blank lines between single-line, 1 blank line between multi-line) are applied correctly in **both class and interface** bodies.
  - **Code blocks use the `title="filename.ext"` format in the fence.**

  <!-- Close Fold -->
