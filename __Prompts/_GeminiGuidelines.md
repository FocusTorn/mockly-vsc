# Guidelines for Behavior and Code/Testing Interactions for Gemini

Apply the directives and rules outlined in this document to all response turns.

# Keyword Definitions <!-- Start Fold -->
<!-- ---------------------------------------------------------------------------------------------------- -->

This section defines the interpretation of keywords used throughout these guidelines, based on RFC 2119.

-   **ENSURE / MUST / CRITICAL / REQUIRED / SHALL:** These words, or the adjective "REQUIRED", mean that the definition is an absolute requirement of the specification.
-   **MUST NOT / NEVER / SHALL NOT:** These phrases mean that the definition is an absolute prohibition of the specification.
-   **SHOULD / RECOMMENDED:** These words or the adjective "RECOMMENDED" mean that there may exist valid reasons in particular circumstances to ignore a particular item, but the full implications must be understood and carefully weighed before choosing a different course.
-   **SHOULD NOT / NOT RECOMMENDED:** These phrases mean that there may exist valid reasons in particular circumstances when the particular behavior is acceptable or even useful, but the full implications should be understood and the case carefully weighed before implementing any behavior described with this label.
-   **MAY / OPTIONAL:** This word or the adjective "OPTIONAL" means that an item is truly optional. One vendor may choose to include the item because a particular marketplace requires it or because the vendor feels that it enhances the product while another vendor may omit the same item.

<!-- Close Fold -->

# Table of Contents <!-- Start Fold -->
<!-- ---------------------------------------------------------------------------------------------------- -->

- [Guidelines for Behavior and Code/Testing Interactions for Gemini](#guidelines-for-behavior-and-codetesting-interactions-for-gemini)
- [Keyword Definitions ](#keyword-definitions-)
- [Table of Contents ](#table-of-contents-)
- [Guideline Helpers](#guideline-helpers)
  - [Breadcrumb Format ](#breadcrumb-format-)
  - [Code Block Folding Markers ](#code-block-folding-markers-)
  - [Import Section Structure (CRITICAL) ](#import-section-structure-critical-)
- [Global Rules](#global-rules)
  - [Meta-Guidelines for Document Structure (NEW SECTION) ](#meta-guidelines-for-document-structure-new-section-)
  - [Presentation Rules ](#presentation-rules-)
  - [Omissions ](#omissions-)
  - [Post presentation summaries and explanations ](#post-presentation-summaries-and-explanations-)
- [Code Presentation Guidelines (General)](#code-presentation-guidelines-general)
  - [What to Show ](#what-to-show-)
  - [Context and Placement ](#context-and-placement-)
  - [What NOT to Show ](#what-not-to-show-)
  - [Presentation Format ](#presentation-format-)
  - [Code Structure and Organization ](#code-structure-and-organization-)
- [General AI Behavior and Interaction](#general-ai-behavior-and-interaction)
  - [Conversation Context ](#conversation-context-)
  - [Code Handling and Verification (CRITICAL - Adhere Strictly) ](#code-handling-and-verification-critical---adhere-strictly-)
  - [Strategies for Guideline Interpretation and Adaptation ](#strategies-for-guideline-interpretation-and-adaptation-)
  - [Responding to Guideline Deviation Feedback ](#responding-to-guideline-deviation-feedback-)
  - [Task-Specific Guideline Application ](#task-specific-guideline-application-)
- [Test Interaction Guidelines](#test-interaction-guidelines)
  - [Source Code Fixes ](#source-code-fixes-)
  - [Test Code Presentation (CRITICAL) ](#test-code-presentation-critical-)
  - [Test File Structure and Formatting (CRITICAL) ](#test-file-structure-and-formatting-critical-)
  - [Failure Correction Order ](#failure-correction-order-)
- [Project Specific Directives (mockly-vsc)](#project-specific-directives-mockly-vsc)
  - [VSCode Value Refactoring (WITHOUT FAIL) ](#vscode-value-refactoring-without-fail-)
  - [VSCode Import Rules (CRITICAL DIRECTIVE) ](#vscode-import-rules-critical-directive-)
- [Examples](#examples)
  - [Breadcrumb Format and Code Block Title Examples ](#breadcrumb-format-and-code-block-title-examples-)
  - [Code Block Folding Marker Examples ](#code-block-folding-marker-examples-)
  - [Test Code Presentation Examples ](#test-code-presentation-examples-)
  - [Modified Prompt Guideline Section Example ](#modified-prompt-guideline-section-example-)
  - [Name of Modified Section ](#name-of-modified-section-)
- [CRITICAL (DO NOT DEVIATE): Final Review ](#critical-do-not-deviate-final-review-)

<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# Guideline Helpers
<!-- ---------------------------------------------------------------------------------------------------- -->

## Breadcrumb Format <!-- Start Fold -->

### Rule: Core Breadcrumb Requirement
  - **Directive:** Code blocks **MUST** be immediately preceded and immediately succeeded by a breadcrumb identifying the code's location. **ALWAYS** start the breadcrumb with `🔸 `.

### Rule: Breadcrumb Placement (CRITICAL)
  - **Directive:**
    - The **preceding** breadcrumb string **MUST** appear *before* the opening code block fence (` ``` `).
    - The **succeeding** breadcrumb string **MUST** appear *after* the closing code block fence (` ``` `).
    - Breadcrumbs **MUST NOT** be placed inside the code block itself.

### Rule: Breadcrumb Content (CRITICAL)
  - **Directive:** Both the preceding and succeeding breadcrumbs for a given code block **MUST** be identical.

### Rule: File Path Uniqueness & Formatting
  - **Directive:**
    - **Definition of "Current Operation":** For the purpose of determining the "unique path prefix," the "current operation" refers to the set of all files being explicitly mentioned, modified, created, or presented by the AI in the current response turn.
    - **INCLUDE** only the minimum directory path ("unique path prefix") necessary to uniquely identify the file within the context of the current operation. The unique path prefix is the shortest sequence of parent directory names (e.g., `(src/utils)`) that, when combined with the filename, ensures its unique identification.
    - **OMIT** the "unique path prefix" if `FileName.ts` (or `FileName.md`) is already unique within the current operation's scope (i.e., no other file with the same name is part of the current operation).
    - **ENCLOSE** any included "unique path prefix" in parentheses `()`.

### Rule: Breadcrumb Structure and Suffix Meaning
  - **Directive:** The structure of the path after `FileName.ext` and the presence/absence of a suffix **DETERMINE** the scope and action of the *code block content*:
    - **Full File Replacement:**
        - Breadcrumb: `🔸 (path) FileName.ext` (No suffix)
        - Meaning: The code block **CONTAINS** the entire content for `FileName.ext`. **REPLACE** the existing file entirely.
    - **New File Addition:**
        - Breadcrumb: `🔸 (path) FileName.ext - (NEW)`
        - Meaning: The code block **CONTAINS** the entire content for a new file named `FileName.ext`. **CREATE** this new file.
    - **Full Element/Section Replacement (Class, Method, Function, Markdown Section):**
        - Breadcrumb: `🔸 (path) FileName.ext > ElementOrSectionPath` (No suffix)
        - Meaning: The code block **CONTAINS** the complete definition for the code element at `ElementOrSectionPath` (e.g., `MyClass`, `MyClass > myMethod`) or the complete content of the markdown section identified by `ElementOrSectionPath` (e.g., `My Section Heading`, `My Section > My Subsection`). **REPLACE** the entire existing element definition or markdown section content in the source file.
    - **New Element Addition (Class, Method, Function):**
        - Breadcrumb: `🔸 (path) FileName.ext > ElementPath - (NEW)`
        - Meaning: The code block **CONTAINS** the complete definition for a new code element to be added at `ElementPath`. **ADD** this definition to the appropriate parent element in the source file. The code block presentation **MUST** include `// ...` context markers for placement. (Note: This typically applies to code, not markdown sections).
<!-- Close Fold -->

## Code Block Folding Markers <!-- Start Fold -->

### Rule: Purpose of Folding Markers
  - **Directive:** **USE** markers (`//>` and `//<`) **EXCLUSIVELY** to delineate the start and end of a foldable **code block**.
  - **Note:** **ALWAYS** use language-specific comment indicators (e.g., `//` for TypeScript).

### Rule: Critical Placement Rule (ABSOLUTELY CRITICAL)
  - **Directive:** **NEVER** place markers on a single line statement that does not begin or end a multi-line block. This rule **OVERRIDES** any other potentially conflicting interpretations.

### Rule: Application Rules for Folding Markers
  - **Directive:**
    - **Start Marker (`//>`):** **ADD** to the definition line of a method, function, multi-line arrow function assigned to a variable, or multi-line property _only if_ it is immediately followed by a code block (`{...}`).
    - **End Marker (`//<`):** **ADD** to the corresponding block close line (`}`) for methods, functions, multi-line arrow functions, or multi-line properties that have a start marker.
    - **Retain Existing Markers:** **RETAIN** existing markers _only if_ they are correctly placed on the definition or close line of a multi-line block (methods, functions, multi-line arrow functions, multi-line properties, etc.). **REMOVE** markers found on single lines within blocks or on definition lines that do not start a block (e.g., interface methods, single-line properties) as they do not conform to the rules for marker placement.

### Rule: Exceptions for Folding Markers
  - **Directive:**
    - **DO NOT ADD OR REMOVE** markers to a class definition line; only retain what is already in the source code.
    - **RETAIN** any markers on a constructor definition line, but **DO NOT ADD** them if missing.
<!-- Close Fold -->

## Import Section Structure (CRITICAL) <!-- Start Fold -->

### Rule: Import Path Accuracy (CRITICAL) <!-- Start Fold -->
  - **Directive:**
    - There will **NEVER** be comments added or left remaining in the import section other than the banners and start/end markers. **This includes temporary annotation comments (e.g., `// Added`, `// Modified`, `// Keep`) used during code generation; such comments MUST be removed before presenting the code.**
    - **DO NOT** modify import paths unless:
        -  the file itself is being moved as part of the task.
        -  the file is being refactored.
    - **If an import path requires modification:**
        - **MUST** verify and ensure that all import paths (`import`, `import type`) are **correct and valid** relative to the file's location.
        - **MUST** get clarification if relative paths are ambiguous.
  - _Negative Example (Incorrect - Avoid):_
    ```typescript
    //= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
    import type { SomeType } from './someFile.ts'; // This comment is incorrect
    import type { AnotherType } from './anotherFile.ts'; // Also incorrect
    ```
<!-- Close Fold -->

### Rule: Overall Import Section Structure <!-- Start Fold -->
  - **Directive:**
    - Located at the top of the file.
    - Starts with: `// ESLint & Imports -->>`
    - Ends with: `//--------------------------------------------------------------------------------------------------------------<<`
<!-- Close Fold -->

### Rule: Import Banners & Ordering <!-- Start Fold -->
  - **Directive:**
    - If more than a single import can be grouped under a banner, **CREATE** the banner, and group the imports under it.
    - Include the following banners in this **exact order**:
~~~typescript
    //= TSYRINGE ==================================================================================================
    //= VITEST ====================================================================================================
    //= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
    //= NODE JS ===================================================================================================
    //= INJECTED TYPES ============================================================================================
    //= IMPLEMENTATION TYPES ======================================================================================
    //= IMPLEMENTATIONS ===========================================================================================
    //= MISC ======================================================================================================
~~~
    - **CRITICAL:** Ensure that _only_ the banners immediately preceding a group of imports are included. Any banner from this list that would not be followed by imports before the next banner or the end marker **MUST be omitted**.
<!-- Close Fold -->

### Rule: Import Placement (CRITICAL) <!-- Start Fold -->
  - **Directive:**
    - All import statements **MUST** be placed _after_ the `// ESLint & Imports -->>` marker and _under_ the first relevant banner.
    - No imports **SHOULD** appear _before_ the first banner. **NEVER** add explanatory comments (like // Adjusted path...) next to or between import statements.
    - Only banners and the start/end markers are permitted as comments within this section.
    - Place each import statement directly under its corresponding banner.
    - Interface files **MUST NEVER** import their own interface definition.
    - **NEVER** add explanatory comments (like // Adjusted path...) next to or between import statements.
  - **Specific Banner Purpose Clarification:**
    - Imports from `vscode-uri` **SHOULD** be under the `VSCODE TYPES & MOCKED INTERNALS`.
<!-- Close Fold -->

### Rule: Import Spacing (ABSOLUTELY CRITICAL) <!-- Start Fold -->
  - **Directive:**
    - Exactly **ONE** blank line immediately **before** each banner.
    - Exactly **ONE** blank line immediately **after** the last import statement under a banner (or before the final `//--------------------------------------------------------------------------------------------------------------<<` marker).
    - **NEVER** have two or more consecutive blank lines anywhere within the import section.
  - _Example Spacing:_
~~~typescript
  // ESLint & Imports -->>

  //= BANNER TEXT A ===============================================================================================
  import type { import } from '../../importedFile.ts'; // Note: This import is *under* the banner

  //= BANNER TEXT B ============================================================================================
  import type { import } from '../../anotherFile.ts';
  import { something } from './localFile.ts';

  // Note: If BANNER TEXT C had no imports, it would be omitted entirely,
  // and there would be one blank line before the end marker.

  //--------------------------------------------------------------------------------------------------------------<<
~~~
<!-- Close Fold -->

<!-- Close Fold - Import Section Structure ---------------------------------------------------------- -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# Global Rules
<!-- ---------------------------------------------------------------------------------------------------- -->
Apply these rules globally across all guidelines, tasks, and general actions taken.

## Meta-Guidelines for Document Structure (NEW SECTION) <!-- Start Fold -->

### Rule: Guideline Formatting Convention
  - **Directive:** All descriptive guidelines, rules, and directives within this document **MUST** be formatted using the following structure:
    - A heading for the rule: `### Rule: Descriptive Rule Name`
    - Followed by one or more directive points: `  - **Directive:** Specific instruction or requirement.`
    - Sub-directives or notes can be indented further.
  - **Rationale:** This ensures a consistent, readable, and easily parsable structure for all guidelines.

<!-- Close Fold -->

## Presentation Rules <!-- Start Fold -->

### Rule: Markdown Content Presentation
  - **Directive:** When presenting content formatted as markdown:
     - Enclose the entire markdown content within a markdown-flavored code block using triple backticks (e.g., ` ```markdown title="DerivedTitle"`) for the outer fence. The `title` attribute **MUST** be included.
     - **CRITICAL FOR NESTED CODE:** For code examples (e.g., TypeScript, shell, JSON, etc.) embedded *within* an outer markdown code block, these inner examples **MUST** use triple tildes (e.g., `~~~typescript ... ~~~` or `~~~json ... ~~~`) for their fences. These inner code blocks do **NOT** require a `title` attribute. **Verify this distinction meticulously.**
     - **DO NOT** use Roman numerals (I, II, III) or letters (A, B, C) for numbering *headings or sections* within the markdown content.

### Rule: Modified Guideline Presentation
  - **Directive:** When a prompt guideline or task is modified and added to context:
     - Show the changed section of the markdown file, including its heading, formatted as a markdown code block preceded by a breadcrumb.
     - The `title` for this markdown code block **MUST** be derived from the breadcrumb, appending the primary heading of the changed section (e.g., `title="FileName.md > Changed Section Heading"`).
     - **DO NOT** use code block folding markers (`//>` / `//<`) for this content.

### Rule: Next Step Presentation Format <!-- Start Fold -->
  - **Directive:** When indicating the next step in a multi-step process (e.g., "Next step is:"):
    - The description of the next step **MUST** be limited to its primary heading or the first significant line of its description.
    - **AVOID** including the full multi-line content or detailed sub-points of the next step in this summary line.
    - _Example:_
      ```
      Next step is:
      3. Define IVSCodeAPISimulatorVFSHelpers Interface:
      ```
<!-- Close Fold -->

<!-- Close Fold -->

## Omissions <!-- Start Fold -->

### Rule: Omit Unchanged File Statements
  - **Directive:** **NEVER** state if a file did not require changes.

### Rule: Omit Guideline Adherence Statements
  - **Directive:** **NEVER** state that changes adhere to the project's guidelines.

### Rule: Omit Non-Modified Reference Code
  - **Directive:** **NEVER** show code blocks intended _only_ for reference or context and **not** being changed.
    - This includes code shown just to indicate a location or for examination without modification.
<!-- Close Fold -->

## Post presentation summaries and explanations <!-- Start Fold -->

### Rule: Remember and Ask (for "Remembered List") <!-- Start Fold -->
  - **Applies to:** the following lists/sections detailing the process and outcomes of a turn, named **Remembered List**:
    - These specifically :
      - **Steps Taken**
      - **Changes made during a fix/task**
      - **Code verification steps**
      - any variation of the bulleted list detailing verification steps before presenting code.
      - _Example:_ `Verified that:`
  - **Directive:**
    - Catalog and store the content for all these lists/sections internally.
    - Specifically, **DO NOT** show the **Remembered List** sections automatically in the primary output.
  - **After presenting the primary output of the task (e.g., the analysis report, the cleaned code, etc.):**
    - Include these lists/sections as options in the final question asking the user if they would like to see them.
    - Only offer to show sections that actually contain information.
<!-- Close Fold -->

### Rule: Omit if empty (for "Empty Omit" sections) <!-- Start Fold -->
  - **Applies to:** the following lists/sections detailing the findings during a turn, named **Empty Omit**:
      - "Ambiguous or Conflicting Rules"
      - "Potential Logical or Type-Related Bugs"
  - **Directive:**
    - Include these sections directly in the primary output if they contain information.
    - Omit these sections entirely from the output if they are empty (have no findings or content to report).
    - These sections are **NOT** part of the "Remember and Ask" mechanism; do not offer them as optional post-output information.
<!-- Close Fold -->
<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# Code Presentation Guidelines (General)
<!-- ---------------------------------------------------------------------------------------------------- -->
These guidelines specify how to present code changes. Do not apply tasks unless asked to do so.

## What to Show <!-- Start Fold -->

### Rule: Show Only Changed Code Blocks
  - **Directive:** Unless specifically asked otherwise, show **only** the changed code blocks.

### Rule: Presenting Complete Elements
  - **Directive:** If presenting a complete method, function, or class definition as a result of a change:
    - Present it in its own dedicated code block.
    - This applies even if other complete elements within the same parent (e.g., other methods in the same class) were also modified.

### Rule: Presenting Partial Element Changes
  - **Directive:** For changes *within* a method, function, or other logical block that do not encompass the entire element, present the changed code as the **complete containing element** (e.g., the full `if` statement, loop, or the smallest logical block that was modified).

### Rule: Presenting Related Multi-File Changes <!-- Start Fold -->
  - **Directive:**
    - If a single, discrete action or step (e.g., from an action plan) directly results in modifications to multiple files that are tightly coupled (such as an interface and its primary implementation, or a service and its corresponding registration in a DI container):
        - You **MAY** present the changes for these directly related files within the same response turn if doing so provides immediate clarity and context for the *specific action being completed*.
        - Each file's changes **MUST** still be presented in its own separate code block, adhering to all standard breadcrumb, title, and formatting guidelines.
        - This is an exception to the general approach of one primary file modification per turn and **SHOULD** be used judiciously, focusing on changes that are two sides of the same coin for the *current step*.
    - **AVOID** using this to group unrelated changes or too many files, which could make the response overly long or difficult to follow.
    - If unsure whether to group, **default** to presenting changes one file at a time per turn.
<!-- Close Fold -->

<!-- Close Fold -->

## Context and Placement <!-- Start Fold -->

### Rule: Context for New Code Blocks
  - **Directive:** When presenting a _new_ code block to be added, use ellipsis comments (`// ...`) before or after the block to show the surrounding method/function for placement context.
<!-- Close Fold -->

## What NOT to Show <!-- Start Fold -->

### Rule: No Reference-Only Code Blocks (Reiteration)
  - **Directive:** **NEVER** show code blocks intended _only_ for reference or context and **not** being changed. This includes code shown just to indicate a location or for examination without modification.
<!-- Close Fold -->

## Presentation Format <!-- Start Fold -->

### Rule: Breadcrumb Precedence for Code Blocks
  - **Directive:** Directly precede each code block with a breadcrumb string indicating its location (see 'Breadcrumb Format' above).

### Rule: Code Block Fencing and Title Derivation
  - **Directive:**
    - Present code as code blocks.
    - Derive the `title` in the code block fence from the breadcrumb using the following steps:
        1.  Identify the core file name (e.g., `FileName.ts`) from the breadcrumb.
        2.  Append any subsequent path elements from the breadcrumb that follow the file name (e.g., ` > ClassName > MethodName`).
        3.  If the breadcrumb includes a suffix like `` or ` - (PARTIAL)`, append this suffix to the title.
        4.  **CRITICAL:** The final title **MUST NOT** include the leading `🔸 ` symbol or any parenthesized unique path prefix (e.g., `(src/utils)`) from the breadcrumb.
    - _Example Derivation:_
      - Breadcrumb: `🔸 (src/services) MyClassFile.ts > MyClass > newMethod`
      - Title: `title="MyClassFile.ts > MyClass > newMethod"`
      - Breadcrumb: `🔸 MyFile.ts`
      - Title: `title="MyFile.ts"`
      - Breadcrumb: `🔸 MyClassFile.ts > MyClass > myMethod - (PARTIAL)`
      - Title: `title="MyClassFile.ts > MyClass > myMethod - (PARTIAL)"`
<!-- Close Fold -->

## Code Structure and Organization <!-- Start Fold -->

### Rule: Class Member Ordering
  - **Directive:** When presenting or modifying class structures, **SHOULD** adhere to a conventional ordering of members:
    1.  **Static Properties & Methods:** Place static members first.
    2.  **Instance Properties (Fields):** Place instance property declarations next.
    3.  **Constructor:** The `constructor` **SHOULD** follow instance property declarations.
    4.  **Accessors (Getters/Setters):** Place public getters and setters after the constructor.
    5.  **Public Methods:** Place public methods next.
    6.  **Internal/Protected/Private Methods:** Place non-public methods last.

### Rule: Section Banner Formatting and Spacing (CRITICAL) <!-- Start Fold -->
  - **Directive:** These directives define the required appearance and spacing for all section banners within class and interface bodies. Strict adherence is mandatory. Existing banners that do not conform **MUST** be removed and recreated according to these rules.

#### Rule: Banner Spacing (ABSOLUTELY CRITICAL) <!-- Start Fold -->
  - **Directive:** The spacing around **EVERY** banner **MUST** follow this exact pattern:
    - This rule applies universally and overrides general member spacing rules immediately adjacent to the banner.
    - There **MUST** be exactly **ONE** blank line immediately _before_ the banner (between the banner and the code element or opening brace above it, unless the banner is the very first element after an opening brace, in which case there is no blank line before it).
    - There **MUST** be exactly **ONE** blank line immediately _after_ the banner (between the banner and the first line of the member or its JSDoc comment below it).
<!-- Close Fold -->

#### Rule: Banner Appearance (CRITICAL) <!-- Start Fold -->
  - **Directive:** The appearance for **EVERY** banner **MUST** follow this precisely:
    - **CRITICAL:** This is the **ONLY** permitted default banner format. Any existing banners, including large multi-line section banners, **MUST** be replaced with this standard 3-line format.
    - Each banner line (excluding language-specific comment indicators and any indentation) **MUST** be exactly 100 characters wide.
    - The structure **MUST** be:
        - Top Line: `┌` followed by 98 `─` characters, ending with `┐`.
        - Center Line (Default Left-Aligned Style): `│` followed by exactly two spaces (`  `), then the Banner Text (in ALL CAPS). The Banner Text is followed by a variable number of trailing spaces such that the total length of characters between the opening `│` and closing `│` is exactly 98. This results in the Banner Text being left-aligned after the initial two spaces.
            - The Banner Text itself **SHOULD** be concise (e.g., `PROPERTIES`, `METHODS`, `INTERNAL HELPERS`, `EVENT EMITTERS`).
            - **Optional Centered Style:** If explicitly requested by the user, the Banner Text **MAY** be centered. In this case, the Banner Text (in ALL CAPS) is positioned such that it is centered within the 98-character space between the opening `│` and closing `│`. The initial two spaces (`  `) prescribed for the default left-aligned style are *not* automatically prepended before centering; instead, the centering calculation determines the padding on both sides of the Banner Text to achieve true centering within the 98-character content area. If the total padding spaces for centering (98 - length of Banner Text) are odd, the extra space **MAY** be placed on either side of the Banner Text.
        - Bottom Line: `└` followed by 98 `─` characters, ending with `┘`.
    - Language-specific comment indicators (e.g., `//` for TypeScript) **MUST** be added to the beginning of each banner line.
  - _Example (Default Left-Aligned Style - Corrected Spacing):_
    (Assuming "EXAMPLE BANNER TEXT" is 19 characters. `2 (leading spaces) + 19 (text) + 77 (trailing spaces) = 98` characters between `â”‚` and `â”‚`.)
    ```typescript
    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  EXAMPLE BANNER TEXT                                                                             │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    ```
  - _Example (Optional Centered Style):_
    ```typescript
    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │                                      PUBLIC API NAMESPACES                                       │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    ```
<!-- Close Fold -->

#### Rule: Banner Placement and Inclusion (CRITICAL) <!-- Start Fold -->
  - **Directive:** Banners are used to group related members (e.g., Properties, Methods, Internal Helpers) within class and interface bodies.
  - **Directive:** A banner **MUST ONLY** be included if there are members of that group defined immediately after it, before the next banner or the end of the class/interface.
  - **Directive:** **Initial Members:**
    - The **first members** defined immediately after the opening brace (`{`) of a class or interface body (e.g., index signatures, core internal state fields directly initialized) **SHOULD** be placed *before* the first section banner.
  - **Directive:** **Constructor Placement:**
    - The `constructor` **MUST NOT** be preceded directly by a "PROPERTIES" or similar banner if that banner is intended for field declarations that appear *before* the constructor.
    - If fields are declared before the constructor, a "PROPERTIES" banner may precede those fields. The constructor would then follow, potentially without its own banner or under a more general "INITIALIZATION" banner if deemed necessary (though typically constructors are not bannered).
  - **Directive:** **Order of Banners:** When multiple types of member groups exist, banners **SHOULD** generally follow the order of members outlined in "Rule: Class Member Ordering" (e.g., Properties, Accessors, Public Methods, Internal Methods).

<!-- Close Fold -->

<!-- Close Fold -->

<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# General AI Behavior and Interaction
<!-- ---------------------------------------------------------------------------------------------------- -->
These guidelines define the core behavior as a helpful coding assistant.

## Conversation Context <!-- Start Fold -->

### Rule: Maintain Conversational State
  - **Directive:** Operate as part of an ongoing conversation. Retain information from previous interactions, including instructions, preferences, and discussions, to maintain a consistent approach.
<!-- Close Fold -->

## Code Handling and Verification (CRITICAL - Adhere Strictly) <!-- Start Fold -->
  - **Constraint:** Failure to adhere strictly to these verification steps can result in incorrect analysis, flawed code suggestions, and wasted effort.

### Rule: No Assumptions (Logic or Syntax)
  - **Directive:** **NEVER** assume code logic or syntax. **ENSURE** all variables have either an explicit type annotation or a clearly and unambiguously inferable type, especially within conditional blocks or complex expressions. If TypeScript inference is not straightforward, **ADD** an explicit type.
      
### Rule: Verification of Type/Value Origins
  - **Directive:** When determining the source of a type or value for an import or usage:
    1.  First, check the provided file tree for explicit local definitions (e.g., within the `src/_vscCore/` directory or adjacent files). **Verify the *exact* export name being imported exists in the source file, paying attention to any internal aliasing (e.g., `import { X as Y } from '...'`) within that source file.** Do not assume an export exists just because related members are exported from the same file.
    2.  If the origin is not immediately apparent from the local file structure, **MUST** consult dependency injection configuration files (e.g., `module_injection.ts` if provided in context) to see if the type/value is sourced from an external library or registered in a specific way.
    3.  For types from external libraries (like Node.js built-ins or third-party packages not directly in the project's source tree), **VERIFY** their exact definition and export status from authoritative sources or type declaration files if uncertainty exists. Do not assume members or specific literal values within union types.
    4.  If the origin or exact type definition remains unclear after these checks, **MUST ASK** for clarification.

### Rule: Interface and Implementation Signature Congruence
  - **Directive:** When a class implements an interface, **ENSURE** that the signatures of the implemented methods in the class are fully assignable to and compatible with the corresponding method signatures defined in the interface.
  - For methods with multiple overloads in the interface:
    - The class **MUST** provide a single implementation signature.
    - This single implementation signature's parameters **MUST** be general enough to encompass all parameter variations of the interface overloads.
    - This single implementation signature's return type **MUST** be assignable to the return type of *each individual overload* in the interface. If the overloads have different return types, the implementation's return type might need to be a union of those types, or `any` if absolutely necessary (though specific unions are preferred). The key is that for any given call matching an interface overload, the implementation must be capable of returning a value compatible with that specific overload's expected return type.

### Rule: Interface Overload Definition Syntax
  - **Directive:** When defining overloaded method signatures within a TypeScript interface:
    1. List each overload signature on a new line.
    2. Each overload signature consists of the method name, its parameter list, and its return type, followed by a semicolon.
    3. **CRITICAL:** Do **NOT** repeat the `methodName:` part for subsequent overloads. The method name is declared once, and the subsequent lines are treated as its different call signatures.

  - _Correct Example:_
    ```typescript
    interface MyInterface {
        myOverloadedMethod(param: string): string;
        myOverloadedMethod(param: number): number;
        myOverloadedMethod(param: boolean, another: string): boolean;
    }
    ```
  - _Incorrect Example (Do NOT do this):_
    ```typescript
    interface MyInterface {
        myOverloadedMethod: (param: string) => string; // Incorrect: using colon for first
        myOverloadedMethod: (param: number) => number; // Incorrect: repeating method name with colon
    }
    ```

### Rule: Handling Node.js Globals (e.g., Buffer, process)
  - **Directive:** When using Node.js global types or objects (such as `Buffer`, `process`, `__dirname`, `__filename`, `URL`, `URLSearchParams`, `TextEncoder`, `TextDecoder`):
    1.  **Type Usage:** For type annotations, **ALWAYS** import the type explicitly from its respective Node.js built-in module (e.g., `import type { Buffer } from 'node:buffer';`, `import type { Process } from 'node:process';`).
    2.  **Value Usage:** For runtime value usage, **ALWAYS** import the value explicitly from its respective Node.js built-in module (e.g., `import { Buffer } from 'node:buffer';`, `import process from 'node:process';`).
  - **Rationale:** This practice promotes clarity, avoids reliance on ambient global types which can sometimes be ambiguous or conflict, and aligns with modern Node.js module practices and common ESLint configurations that enforce explicit imports for globals.

### Rule: TypeScript Interface Method Signature Style (ESLint: ts/method-signature-style)
  - **Directive:** When defining methods in TypeScript interfaces, **MUST** use the function property signature style.
  - _Correct (Function Property Style):_
    ```typescript
    interface MyInterface {
        myMethod: (param1: string, param2: number) => boolean;
        anotherMethod: () => void;
    }
    ```
  - _Incorrect (Shorthand Method Style - Avoid if ESLint rule is active):_
    ```typescript
    interface MyInterface {
        myMethod(param1: string, param2: number): boolean;
        anotherMethod(): void;
    }
    ```
  - **Rationale:** This aligns with the project's ESLint configuration (`@typescript-eslint/method-signature-style: 'property'`) for consistency.

### Rule: No Redundant Comments
  - **Directive:** **NEVER** generate redundant comments.

### Rule: Request Missing Relevant Code
  - **Directive:** If code relevant to the task was not provided in the current conversation, **MUST ASK** for it to be shown.

### Rule: Pinpoint and Follow Code Paths
  - **Directive:** When analyzing code, **MUST** pinpoint exact methods and follow the code path as described or shown.

### Rule: Ask for Clarification When Unsure
  - **Directive:** If unsure about _anything_, **MUST ASK** for clarification.

### Rule: Review Code Before Suggesting Changes
  - **Directive:** Before suggesting _any_ changes, **MUST** meticulously review the provided code again to ensure a solid grasp of its current implementation.

### Rule: Clarify Guideline Conflicts
  - **Directive:** If a request seems to conflict with these guidelines, or if unsure how to apply a rule in a specific context, **MUST ASK** for clarification before proceeding.
<!-- Close Fold -->

## Strategies for Guideline Interpretation and Adaptation <!-- Start Fold -->
  These strategies are designed to enhance the AI's ability to interpret guidelines accurately and adapt to changes, ensuring consistent adherence.

### Rule: Explicit Prioritization and Conflict Resolution <!-- Start Fold -->
  - **Directive:** In cases of perceived conflict between guidelines, or when multiple guidelines seem applicable with differing implications, the AI **MUST** prioritize rules in the following order (unless explicitly stated otherwise within a specific rule):
    1.  Directives explicitly marked as `CRITICAL` (e.g., `VSCode Import Rules (CRITICAL DIRECTIVE)`, rules within `CRITICAL (DO NOT DEVIATE): Final Review`).
    2.  Task-Specific Guidelines (e.g., from `_Tasks.md`, `_Analysis.md`).
    3.  File-Type Specific Guidelines (e.g., `#Source File Guidelines`, `#Test Interaction Guidelines`).
    4.  Project Specific Directives (e.g., `#Project Specific Directives (mockly-vsc)`).
    5.  Guideline Helpers (e.g., `Breadcrumb Format`, `Code Block Folding Markers`, `Import Section Structure`).
    6.  General AI Behavior and Interaction rules.
  - If ambiguity persists after applying this hierarchy, or if a situation arises not clearly covered, the AI **MUST ASK** for clarification before proceeding.
<!-- Close Fold -->

### Rule: Post-Refactoring Vigilance and Proactive Clarification <!-- Start Fold -->
  - **Directive:** Following any significant refactoring or substantial modification of these guidelines:
    1.  The AI **MUST** operate with heightened vigilance, paying extra attention to newly introduced or altered sections.
    2.  If any refactored rule, section, or term seems ambiguous, less clear than a previous version (if known), or its interaction with other rules is uncertain, the AI **MUST proactively ASK** for clarification or illustrative examples *before* attempting to apply it in a task.
    3.  This includes explicitly stating which part of the refactored guidelines is causing uncertainty.
<!-- Close Fold -->

### Rule: Structured Final Review Augmentation <!-- Start Fold -->
  - **Directive:** To complement the `CRITICAL (DO NOT DEVIATE): Final Review` section, the AI **MUST** perform an internal, structured cross-check of its response against key guideline categories *before* finalizing its output. This involves:
    1.  Identifying the major categories of guidelines applicable to the current task (e.g., Breadcrumbs, Code Block Titles, Import Structure, Test File Formatting, VSCode-specific rules, Task-specific rules).
    2.  Systematically verifying that the response adheres to the core requirements within each identified category.
  - This serves as an explicit internal step to ensure broader guideline coverage beyond the specific checklist items in the "Final Review" section, aiming to catch systemic misses.
<!-- Close Fold -->
<!-- Close Fold -->

## Responding to Guideline Deviation Feedback <!-- Start Fold -->

### Rule: Process for Addressing Guideline Deviations
- **Directive:** When a deviation from these guidelines is brought to your attention by the user:
    1.  **Acknowledge and Detail Error:**
        - In your immediate response, clearly acknowledge the deviation.
        - Provide a concise explanation of what was done incorrectly by detailing the specific guideline(s) that were not fully adhered to or were misapplied.
    2.  **Analyze Guideline Sufficiency and Propose Improvement:**
        - **Assume a Guideline Gap (Universal Principle):** Operate under the assumption that if *any* deviation occurred (including deviations in how you respond to feedback about other deviations), the guidelines—as they were presented or understood by you—were not sufficiently clear, comprehensive, or specific to prevent the error in that context.
        - **Identify the Gap:** Pinpoint the ambiguity, omission, lack of specificity, or missing heuristic in the existing guidelines that contributed to the deviation.
        - **Propose Concrete Changes:** Present a markdown code block (using the standard breadcrumb and title format for guideline file changes, e.g., `🔸 .Prompts/_GeminiGuidelines.md > Relevant Section Heading`) showing the proposed changes (additions, modifications, clarifications, or new examples) to the relevant prompt or guideline file(s).
        - **Explain the Rationale:** Briefly explain how the proposed changes aim to address the identified gap and prevent similar deviations in future conversations.
        - **Avoid Deflection & Ensure Self-Application:** Do not state that "the guidelines were sufficient but misapplied." Instead, focus on how the guidelines can be improved to make the correct application more explicit or robust. **CRITICAL: This principle of assuming a guideline gap and proposing improvements MUST be applied reflexively. If you, the AI, fail to adhere to this (e.g., by stating guidelines were sufficient after a deviation), then in your *next* response, you MUST identify this specific failure as a deviation from *this* feedback-response guideline itself, and then propose an improvement to *this very section* to prevent such meta-deviations.**
<!-- Close Fold -->

## Task-Specific Guideline Application <!-- Start Fold -->

### Rule: Prioritize Task-Specific Rules
  - **Directive:** When a specific task is requested (e.g., "Cleanup a file," "Generate JSDoc," "Analyze code"), prioritize and apply the rules detailed in the corresponding task-specific section of the `.Prompts/_Tasks.md` or `.Prompts/_Analysis.md` files.
  - These task-specific rules **SHOULD** be considered in conjunction with these general AI behaviors, the Guideline Helpers, and any relevant file-type specific guidelines (Source File, Testing).
  - For example:
    - If asked to "clean up `MyFile.test.ts`", apply rules from `#Guideline Helpers`, `#General AI Behavior and Interaction`, `#Test Interaction Guidelines`, and the "Cleanup a file" task in `_Tasks.md`.
    - If asked to "analyze `module_injection.ts`", apply rules from `#Guideline Helpers`, `#General AI Behavior and Interaction`, `#Source File Guidelines` (if applicable), and the "Comprehensive Analysis" task (specifically "Dependency Injection Analysis") in `_Analysis.md`.
<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# Test Interaction Guidelines
<!-- ---------------------------------------------------------------------------------------------------- -->
These guidelines specify how to interact with test code and propose fixes.

## Source Code Fixes <!-- Start Fold -->

### Rule: Propose Source Fixes for Test-Indicated Bugs
  - **Directive:** If a test failure clearly indicates a bug in the **source code being tested**, propose corrections to that source code file.
  - Present source code changes using standard code presentation guidelines.
<!-- Close Fold -->

## Test Code Presentation (CRITICAL) <!-- Start Fold -->

### Rule: Standard Breadcrumb for Test Code
  - **Directive:** Always use the standard breadcrumb format (e.g., `🔸 test > MyTestFile.test.ts > MyFeature describe block`) above the code block to indicate the file and the parent `describe` block (if applicable).

### Rule: Presentation of Multiple/Non-It Block Changes
  - **Directive:** If modifications in the current response turn affect **multiple elements** (e.g., more than one `it` block, any hooks like `beforeEach`/`afterEach`, nested `describe` blocks) **within the same parent `describe` block**, OR if the modification affects **only non-`it` block elements** (like hooks or nested `describe`s) within that parent `describe`, you **MUST** show the **entire parent `describe` block** definition (`describe(...) { ... }`) containing *all* the modified elements.

### Rule: Presentation of Single It Block Changes (Exception)
  - **Directive:**
    - This exception applies **if and only if** the **sole modification** affecting a particular parent `describe` block in the current response turn is to **one single, individual `it` block**.
    - In this specific case only:
      - Show **only** that specific `it` block.
      - **Do not** include the parent `describe` block definition (`describe(...) { ... }`).
      - **Do not** include any other pre-existing `it` blocks or hooks from that `describe` block that were not modified.
<!-- Close Fold -->

## Test File Structure and Formatting (CRITICAL) <!-- Start Fold -->

### Rule: Overall Test File Structure <!-- Start Fold -->
  - **Directive:**
    - Standard Import Section (`// ESLint & Imports -->>` ... `//--------------------------------------------------------------------------------------------------------------<<`).
    - One blank line after the import section.
    - Top-level elements (e.g., helper functions, constants) if any, with one blank line between them.
    - One blank line between the last top-level element (or import section if no top-level elements) and the primary `describe` block.
    - The primary (outermost) `describe` block.
    - Clearly separate **Arrange**, **Act**, and **Assert** sections within each `it` block using comments (e.g., `// Arrange`, `// Act`, `// Assert`).
<!-- Close Fold -->

### Rule: Folding Markers in Test Files <!-- Start Fold -->
  - **Directive:**
    - **Primary Describe Block:**
      - **No** folding markers (`//>`, `//<`) on the primary `describe` definition line or its closing brace.
    - **Nested Describe Block:**
      - Add `//>` at the end of the line that starts a nested `describe` block.
      - Add `//<` at the end of the line that closes a nested `describe` block.
    - **It Block:**
      - Add `//>` at the end of the line that starts an `it` block definition.
      - Add `//<` at the end of the line that closes an `it` block.
    - **Hook Formatting (beforeEach, afterEach, etc.):**
      - Add `//>` at the end of the line that starts the hook definition (e.g., `beforeEach(() => { //>`).
      - Add `//<` at the end of the line that closes the hook (e.g., `}); //<`).
<!-- Close Fold -->

### Rule: Describe Block Setup Section <!-- Start Fold -->
  - **Presence:**
    - **Directive:** Include this section if the `describe` block contains any `describe`-scoped variable declarations *or* any hooks (`beforeEach`, `afterEach`, etc.).
  - **Markers:**
    - **Directive:**
        - Start the section with `// SETUP -->>` on its own line.
        - End the section with `//-----------------------------------------------------------------------------------<<` on its own line.
  - **Content & Order:**
    - **Directive:**
        1.  Place `describe`-scoped variable declarations first, immediately after `// SETUP -->>`.
        2.  **If** variables are declared, wrap *only* the variable declaration block with `/* eslint-disable unused-imports/no-unused-vars */` and `/* eslint-enable unused-imports/no-unused-vars */`.
        3.  Place hooks (`beforeEach`, `afterEach`, etc.) after the variable declarations (or after the `// SETUP -->>` marker if no variables exist), ensuring appropriate spacing as defined below.
  - **Spacing:**
    - **Directive:**
        - Place the `// SETUP -->>` marker immediately after the opening brace (`{`) of the `describe` block (no blank line between `{` and the marker).
        - Place `describe`-scoped variable declarations immediately after the `// SETUP -->>` marker (if any).
        - Add exactly **ONE** blank line *after* the `// SETUP -->>` marker if there are no variable declarations, OR *after* the closing `/* eslint-enable ... */` comment (or the last variable declaration line if the eslint comments are not used).
        - Place the first hook (`beforeEach`, `afterEach`, etc.) definition immediately after this single blank line. **There MUST NOT be a blank line between this single blank line and the start of the first hook.**
        - Add exactly **ONE** blank line *after* the closing brace (`}); //<`) of the *last* hook definition within the `SETUP` section.
        - Place the `//-----------------------------------------------------------------------------------<<` marker immediately after this single blank line. **There MUST NOT be a blank line between the last hook's closing brace and this marker, only the single blank line specified above.**
        - Place the first `it` block or nested `describe` block immediately after the `//-----------------------------------------------------------------------------------<<` marker (no blank line between the marker and the next element).
<!-- Close Fold -->

### Rule: Spacing in Test Files <!-- Start Fold -->
  - **Directive:**
      - Add exactly **one** blank line _before_ the start of any `describe` block definition.
      - Add exactly **one** blank line _after_ the closing brace (`}); //<` or `})`) of any `describe` block. This ensures separation from subsequent elements or sibling `describe` blocks.
      - **Do not** add blank lines _between_ consecutive `it` blocks within the same `describe` block. **Verify this rule is strictly followed.**
<!-- Close Fold -->
<!-- Close Fold -->

## Failure Correction Order <!-- Start Fold -->

### Rule: Order of Addressing Test Failures
  - **Directive:** Follow these steps when addressing test failures:
    1.  Analyze the root cause of the failure.
    2.  Propose corrections or additions to the **test file(s)** first to accurately reflect the intended behavior of the test, adhering to the formatting guidelines above.
    3.  If the analysis shows the failure is due to a bug in the **source code under test**, then propose the necessary fixes for the source code.
<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# Project Specific Directives (mockly-vsc)
<!-- ---------------------------------------------------------------------------------------------------- -->
Apply these rules specifically when working within the "Mockly" project context.

## VSCode Value Refactoring (WITHOUT FAIL) <!-- Start Fold -->

### Rule: Refactor Direct `vscode` Value References
  - **Directive:** If encountering a reference to a `vscode` value (anything imported from `'vscode'` _without_ the `type` keyword), **MUST REFACTOR** it.
  - Replace the `vscode` value reference with the equivalent local class or enum provided within this project.
<!-- Close Fold -->

## VSCode Import Rules (CRITICAL DIRECTIVE) <!-- Start Fold -->

### Rule: Prohibition of Direct `vscode` Value Imports
  - **Directive:** **NEVER** import values directly from the `'vscode'` module. This includes:
    - `import * as vscode from 'vscode';`
    - `import { Uri, commands, FileType } from 'vscode';`

### Rule: Allowance of `vscode` Type Imports
  - **Directive:** **ONLY** import types from the `'vscode'` module using the `import type` syntax:
    - `import type * as vt from 'vscode'`
    - `import type { Uri as vt_Uri, commands as vt_commands, FileType as vt_FileType } from 'vscode';`
  - **Reason:** The goal is strict decoupling from the actual VS Code runtime. Simulate the API using mock implementations and local enums/classes provided within this project.
<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# Examples
<!-- ---------------------------------------------------------------------------------------------------- -->

## Breadcrumb Format and Code Block Title Examples <!-- Start Fold -->
- _(Showing an **entire file** for **replacement**):_
  _Breadcrumb:_
  🔸 (src/utils) MyEntireFile.ts
  _Code Block Fence:_
~~~typescript title="MyEntireFile.ts"
  // Entire content of MyEntireFile.ts to replace existing
  // ...
~~~
  _Breadcrumb:_
  
- _(Showing an **entire file** for **addition**):_
  _Breadcrumb:_
  🔸 (src/utils) NewFile.ts
  _Code Block Fence:_
~~~typescript title="NewFile.ts"
  // Entire content of the new file
  // ...
~~~
- _(Showing a class **definition** for **replacement**):_
  _Breadcrumb:_
  🔸 MyClassFile.ts > MyClass
  _Code Block Fence:_
~~~typescript title="MyClassFile.ts > MyClass"
  export class MyClass { // Replace existing MyClass with this
      // ... class members ...
  }
~~~
  _Breadcrumb:_
  
- _(Showing a class **definition** for **addition**):_
  _Breadcrumb:_
  🔸 MyClassFile.ts > NewClass
  _Code Block Fence:_
~~~typescript title="MyClassFile.ts > NewClass"
  // ... (optional context)
  export class NewClass { // Add this new class
      // ... class members ...
  }
  // ... (optional context)
~~~
  _Breadcrumb:_
  
- _(Showing a method **definition** for **replacement**):_
  _Breadcrumb:_
  🔸 (src/services) MyClassFile.ts > MyClass > myMethod
  _Code Block Fence:_
~~~typescript title="MyClassFile.ts > MyClass > myMethod"
  myMethod(arg: string): void { // Replace existing myMethod with this
      // ... implementation ...
  }
~~~
  _Breadcrumb:_
  
- _(Showing a method **definition** for **addition** within a class):_
  _Breadcrumb:_
  🔸 (src/services) MyClassFile.ts > MyClass > newMethod
  _Code Block Fence:_
~~~typescript title="MyClassFile.ts > MyClass > newMethod"
  // ... (optional context within MyClass)
  newMethod(arg: number): boolean { // Add this new method to MyClass
      // ... implementation ...
      return true;
  }
  // ... (optional context within MyClass)
~~~
  _Breadcrumb:_
<!-- Close Fold -->

## Code Block Folding Marker Examples <!-- Start Fold -->
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

const myArrowFunction = (): void => { //>
  // implementation
}; //<

const singleLineProperty = 'value'; // Not a block, so no markers

interface MyInterface {
  myMethod(): void; // Not a block, so no markers
  myProperty: string; // Not a block, so no markers
}
~~~
<!-- Close Fold -->

## Test Code Presentation Examples <!-- Start Fold -->
- _(Adding/Modifying a single 'it' block):_
  🔸 test > MyTestFile.test.ts > MyFeature describe block
~~~typescript title="MyTestFile.test.ts > MyFeature describe block - (PARTIAL)"
  it('should handle edge case X', async () => { //>
    // Arrange
    // Act
    // Assert
  }); //<
~~~
- _(Adding/Modifying multiple 'it' blocks, or the 'describe' block itself):_
  🔸 test > MyTestFile.test.ts > MyFeature describe block
~~~typescript title="MyTestFile.test.ts > MyFeature describe block - (PARTIAL)"
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
<!-- Close Fold -->

## Modified Prompt Guideline Section Example <!-- Start Fold -->
- _(Showing a **modified section of a prompt guideline file**):_
  _This example illustrates how the AI should present a modified section of a prompt guideline file (e.g., `_Tasks.md`, `_GeminiGuidelines.md`)._

  _Breadcrumb:_
  🔸 .Prompts/_SampleGuideline.md > Name of Modified Section

  _Presentation of the Markdown Content:_
  (The AI should enclose the following markdown content within a standard markdown code block. The fence should start with ```markdown title="DerivedTitle", where "DerivedTitle" is derived from the breadcrumb, e.g., title="_SampleGuideline.md > Name of Modified Section". The content should then be followed by the closing ``` fence.)

  ## Name of Modified Section <!-- Start Fold -->

  This is the updated content of the section.
  - Rule A has been changed.
  - Rule B is new.

  <!-- Close Fold -->
  (The AI closes the markdown code block here with ```)
  _Breadcrumb:_
<!-- Close Fold -->

<!-- ---------------------------------------------------------------------------------------------------- -->
# CRITICAL (DO NOT DEVIATE): Final Review <!-- Start Fold -->
<!-- ---------------------------------------------------------------------------------------------------- -->

Before presenting the generated code, **verify** and **internally confirm** that:

*   **Code Handling Principles Adhered To:**
    *   Confirm that the principles outlined in the **Code Handling and Verification** section were followed
        *   No assumptions made
        *   Necessary code requested if missing
        *   Clarification sought if unsure
        *   Code reviewed before suggesting changes

*   **Code Block Titles (CRITICAL):** Ensure **ALL** code blocks (identified by triple backticks, e.g., ` ```typescript ` or ` ```markdown `) **MUST** include a `title="..."` attribute in their opening fence. This title **MUST** be derived correctly from the preceding breadcrumb as per the rules in `#Guideline Helpers > Code Presentation Guidelines (General) > Presentation Format > Rule: Code Block Fencing and Title Derivation`.

*   **Breadcrumb Placement and Formatting (CRITICAL):**
    *   Confirm breadcrumbs are placed *before* code block fences, not inside, as per `#Guideline Helpers > Breadcrumb Format`.
    *   Confirm any "unique path prefix" in breadcrumbs is correctly enclosed in parentheses `()` as per `#Guideline Helpers > Breadcrumb Format > Rule: File Path Uniqueness & Formatting`.
    *   

*   **Import Section Integrity (CRITICAL):**
    *   Verify the entire import section adheres to `#Guideline Helpers > Import Section Structure (CRITICAL)`.
    *   Specifically, ensure **NO** comments exist on the same line as import statements or between import statements, other than the prescribed banners and start/end markers.

*   **Redundant Comment Removal:** Meticulously remove all redundant comments as defined in `_Tasks.md` (Cleanup Comments section), paying close attention to comments that merely restate obvious code actions.

*   **Test File Formatting Rules Applied:** For test files, confirm adherence to the structure, spacing, marker, and `SETUP` section rules defined in `#Test Interaction Guidelines > Test File Structure and Formatting (CRITICAL)`. Specifically verify:
    *   **Test Hook Spacing:** Verify spacing within the `SETUP` section (around hooks and markers) matches the guidelines precisely.
    *   **Test `it` Block Spacing:** Confirm no blank lines exist between consecutive `it` blocks within the same `describe` block.

*   **Guideline Adherence:** Confirm that all applicable rules from this document, especially those in `#Guideline Helpers` and any relevant task-specific or file-type specific sections, have been followed.

*   **Keyword Interpretation:** Confirm that keywords like `MUST`, `SHOULD`, etc., have been interpreted according to the [Keyword Definitions](#keyword-definitions) section.

*   **Prioritization Logic:** If any rule conflicts arose or prioritization was needed, confirm it followed the [Explicit Prioritization and Conflict Resolution](#rule-explicit-prioritization-and-conflict-resolution) strategy.

 <!-- Close Fold -->
