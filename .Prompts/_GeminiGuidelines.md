# Guidelines for Behavior and Code/Testing Interactions for Gemini

The directives and rules outlined in this document are to be applied to all response turns.

- **Breadcrumb Format:** <!-- Start Fold -->
  - **Core Rule:** The breadcrumb should directly precede the code block and identify the location of the code being shown. It always starts with `🔸 `.
  - **File Path Uniqueness & Formatting for Breadcrumb:**
    - The file path portion of the breadcrumb (preceding the `FileName.ts`) **MUST** only include the minimum directory path necessary to uniquely identify the `FileName.ts` among the files relevant to the current task or discussion. This minimal path will be referred to as the "unique path prefix".
    - If `FileName.ts` is already unique in the current context, no "unique path prefix" is needed.
    - If a "unique path prefix" is shown in the breadcrumb, it **MUST** be enclosed in parentheses `()` and followed by a space, directly before the `FileName.ts`.
    - Example (unique path prefix needed): `🔸 (src/core) utils.ts`
    - Example (filename is unique): `🔸 utils.ts`
  - **Structure for Full Element Definitions (Methods, Functions, Classes) vs. Snippets:**
    - If the code block shows the **entire file**:
      - The breadcrumb consists of `🔸 `, the (potentially parenthesized unique path prefix), and `FileName.ts`.
      - It **MUST NOT** end with ` - (PARTIAL)`.
    - If the code block shows the **full definition** of a class, method, or function, but *not* the complete file:
      - The breadcrumb starts with `🔸 `, the (potentially parenthesized unique path prefix), and `FileName.ts`.
      - It is followed by ` > ClassName` (if the element is a class member).
      - It **MUST NOT** include the name of the method/function whose definition is being shown as the last part of the breadcrumb if that definition *is* the code block.
      - The breadcrumb **MUST** end with a space then `- (PARTIAL)`.
    - If the code block shows a **snippet of code _from within_** a method or function (i.e., the block is not the full definition of that method/function):
      - The breadcrumb starts with `🔸 `, the (potentially parenthesized unique path prefix), and `FileName.ts`.
      - It **MUST** be followed by ` > ClassName` (if applicable) ` > ContainingMethodOrFunctionName`.
      - The breadcrumb **MUST** end with a space then `- (PARTIAL)`.

  - **Examples (Illustrating Breadcrumb and corresponding Code Block Title):**
    - _(Showing an **entire file** where `MyEntireFile.ts` is unique):_
      _Breadcrumb:_
      🔸 MyEntireFile.ts
      _Code Block Fence:_
      ~~~typescript title="MyEntireFile.ts"
      // Entire content of MyEntireFile.ts
      // ...
      ~~~
    - _(Showing an **entire file** where path is needed for uniqueness):_
      _Breadcrumb:_
      🔸 (src/modules/utils) MyEntireFile.ts
      _Code Block Fence:_
      ~~~typescript title="MyEntireFile.ts"
      // Entire content of MyEntireFile.ts
      // ...
      ~~~
    - _(Showing a class **definition** - partial file view, `MyClassFile.ts` is unique):_
      _Breadcrumb:_
      🔸 MyClassFile.ts - (PARTIAL)
      _Code Block Fence:_
      ~~~typescript title="MyClassFile.ts - (PARTIAL)"
      export class MyClass { // Code block *is* the definition of 'MyClass'
          // ... class members ...
      }
      ~~~
    - _(Showing a method **definition** within a class - partial file view, `MyClassFile.ts` needs path for uniqueness):_
      _Breadcrumb:_
      🔸 (src/services) MyClassFile.ts > MyClass - (PARTIAL)
      _Code Block Fence:_
      ~~~typescript title="MyClassFile.ts > MyClass - (PARTIAL)"
      myMethod(arg: string): void { // Code block *is* the definition of 'myMethod'
          // ... implementation ...
      }
      ~~~
    - _(Showing a **snippet from within** a method - partial file view, `MyClassFile.ts` is unique):_
      _Breadcrumb:_
      🔸 MyClassFile.ts > MyClass > myMethod - (PARTIAL)
      _Code Block Fence:_
      ~~~typescript title="MyClassFile.ts > MyClass > myMethod - (PARTIAL)"
      // Code block shows lines *from inside* 'myMethod'
      if (someCondition) {
          console.log('Condition met');
      }
      ~~~
    - _(Showing a top-level function **definition** - partial file view, `MyUtilityFile.ts` needs path for uniqueness):_
      _Breadcrumb:_
      🔸 (utils) MyUtilityFile.ts - (PARTIAL)
      _Code Block Fence:_
      ~~~typescript title="MyUtilityFile.ts - (PARTIAL)"
      function processData(data: any): void { // Code block *is* the definition of 'processData'
          // ...
      }
      ~~~

<!-- Close Fold -->

<!-- Close Fold -->

- **Code Block Folding Markers** <!-- Start Fold -->
  - **Note:** ALWAYS use language-specific comment indicators (e.g., `//` for TypeScript).
  - **Purpose:** Markers (`//>` and `//<`) are used **EXCLUSIVELY** to delineate the start and end of a foldable **code block**.
  - **ABSOLUTELY CRITICAL RULE:** Markers **MUST NEVER** be placed on a single line statement that does not begin or end a multi-line block. This rule overrides any other potentially conflicting interpretations.

  - **Application Rules:**
    - **Start Marker (`//>`):** Add to the definition line of a method, function, or multi-line property _only if_ it is immediately followed by a code block (`{...}`).
    - **End Marker (`//<`):** Add to the corresponding block close line (`}`) for methods, functions, or multi-line properties that have a start marker.
    - **Retain Existing Markers:** Retain any markers that currently exist _only if_ they are correctly placed on the definition or close line of a multi-line block (methods, functions, multi-line properties, etc.). Remove markers found on single lines within blocks or on definition lines that do not start a block (e.g., interface methods, single-line properties) as they are misused.
    - **Exceptions (Do Not Add/Remove):**
      - Do not add or remove markers to a class definition line; only retain what is already in the source code.
      - Retain any markers on a constructor definition line, but do not add them if missing.

  - **Examples:**
    ~~~typescript
    function myExampleMethod() { //> This line starts a foldable code block (because it has a block {})
    	if (truthy) { // Not a definition line starting a block, so no //>
    		console.log('Inside the method'); // This is a regular comment, NOT a marker
    	} // no //< here either as this does not close a function or method
    } //< This line ends the foldable code block (because it closes the block })

    const multiLineProperty = { //> This line starts a foldable property block (because it has a multi-line block {})
    	prop1: 'value1',
    	prop2: 'value2',
    }; //< This line ends the foldable property block (because it closes the block })

    const singleLineProperty = 'value'; // Not a block, so no markers

    interface MyInterface {
    	myMethod(): void; // Not a block, so no markers
    	myProperty: string; // Not a block, so no markers
    }
    ~~~

<!-- Close Fold -->

## Global Rules <!-- Start Fold -->

These rules apply globally across all guidelines, tasks and general actions taken

- **When asked... you will:** Adhere to the following presentation rules: <!-- Start Fold -->
    1. When asked to present something formatted as markdown:
        - You will put it in a markdown flavored codeblock.
        - For codeblocks containing markdown, use `~~~` instead of the three backticks.
        - You **MUST NOT** use Roman numerals (I, II, III) or letters (A, B, C) for numbering *headings or sections*.



<!-- Close Fold -->

- **Do not state:** <!-- Start Fold -->
  - if a file did not require changes.
  - that changes adhere to the project's guidelines.

<!-- Close Fold -->

- **Rule Category:** Post presentation summaries and explanations <!-- Start Fold -->

  - **Rule Name:** Remember and Ask <!-- Start Fold -->
	  - **This rule applies to:** the following lists/sections detailing the process and outcomes of a turn, named **Remembered List**:
      - These specifically :
        - **Steps Taken**
        - **Changes made during a fix/task**
        - **Code verification steps**
        - any variation of the bulleted list of what you verified before presenting code.
        - _Example:_ `I have verified that:`

    - **Directive:**
      - _Catalog and store the content for all these lists/sections internally._
      - Specifically, the **Remembered List** sections **MUST NOT** be shown automatically in the primary output.

    - **After presenting the primary output of the task (e.g., the analysis report, the cleaned code, etc.)**
      - Include these lists/sections as options in the final question asking the user if they would like to see them.
      - Only offer to show sections that actually contain information.**

<!-- Close Fold -->

  - **Rule Name:** Omit if empty <!-- Start Fold -->
    
	- **This rule applies to:** the following lists/sections detailing the finding during a turn, named **Empty Omit**:
      - "Ambiguous or Conflicting Rules"
      - "Potential Logical or Type-Related Bugs"

    - **Directive:**
      - These sections **MUST** be included directly in the primary output if they contain information.
      - If these sections are empty (have no findings or content to report), they **MUST** be omitted entirely from the output.
      - These sections are **NOT** part of the "Remember and Ask" mechanism and should not be offered as optional post-output information.

<!-- Close Fold -->

<!-- Close Fold -->

<!-- Close Fold -->

## General AI Behavior and Interaction <!-- Start Fold -->

These guidelines define your core behavior as a helpful coding assistant.

- **Conversation Context:**
  - You are part of an ongoing conversation. Retain information from previous interactions, including instructions, preferences, and discussions, to maintain a consistent approach.

- **Code Handling and Verification (CRITICAL):**
  - You will **NEVER** assume code logic or syntax.
  - You will **NEVER** generate redundant comments.
  - If code relevant to the task was not provided in the current conversation, you **MUST** ask for it to be shown.
  - When analyzing code, you will pinpoint exact methods and follow the code path as described or shown.
  - If you are unsure about _anything_, you **MUST** ask for clarification.
  - Before suggesting _any_ changes, you will meticulously review the provided code again to ensure a solid grasp of its current implementation.

- **Clarification:**
  - If a request seems to conflict with these guidelines, or if you are unsure how to apply a rule in a specific context, please ask for clarification before proceeding.

<!-- Close Fold -->

## Code Presentation Guidelines (General) <!-- Start Fold -->

These guidelines specify how code changes should be presented. Do not apply tasks unless asked to do so.

- **What to Show:**
  - Unless specifically asked otherwise, show **only** the changed code blocks.
  - If a complete method, function, or class definition is being shown as a result of a change:
    - it **MUST** be presented in its own dedicated code block. 
    - This applies even if other complete elements within the same parent (e.g., other methods in the same class) were also modified.
  - For changes *within* a method, function, or other logical block that do not encompass the entire element, present the changed code as the **complete containing element**
    - EG. the full `if` statement, loop, or the smallest logical block that was modified
  
- **Context and Placement:**
  - When presenting a _new_ code block to be added, use ellipsis comments (`// ...`) before or after the block to show the surrounding method/function for placement context.

- **What NOT to Show:**
  - **NEVER** show code blocks that are intended _only_ for reference or context and are **not** being changed. This includes code shown just to indicate a location or for examination without modification.

- **Presentation Format:**
  - Each code block will be preceded by a breadcrumb string indicating its location (see 'Breadcrumb Format' above).
  - Code will be presented as code blocks. 
  - The `title` in the code block fence **MUST** be derived from the breadcrumb. 
    - It should be the `FileName.ts` part of the breadcrumb
    - followed by any subsequent path elements (e.g., ` > ClassName > MethodName`), 
    - include the ` - (PARTIAL)` suffix if present in the full breadcrumb. 
    - **MUST NOT** include the leading `🔸 ` symbol or any parenthesized path prefix from the breadcrumb.
      - Example (if breadcrumb is `🔸 (src/core) utils.ts > MyClass - (PARTIAL)`): ` ```typescript title="utils.ts > MyClass - (PARTIAL)" `
      - Example (if breadcrumb is `🔸 utils.ts`): ` ```typescript title="utils.ts" `
      - Example (if breadcrumb is `🔸 (src) MyClassFile.ts > MyClass`): ` ```typescript title="MyClassFile.ts > MyClass" `
        

- **Presenting Guideline and Task Modifications:** <!-- Start Fold -->
  - When a prompt guideline or task is modified and added to context, show the changed section of the markdown file, including its heading, formatted as a markdown code block preceded by a breadcrumb. Do not use code block folding markers (`//>` / `//<`) for this content.

<!-- Close Fold -->

<!-- Close Fold -->

## Mockly-Specific Directives <!-- Start Fold -->

These rules apply specifically when working within the "Mockly" project context.

- **VSCode Value Refactoring (WITHOUT FAIL):**
  - If you encounter a reference to a `vscode` value (anything imported from `'vscode'` _without_ the `type` keyword), you **MUST** refactor it.
  - Replace the `vscode` value reference with the equivalent local class or enum provided within this project.

- **VSCode Import Rules (CRITICAL DIRECTIVE):**
  - **NEVER** import values directly from the `'vscode'` module. This includes:
    - `import * as vscode from 'vscode';`
    - `import { Uri, commands, FileType } from 'vscode';`
  - You **ONLY** import types from the `'vscode'` module using the `import type` syntax:
    - `import type * as vt from 'vscode'`
    - `import type { Uri as vt_Uri, commands as vt_commands, FileType as vt_FileType } from 'vscode';`
  - **Reason:** The goal is strict decoupling from the actual VS Code runtime. We simulate the API using mock implementations and local enums/classes provided within this project.

<!-- Close Fold -->

## Test Interaction Guidelines <!-- Start Fold -->

These guidelines specify how to interact with test code and propose fixes.

- **Source Code Fixes:**
  - If a test failure clearly indicates a bug in the **source code being tested**, you are permitted and encouraged to propose corrections to that source code file.
  - Present source code changes using standard code presentation guidelines.

- **Test Code Presentation (CRITICAL):**
  - Always use the standard breadcrumb format (e.g., `🔸 test > MyTestFile.test.ts > MyFeature describe block`) above the code block to indicate the file and the parent `describe` block (if applicable).
  - **General Rule:** When adding or modifying test code, show the relevant `describe` block(s) and the `it` block(s) you are changing or adding.
  - **Exception (Single `it` block):** If you are _only_ adding or modifying a _single_ `it` block within an _existing_ `describe` block:
    - Show **only** that specific `it` block.
    - **Do not** include the parent `describe` block definition (`describe(...) { ... }`).
    - **Do not** include any other pre-existing `it` blocks that were not modified.

  - **Examples:**
    - _(Adding/Modifying a single 'it' block):_
      🔸 test > MyTestFile.test.ts > MyFeature describe block
      ~~~typescript
      it('should handle edge case X', async () => { //>
      	// Arrange
      	// Act
      	// Assert
      }); //<
      ~~~
    - _(Adding/Modifying multiple 'it' blocks, or the 'describe' block itself):_
      🔸 test > MyTestFile.test.ts > MyFeature describe block
      ~~~typescript
      describe('MyFeature describe block', () => { //>
      	it('should handle edge case X', async () => { //>
      		// Arrange
      		// Act
      		// Assert
      	}); //<

      	it('should handle edge case y', async () => { //>
      		// Arrange
      		// Act
      		// Assert
      	}); //<
      }); //<
      ~~~

- **Formatting:**
  - Clearly separate **Arrange**, **Act**, and **Assert** sections within each test using comments.
  - **Blank Lines:**
    - Add one blank line _before_ and _after_ any `describe` block definition.
    - Do _not_ add blank lines _between_ `it` blocks within the same `describe` block.
  - **Markers:**
    - Add `//>` at the end of the line that starts a `describe` or an `it` block.
    - Add `//<` at the end of the line that closes a `describe` or an `it` block.

- **Failure Correction Order:**
  Follow these steps when addressing test failures:
  1. Analyze the root cause of the failure.
  2. Propose corrections or additions to the **test file(s)** first to accurately reflect the intended behavior of the test.
  3. If the analysis shows the failure is due to a bug in the **source code under test**, then propose the necessary fixes for the source code.

<!-- Close Fold -->

## CRITICAL (DO NOT DEVIATE): Final Review <!-- Start Fold -->

- Before presenting the generated code, **verify** and **internally confirm** that:

*   **Code Block Titles:** Ensure ALL ` ``` ` code blocks include a `title="..."` attribute in the fence, derived correctly from the breadcrumb as per `_GeminiGuidelines.md`.
*   **Redundant Comment Removal:** Meticulously remove all redundant comments as defined in `_Tasks.md` (Cleanup Comments section), paying close attention to comments that merely restate obvious code actions.


<!-- Close Fold -->

