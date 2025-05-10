# Core Concepts in Mockly-VSC

Mockly-VSC provides two primary exports that you'll interact with in your tests: `mockly` (the VSCode API mock) and `vscodeSimulator` (for test environment control). Understanding these is key to effectively using the library.

## The `mockly` Object (Simulating `vscode`)

The `mockly` object is your direct replacement for the standard `vscode` API namespace that you would use in your extension's actual code. It aims to provide a faithful, in-memory mock implementation of the VSCode API.

When writing tests, any part of your extension code that would normally import and use `vscode` (e.g., `vscode.workspace.openTextDocument(...)`, `vscode.window.showInformationMessage(...)`) will, in the test environment, interact with `mockly` instead.

**Key Characteristics:**

- **API Parity:** Strives to mirror the properties, methods, and events of the official `vscode` namespace. While not every single API member might be implemented, the most commonly used and essential ones are covered.
- **Namespaces:** Provides access to mocked namespaces, including:
  - `mockly.workspace`
  - `mockly.window`
  - `mockly.commands`
  - `mockly.env`
  - `mockly.extensions`
- **Core Types:** Exposes mock implementations of core VSCode types such as `mockly.Uri`, `mockly.Position`, `mockly.Range`, `mockly.Selection`, `mockly.Disposable`, `mockly.EventEmitter`, `mockly.CancellationTokenSource`, various enums (e.g., `mockly.FileType`, `mockly.LogLevel`), and more.

**Example Usage:**

Imagine you have a function in your extension like this:

```typescript
// In your extension code (e.g., myExtensionUtils.ts)
import * as vscode from 'vscode';

export async function createAndOpenFile(filePath: string, content: string) {
	const uri = vscode.Uri.file(filePath);
	// workspace.fs is used for file operations in the actual VSCode API
	await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
	const document = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(document);
	vscode.window.showInformationMessage(`Opened ${filePath}`);
}
```

In your test file, you would call this function, and it would automatically use `mockly`'s implementations:

```typescript
// myExtensionUtils.test.ts
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAndOpenFile } from '../src/myExtensionUtils'; // Your actual extension code

describe('createAndOpenFile', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should create a file, open it, and show a message', async () => {
		const filePath = '/project/newFile.txt';
		const fileContent = 'Hello from the test!';

		const showMessageSpy = vi.spyOn(mockly.window, 'showInformationMessage');

		await createAndOpenFile(filePath, fileContent);

		// Verify file system state
		const fileExists = await mockly.workspace.fs.stat(mockly.Uri.file(filePath))
			.then(() => true)
			.catch(() => false);
		expect(fileExists).toBe(true);

		// Verify document state
		const doc = mockly.workspace.textDocuments.find(d => d.uri.path === filePath);
		expect(doc).toBeDefined();
		expect(doc?.getText()).toBe(fileContent);

		// Verify editor state
		expect(mockly.window.activeTextEditor?.document.uri.path).toBe(filePath);

		// Verify message
		expect(showMessageSpy).toHaveBeenCalledWith(`Opened ${filePath}`);
	});
});
```

## The `vscodeSimulator` Object (Test Control)

The `vscodeSimulator` object provides utilities specifically for controlling and interacting with the Mockly-VSC environment during your tests. It is **not** meant to be a direct mock of any `vscode` API but rather a tool for test setup, teardown, and advanced state manipulation.

**Key Characteristics:**

- **State Management:**
  - `vscodeSimulator.reset()`: This is arguably the most crucial method. It resets the entire mock VSCode environment to its initial, clean state. This is essential for ensuring test isolation, as it clears all mock workspace folders, open documents, registered commands, queued user interactions, mock file system content, etc. You should typically call this in a `beforeEach` or `afterEach` block in your test suites.

- **Access to Internal Modules/Services (Advanced):**
  For advanced testing scenarios or for verifying internal states of the mock, `vscodeSimulator` provides access to the underlying modules and services that power `mockly`. For example:
  - `vscodeSimulator._workspaceModule`
  - `vscodeSimulator._windowModule`
  - `vscodeSimulator._commandsModule`
  - `vscodeSimulator._fileSystemModule`
  - And through these modules, access to their respective internal services (e.g., `_workspaceModule._textDocumentService`, `_windowModule._userInteractionService`).
    This allows for fine-grained control and assertions if needed. However, prefer using the public `mockly` API for interactions whenever possible to avoid tests becoming brittle to internal changes.

**Example Usage of `vscodeSimulator`:**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('My Extension with Simulator Control', () => {
	beforeEach(async () => {
		// Reset the entire mock environment before each test
		await vscodeSimulator.reset();
	});

	it('should start with no workspace folders', () => {
		expect(mockly.workspace.workspaceFolders).toBeUndefined();
	});

	it('can access internal services for advanced setup or assertions', async () => {
		const testUri = mockly.Uri.file('/my/project');

		// Directly use an internal service to set up workspace state
		// Note: Adding a folder requires it to exist in the mock file system first.
		await vscodeSimulator._fileSystemModule.fs.createDirectory(testUri); // Create the directory using the public FS API

		// Now use the internal service to add it as a workspace folder
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(
			testUri,
			'MyTestProject',
		);

		expect(mockly.workspace.workspaceFolders?.[0].uri.toString()).toBe(testUri.toString());
		expect(mockly.workspace.workspaceFolders?.[0].name).toBe('MyTestProject');

		// Check internal state of a service
		const docService = vscodeSimulator._workspaceModule._textDocumentService;
		expect(docService.getTextDocuments().length).toBe(0); // No documents opened yet via the public API
	});

	it('can queue a response for a user interaction', async () => {
		const items = ['Yes', 'No', 'Maybe'];
		const expectedResponse = 'Maybe';

		// Tell the simulator what showQuickPick should return for specific items
		vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(items, expectedResponse);

		// Call the function in your extension that uses showQuickPick
		const actualResponse = await mockly.window.showQuickPick(items, { placeHolder: 'Choose one:' });

		expect(actualResponse).toBe(expectedResponse);
	});
});
```

## Architecture Overview (Brief)

Mockly-VSC is built with TypeScript and leverages `tsyringe` (a lightweight dependency injection library from Microsoft) for its internal architecture. This promotes a modular and maintainable codebase by decoupling different parts of the VSCode API simulation (e.g., workspace management, window UI elements, file system).

While you typically won't interact with `tsyringe` directly when using Mockly-VSC, it's the reason for needing the `reflect-metadata` import in your test setup, as `tsyringe` relies on it for metadata reflection.

---
