# Test Control & State Management

Effective testing often requires careful control over the environment's state to ensure tests are isolated and repeatable. Mockly-VSC provides the `vscodeSimulator` object specifically for this purpose.

## Resetting the Mock Environment with vscodeSimulator.reset()

The most critical function for test control is `vscodeSimulator.reset()`. To ensure that each test runs in a clean, predictable environment and that state from one test does not leak into another, you should call `await vscodeSimulator.reset()` before each test (e.g., in a `beforeEach` block) or after each test (in an `afterEach` block).

**What `vscodeSimulator.reset()` does:**

Calling `reset()` clears and resets virtually all aspects of the mock VSCode environment, including:

- **Workspace:**
  - Removes all workspace folders (`mockly.workspace.workspaceFolders` becomes `undefined`).
  - Clears the workspace name (`mockly.workspace.name`) and workspace file URI (`mockly.workspace.workspaceFile`).
- **Text Documents & Editors:**
  - Closes all open text documents (`mockly.workspace.textDocuments` becomes empty).
  - Clears the active text editor (`mockly.window.activeTextEditor` becomes `undefined`).
  - Clears all visible text editors (`mockly.window.visibleTextEditors` becomes empty).
- **File System:**
  - Completely wipes the in-memory file system (`mockly.workspace.fs`). All created files and directories are removed.
- **User Interactions:**
  - Clears any queued responses for `showQuickPick`, `showInputBox`, `showInformationMessage`, etc.
- **Terminals & Output Channels:**
  - Disposes of all created terminals (`mockly.window.terminals` becomes empty, `mockly.window.activeTerminal` becomes `undefined`).
  - Disposes of all created output channels.
- **Commands:**
  - Unregisters all commands registered via `mockly.commands.registerCommand`.
- **Environment (`mockly.env`):**
  - Resets clipboard content (`mockly.env.clipboard`).
  - Resets `sessionId`, `logLevel` (to default), `remoteName`, etc.
- **Extensions (`mockly.extensions`):**
  - Removes all registered mock extensions.
- **Event Listeners:**
  - Clears listeners on internal `EventEmitter` instances that back the public `onDid...` events. This is crucial to prevent listeners from one test reacting to events triggered in another.

**Usage Example:**

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('My Feature Tests', () => {
	// Reset before each test
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('test A: should start with no open documents', () => {
		expect(mockly.workspace.textDocuments.length).toBe(0);
		// Simulate opening a document for this test
		// await mockly.workspace.openTextDocument(...);
	});

	it('test B: should also start with no open documents, unaffected by test A', () => {
		expect(mockly.workspace.textDocuments.length).toBe(0);
	});
});

// Alternatively, using afterEach:
// import { afterEach } from 'vitest';
// afterEach(async () => {
//   await vscodeSimulator.reset();
// });
~~~

Using `beforeEach` is generally recommended as it ensures a clean state _before_ your test logic runs.

## Populating the Virtual File System with vscodeSimulator.vfs

For many tests, you'll need to set up a specific file and directory structure in the mock file system. Mockly-VSC provides a convenient utility on `vscodeSimulator.vfs` to declaratively populate the virtual file system: `populate()` (asynchronous) and `populateSync()` (synchronous).

These methods accept a single `structure` object where keys are paths and values define the file content or directory.

-   `vscodeSimulator.vfs.populate(structure: IFileSystemStructure): Promise<void>`
-   `vscodeSimulator.vfs.populateSync(structure: IFileSystemStructure): void`

### IFileSystemStructure Format

The `structure` object has the following format:

~~~typescript
export interface IFileSystemPopulateEntry {
    content?: string | Uint8Array; // For files
    // type?: 'file' | 'directory'; // Usually inferred
    // mtime?: number; ctime?: number; // For advanced metadata (if supported by populate)
}

export interface IFileSystemStructure {
    [path: string]: string | Uint8Array | null | IFileSystemPopulateEntry;
}
~~~

-   **`string` or `Uint8Array` value:** Creates a file at the given path with the specified content.
    -   Example: `'/project/file.txt': 'Hello World'`
    -   Example: `'/project/data.bin': new Uint8Array([1, 2, 3])`
-   **`null` value:** Creates an empty directory at the given path.
    -   Example: `'/project/emptyDir': null`
-   **`IFileSystemPopulateEntry` object:** Allows for more detailed specification, primarily for files with specific content.
    -   Example: `'/project/another.txt': { content: 'File with entry object' }`
    -   Example: `'/project/explicitDir': { type: 'directory' }` (Though `null` is simpler for directories, and type is often inferred)

Parent directories are automatically created as needed. Paths should use POSIX separators (`/`); any Windows-style separators (`\`) in the keys will be normalized by the utility.

### Usage Example

This is typically used in `beforeEach` or at the start of a test to set up the VFS.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('My Feature Requiring VFS Setup', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();

		// Using populateSync for synchronous setup
		vscodeSimulator.vfs.populateSync({
			'/project/config.json': '{ "setting": true }',
			'/project/src/index.ts': 'console.log("hello");',
			'/project/src/utils/helpers.ts': 'export const helper = () => {};',
			'/project/docs': null, // Creates an empty directory
			'/project/assets/image.png': new Uint8Array([0x89, 0x50, 0x4E, 0x47]), // PNG magic number
            '/project/notes.txt': { content: 'Initial notes.' }
		});

		// Alternatively, using the async version:
		// await vscodeSimulator.vfs.populate({ /* ... structure ... */ });
	});

	it('should find the populated config file', async () => {
		const configUri = mockly.Uri.file('/project/config.json');
		const content = await mockly.workspace.fs.readFile(configUri);
		expect(JSON.parse(Buffer.from(content).toString()).setting).toBe(true);
	});

	it('should list files in src directory', async () => {
		const srcDirUri = mockly.Uri.file('/project/src');
		const entries = await mockly.workspace.fs.readDirectory(srcDirUri);
		// Expected: [['index.ts', FileType.File], ['utils', FileType.Directory]]
		// Order might vary.
		expect(entries).toEqual(
			expect.arrayContaining([
				['index.ts', mockly.FileType.File],
				['utils', mockly.FileType.Directory],
			])
		);
		expect(entries.length).toBe(2);
	});
});
~~~

Using `populateSync` or `populate` significantly simplifies test setup compared to manually creating each file and directory using `mockly.workspace.fs` or `mockly.node.fs` methods.

## Path Manipulation (mockly.node.path and vscodeSimulator.path)

Mockly-VSC provides utilities for Node.js-like path manipulation, which can be useful in your tests and for testing extension code that itself uses the Node.js path` module.

### mockly.node.path (Recommended for Extension Code Testing)

If your extension code uses the Node.js `path` module (e.g., `import path from 'path';` or `require('path')`), you should test it against `mockly.node.path`. This object is an instance of `IMockNodePathService` and provides common path functions:

-   `join(...paths: string[]): string`
-   `normalize(p: string): string`
-   `basename(p: string, ext?: string): string`
-   `dirname(p: string): string`
-   `relative(from: string, to: string): string`
-   `resolve(...pathSegments: string[]): string`
-   `sep: '/' | '\\'` (platform-specific separator, defaults to POSIX `/`)
-   `setMode('posix' | 'win32')`: To switch between POSIX and Windows path styles for the mock.

**Example Usage (Testing Extension Logic):**
Imagine your extension has a utility:
~~~typescript
// extensionUtil.ts
import * as path from 'path'; // Node.js path module
export function getFullAssetPath(baseDir: string, assetName: string): string {
  return path.join(baseDir, 'assets', assetName);
}
~~~

Your test would look like this:
~~~typescript
// extensionUtil.test.ts
import { mockly } from 'mockly-vsc'; // mockly.node.path will be used by getFullAssetPath
import { getFullAssetPath } from '../src/extensionUtil';
import { describe, expect, it } from 'vitest';

describe('Path Utilities in Extension', () => {
	it('should join asset path correctly using mockly.node.path', () => {
		// getFullAssetPath will use mockly.node.path in the test environment
		const result = getFullAssetPath('/project', 'icon.png');
		expect(result).toBe('/project/assets/icon.png'); // Assuming POSIX mode
	});
});
~~~

### vscodeSimulator.path (For Test Helper Logic)

The `vscodeSimulator` object also exposes a `path` property (`vscodeSimulator.path`), which is the **same instance** of `IMockNodePathService` as `mockly.node.path`.

-   **`vscodeSimulator.path`**: You can use this for string-based path manipulations directly within your test utility functions or when constructing path strings for test setup that are *not* directly passed to `mockly` API methods expecting `mockly.Uri` objects.

**Purpose and Differentiation:**

-   **`mockly.node.path`**: This is the primary way your *extension code* (when under test) will interact with a mocked Node.js `path` module. Your tests assert the behavior of your extension code, which internally uses `mockly.node.path`.
-   **`vscodeSimulator.path`**: A direct accessor on the simulator, useful for path string manipulations *within your test files themselves* (e.g., in `beforeEach` hooks or test utility functions). Since it's the same instance as `mockly.node.path`, using either for test-side logic is functionally equivalent.
-   **`mockly.Uri`**: Continue to use `mockly.Uri.file()`, `mockly.Uri.parse()`, and `mockly.Uri.joinPath()` when you need to create or manipulate `Uri` objects that will be used with the `mockly` API (e.g., `mockly.workspace.fs.writeFile(uri, ...)`).

**Example Usage of `vscodeSimulator.path` (in test logic):**

~~~typescript
import { vscodeSimulator } from 'mockly-vsc';
import { describe, expect, it, beforeEach } from 'vitest';

describe('Path Utilities via vscodeSimulator.path', () => {
    beforeEach(() => {
        // Reset to default POSIX mode for path operations if changed in other tests
        vscodeSimulator.path.setMode('posix');
    });

	it('should join path segments correctly (POSIX default)', () => {
		const result = vscodeSimulator.path.join('/users/test', 'project', 'file.txt');
		expect(result).toBe('/users/test/project/file.txt');
	});

	it('should switch to win32 mode and join paths', () => {
		vscodeSimulator.path.setMode('win32'); // Switch to Windows path style
		const result = vscodeSimulator.path.join('C:\\Users\\Test', 'Project', 'file.txt');
		expect(result).toBe('C:\\Users\\Test\\Project\\file.txt');
		expect(vscodeSimulator.path.sep).toBe('\\');
		// vscodeSimulator.path.setMode('posix'); // Reset to default for other tests if needed in afterEach
	});
});
~~~

## Accessing Internal Modules and Services (Advanced)

For highly specific test scenarios, such as setting up a complex initial state that's not easily achievable through the public `mockly` API, or for verifying internal behaviors of the mock itself, `vscodeSimulator` provides access to its internal modules. These modules, in turn, expose their underlying services.

**Available Internal Modules via `vscodeSimulator`:**

- `vscodeSimulator._workspaceModule`:
  - `_workspaceStateService`: Manages workspace folders, name, etc.
  - `_textDocumentService`: Manages text document lifecycle (open, close, content).
  - `_configurationService`: (If implemented for `workspace.getConfiguration`)
- `vscodeSimulator._windowModule`:
  - `_textEditorService`: Manages active/visible text editors.
  - `_userInteractionService`: Manages expectations for `showQuickPick`, `showInputBox`, messages.
  - `_terminalService`: Manages terminal instances.
  - `_outputChannelService`: Manages output channel instances.
  - `_statusBarService`: Manages status bar items.
  - `_uiControllerService`: (If used for things like TreeView registration state).
- `vscodeSimulator._commandsModule`:
  - `_commandsService`: Manages command registration and execution.
- `vscodeSimulator._envModule`:
  - `_envService`: Manages environment properties like `logLevel`, `remoteName`, clipboard.
- `vscodeSimulator._extensionsModule`:
  - `_extensionsService`: Manages the registry of mock extensions.
- `vscodeSimulator._fileSystemModule`:
  - `_fileSystemStateService`: The core in-memory file system data store.
  - `_uriService`: (This is the `IUriService` instance, same as `mockly.Uri`).
  - `_nodePathService`: (This is the `IMockNodePathService` instance, same as `vscodeSimulator.path` and `mockly.node.path`).
  - `fs`: This is the same instance as `mockly.workspace.fs` (the `IFileSystemService` implementation).

**Example: Directly Manipulating File System State (Illustrative)**

While `mockly.workspace.fs.writeFile()` or `vscodeSimulator.vfs.populateSync()` are the preferred ways to add files, you _could_ (though rarely needed) interact with the `_fileSystemStateService`:

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Advanced State Management Example', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should allow direct manipulation of the file system state service', async () => {
		const fileUri = mockly.Uri.file('/internal/setup/file.txt');
		const content = Uint8Array.from(Buffer.from('Content added via internal service'));

		// Access internal FileSystemStateService via FileSystemModule
		// This bypasses events like onDidCreateFiles that mockly.workspace.fs.writeFile would trigger.
		// Note: addFile in FileSystemStateService might expect different parameters or return type
		// than the example shown in the original docs. Refer to IFileSystemStateService.
		// Assuming addFile exists and takes these params for illustration:
		// await vscodeSimulator._fileSystemModule._fileSystemStateService.addFile(fileUri, { content });
        // More likely, you'd use writeFileSync if it exists on the state service:
        vscodeSimulator._fileSystemModule._fileSystemStateService.writeFileSync(fileUri, content);


		// Verify via public API
		const stat = await mockly.workspace.fs.stat(fileUri);
		expect(stat.type).toBe(mockly.FileType.File);
		const readContent = await mockly.workspace.fs.readFile(fileUri);
		expect(Buffer.from(readContent).toString()).toBe(Buffer.from(content).toString());
	});

	it('can directly set active editor without showing document', async () => {
		// Create a document
		const doc = await mockly.workspace.openTextDocument({ content: 'Hello', language: 'plaintext' });

		// Create a mock editor instance (this is more involved, usually TextEditorService does this)
		// For this example, let's assume we have a way to create/get a TextEditor instance.
		// A more practical use of _textEditorService might be to clear the active editor:
		vscodeSimulator._windowModule._textEditorService.setActiveTextEditor(undefined);
		expect(mockly.window.activeTextEditor).toBeUndefined();
	});
});
~~~

**Caution and Best Practices:**

- **Prefer Public APIs:** Always try to achieve your test setup and assertions using the public `mockly` API (including `vscodeSimulator.vfs` for VFS setup) first. This makes your tests less brittle to internal refactoring of Mockly-VSC.
- **Use for Setup, Not Just Assertions:** Internal services are most justifiable for complex _setup_ scenarios not covered by simpler utilities.
- **Understand the Implications:** Directly manipulating internal state might bypass event firing or other logic that the public API would normally trigger. Be aware of this if your extension relies on those side effects.
- **Test Isolation:** Even whenusing internal services, ensure `vscodeSimulator.reset()` is used to maintain test isolation.

Direct access to internal services is a powerful tool for specific, advanced testing needs but should be used judiciously.