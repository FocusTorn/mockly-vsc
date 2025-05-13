# Test Control & State Management

Effective testing often requires careful control over the environment's state to ensure tests are isolated and repeatable. Mockly-VSC provides the `vscodeSimulator` object specifically for this purpose.

## Resetting the Mock Environment with `vscodeSimulator.reset()`

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

## Accessing Path Utilities with `vscodeSimulator.path`

For test helper functions or scenarios where you need Node.js-like path manipulation (e.g., `join`, `dirname`, `basename`, `normalize`), `vscodeSimulator` provides a convenient `path` accessor. This service simulates the Node.js `path` module.

- `vscodeSimulator.path`: An instance of `IMockNodePathService` that provides methods like:
  - `join(...paths: string[]): string`
  - `normalize(p: string): string`
  - `basename(p: string, ext?: string): string`
  - `dirname(p: string): string`
  - `relative(from: string, to: string): string`
  - `resolve(...pathSegments: string[]): string`
  - `sep: '/' | '\\'` (platform-specific separator, defaults to POSIX `/`)
  - `setMode('posix' | 'win32')`: To switch between POSIX and Windows path styles.

**Purpose and Differentiation:**

- **`vscodeSimulator.path`**: Use this for string-based path manipulations, typically within your test utility functions or when constructing path strings that are *not* directly passed to `mockly` API methods that expect `mockly.Uri` objects. It's for working with path *strings*.
- **`mockly.Uri`**: Continue to use `mockly.Uri.file()`, `mockly.Uri.parse()`, and `mockly.Uri.joinPath()` when you need to create or manipulate `Uri` objects that will be used with the `mockly` API (e.g., `mockly.workspace.fs.writeFile(uri, ...)`).

**Example Usage of `vscodeSimulator.path`:**

~~~typescript
import { vscodeSimulator } from 'mockly-vsc';
import { describe, expect, it } from 'vitest';

describe('Path Utilities via vscodeSimulator.path', () => {
	it('should join path segments correctly (POSIX default)', () => {
		const result = vscodeSimulator.path.join('/users/test', 'project', 'file.txt');
		expect(result).toBe('/users/test/project/file.txt');
	});

	it('should get the basename of a path', () => {
		const result = vscodeSimulator.path.basename('/users/test/project/file.txt');
		expect(result).toBe('file.txt');
	});

	it('should switch to win32 mode and join paths', () => {
		vscodeSimulator.path.setMode('win32'); // Switch to Windows path style
		const result = vscodeSimulator.path.join('C:\\Users\\Test', 'Project', 'file.txt');
		expect(result).toBe('C:\\Users\\Test\\Project\\file.txt');
		expect(vscodeSimulator.path.sep).toBe('\\');
		vscodeSimulator.path.setMode('posix'); // Reset to default for other tests
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
  - `_nodePathService`: (This is the `IMockNodePathService` instance, same as `vscodeSimulator.path`).
  - `fs`: This is the same instance as `mockly.workspace.fs` (the `IFileSystemService` implementation).

**Example: Directly Manipulating File System State (Illustrative)**

While `mockly.workspace.fs.writeFile()` is the preferred way to add files, you _could_ (though rarely needed) interact with the `_fileSystemStateService`:

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
		await vscodeSimulator._fileSystemModule._fileSystemStateService.addFile(fileUri, { content });


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

- **Prefer Public APIs:** Always try to achieve your test setup and assertions using the public `mockly` API first. This makes your tests less brittle to internal refactoring of Mockly-VSC.
- **Use for Setup, Not Just Assertions:** Internal services are most justifiable for complex _setup_ scenarios.
- **Understand the Implications:** Directly manipulating internal state might bypass event firing or other logic that the public API would normally trigger. Be aware of this if your extension relies on those side effects.
- **Test Isolation:** Even when using internal services, ensure `vscodeSimulator.reset()` is used to maintain test isolation.

Direct access to internal services is a powerful tool for specific, advanced testing needs but should be used judiciously.