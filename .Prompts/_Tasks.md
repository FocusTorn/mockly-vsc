# Task: Cleanup a file <!-- Start Fold -->


## Output Format <!-- Start Fold -->

- Use `Guidelines for Behavior and Code/Testing Interactions for Gemini` as the presentation basis..
  - For this 'Cleanup a file' task:
    - If the final generated code that is to be presented is:
      - identacle to the orrriginal source file, do not show the file. This is an explicit exception and overides other conflicting rules.
      - has only a location change note location change. This is an explicit exception and overides other conflicting rules.
    - If the request uses the specific phrasing `clean up <fileName>`, `clean up <directoryName>`, or `clean up all files in <directoryName>`, you **MUST** present the **entire cleaned file** content for each modified file. Do not use the general rule of showing only changed blocks. This is an explicit exception.
    - Otherwise (if the file was modified and the request phrasing does not match one of the specified cleanup commands), follow the general code presentation guidelines (show only changed blocks as complete containing elements).

  - Note:
  - `clean up <fileName>`: Clean the file and show the entire cleaned file content.
  - `clean up <directoryName>`: Clean files in the directory (non-recursive) and show the entire cleaned file content for each modified file, followed by a single combined summary for all cleaned files in the directory.
  - `clean up all files in <directoryName>`: Clean files in the directory (recursive) and show the entire cleaned file content for each modified file, followed by a single combined summary for all cleaned files in the directory.

<!-- Close Fold -->

## Import Section Structure (CRITICAL) <!-- Start Fold -->

**CRITICAL:** Verify and ensure that all import paths (`import`, `import type`) are **correct and valid** relative to the file's location. **Do not modify import paths unless the file itself is being moved as part of the task.**

**Overall Structure:** <!-- Start Fold -->

- Located at the top of the file.
- Starts with: `// ESLint & Imports -->>`
- Ends with: `//--------------------------------------------------------------------------------------------------------------<<`

<!-- Close Fold -->

**Banners & Ordering:** <!-- Start Fold -->

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

**Import Placement:** <!-- Start Fold -->

- **CRITICAL:** All import statements **MUST** be placed _after_ the `// ESLint & Imports -->>` marker and _under_ the first relevant banner. No imports should appear _before_ the first banner.
- Place each import statement directly under its corresponding banner.
- **Specific Banner Purposes:**
  - Imports under `//= IMPLEMENTATIONS =` are specifically for **concrete class or value imports**.
  - Imports from `vscode-uri` should be under the `VSCODE TYPES & MOCKED INTERNALS`.
  - **In Interface files:** Concrete classes imported _only_ for type hinting (e.g., `import { ConcreteClass } from './concrete'; type Alias = ConcreteClass;`) should be placed under the relevant type banner (e.g., `//= VSCODE TYPES & MOCKED INTERNALS =`) rather than `//= IMPLEMENTATIONS =`.
- **CRITICAL:** Interface files **MUST NEVER** import their own interface definition.

<!-- Close Fold -->

**Spacing:** <!-- Start Fold -->

**(ABSOLUTELY CRITICAL - Verify Multiple Times)**

- Exactly **ONE** blank line immediately **before** each banner.
- Exactly **ONE** blank line immediately **after** the last import statement under a banner (or before the final `//--------------------------------------------------------------------------------------------------------------<<` marker).
- **NEVER** have two or more consecutive blank lines anywhere within the import section.

_Example Spacing:_

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

<!-- Close Fold -->

## Cleanup Comments <!-- Start Fold -->

- Ensure all _Code Block Folding Markers_ are being used correctly.
- Remove redundant comments, except:
  - `//  -->>`
  - `//  --<<`
  - `//= ... =====`
  - `//- ... -----`
  - `//>`
  - `//<`

<!-- Close Fold: Cleanup Comments -->

## Section Banner Formatting and Spacing (CRITICAL) <!-- Start Fold -->

Existing banners **MUST** be removed and recreated according to these rules.

These directives define the required appearance and spacing for all section banners within class and interface bodies. Strict adherence is mandatory.

### **Banner Spacing (ABSOLUTELY CRITICAL):** <!-- Start Fold -->

- The spacing around **EVERY** banner **MUST** follow this exact pattern:
  - This rule applies universally and overrides general member spacing rules immediately adjacent to the banner.
  - There **MUST** be exactly **ONE** blank line immediately _before_ the banner (between the banner and the code element or opening brace above it).
  - There **MUST** be exactly **ONE** blank line immediately _after_ the banner (between the banner and the first line of the member or its JSDoc comment below it).

<!-- Close Fold -->

### **Banner Appearance:** <!-- Start Fold -->

Existing banners **MUST** be removed and recreated according to these rules.

- The appearance for **EVERY** banner **MUST** follow this precisly:

  - **CRITICAL:** This is the **ONLY** permitted banner format. Any existing banners, including large multi-line section banners, **MUST** be replaced with this standard 3-line format.

  - Each banner line (excluding language-specific comment indicators and any indentation) **MUST** be exactly 100 characters wide.

  - The structure **MUST** be:
    - Top Line: `┌` followed by 98 `─` characters, ending with `┐`.
    - Center Line: `│` followed by exactly two spaces (``), then the Banner Text, followed by enough spaces to reach the 99th character, ending with `│`. (Padding = 100 - 3 - text length - 1).
    - Bottom Line: `└` followed by 98 `─` characters, ending with `┘`.

  - Language-specific comment indicators (e.g., `//` for TypeScript) **MUST** be added to the beginning of each banner line.

  - _Example:_
    ~~~typescript
    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  EXAMPLE BANNER TEXT                                                                             │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    ~~~

<!-- Close Fold -->

### **Banner Placement and Inclusion:** <!-- Start Fold -->

- The existance of **ANY** banner **MUST ALWAYS** adhere to this:
  - Banners are used to group members (Properties, Methods, Internal) within class and interface bodies.
  - A banner **MUST ONLY** be included if there are members defined immediately after it before the next banner or the end of the class/interface.

  - The **first members** defined immediately after the opening brace (`{`) of a class or interface body **MUST** be placed _before_ the first section banner.
  - This applies to all initial members, including (but not limited to) index signatures (`[key: string]: any;`) and core internal state/configuration properties (in classes).
  - Subsequent banners (e.g., `PROPERTIES`, `METHODS`, `INTERNAL`) are used to group members that appear _after_ these initial members.
  - **REMINDER:** When a banner is included according to these placement rules, it **MUST** use the standard 3-line format defined in the "Banner Appearance" section above.

<!-- Close Fold -->

<!-- Close Fold -->

## CRITICAL (DO NOT DEVIATE): Final Review <!-- Start Fold -->

- Before presenting the generated code, **verify** and **internally confirm** that:
  - **NEVER** more than 1 consecutive blank line within the import section.
  - no import banners are present if they are not followed by imports.
  - all import paths are correct and valid relative to the file's location.
  - all class body section banners are formatted according to the guidelines (100 characters wide)"
  - the top, center and bottom line of the class body section banners are all the same character length.
  - each banner's center line has _exactly_ two spaces after the opening `│` character.
  - banner spacing rules (1 blank line above, 1 blank line below) are applied correctly in **both class and interface** bodies.
  - member spacing rules (0 blank lines between single-line, 1 blank line between multi-line) are applied correctly in **both class and interface** bodies.

<!-- Close Fold -->

<!-- Close Fold - Cleanup a file ------------------------------------------------------------------------ -->

# Task: Generate JSdoc <!-- Start Fold -->

**CRITICAL:** Do not add JSDoc to to generated code unless asked.

- **Classes and Interfaces:**
  - Provide a brief description of their purpose.

- **Methods and Functions (Public, Private, Internal):**
  - Provide a brief description of what the method/function does.
  - For each parameter, include an `@param` tag with the parameter name and a description.
  - If a parameter is an object with relevant properties, **each relevant property MUST be documented** using dot notation (e.g., `@param opt.show`).
  - If the method/function returns a value, include an `@returns` tag with a description of the return value.
  - If the method/function can throw specific errors, include `@throws` tags.
  - If implementing an interface method, consider using `@inheritdoc` if the documentation is identical.

- **Properties (Public, Private, Internal):**
  - Provide a brief description, especially for properties that are part of a public interface or represent significant state.

- **Interface Members (Methods, Properties):**
  - Document the purpose, parameters, and return values as described for methods/functions and properties.

<!-- Close Fold ---------------------------------------------------------------------------------------------- -->
