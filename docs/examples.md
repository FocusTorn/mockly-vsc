# Usage Examples

This section provides practical examples demonstrating how to use Mockly-VSC to test common VSCode extension scenarios. These examples showcase how different parts of the `mockly` API and `vscodeSimulator` work together.

For API-specific examples, please refer to the individual pages in the [API Reference](./api-reference/).

## Example 1: Testing a Command that Creates and Opens a File

Let's say you have a command in your extension that creates a new file with some default content in the current workspace and then opens it.

**Extension Code Snippet (Conceptual):**
Assume you have a function like this in your extension:

```typescript
// src/myFileCommands.ts
import * as vscode from 'vscode';

export async function createFileWithDefaultContentCommand() {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showErrorMessage('No workspace folder open. Cannot create file.');
		return;
	}

	const rootPathUri = workspaceFolders[0].uri;
	const newFileName = `mockly-generated-${Date.now()}.txt`;
	const newFilePathUri = vscode.Uri.joinPath(rootPathUri, newFileName);
	const defaultContent = 'Hello from your Mockly-powered command!';

	try {
		await vscode.workspace.fs.writeFile(newFilePathUri, Buffer.from(defaultContent));
		const document = await vscode.workspace.openTextDocument(newFilePathUri);
		await vscode.window.showTextDocument(document);
		vscode.window.showInformationMessage(`File created and opened: ${newFileName}`);
	} catch (error: any) {
		vscode.window.showErrorMessage(`Failed to create file: ${error.message || error}`);
	}
}
```

**Test Code (`test/myFileCommands.test.ts`):**

```typescript
import { FileType, mockly, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Assuming createFileWithDefaultContentCommand is exported from your extension code
import { createFileWithDefaultContentCommand } from '../src/myFileCommands';

describe('createFileWithDefaultContentCommand', () => {
	let disposables: mockly.Disposable[] = [];

	beforeEach(async () => {
		await vscodeSimulator.reset();

		// Setup a workspace folder for the command to use
		const workspaceUri = mockly.Uri.file('/project-root');
		// Ensure the directory exists in the mock file system
		await vscodeSimulator._fileSystemModule.fs.createDirectory(workspaceUri);
		// Add it as a workspace folder
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(
			workspaceUri,
			'TestProject',
		);
	});

	afterEach(() => {
		disposables.forEach(d => d.dispose());
		disposables = [];
		vi.restoreAllMocks(); // Restore any spies
	});

	it('should create a new file with default content, open it, and show an info message', async () => {
		const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');
		const errorSpy = vi.spyOn(mockly.window, 'showErrorMessage');
		const onDidOpenDocSpy = vi.fn();
		disposables.push(mockly.workspace.onDidOpenTextDocument(onDidOpenDocSpy));

		await createFileWithDefaultContentCommand();

		// Verify file system: Check that a file was created
		const projectFiles = await mockly.workspace.fs.readDirectory(mockly.Uri.file('/project-root'));
		expect(projectFiles.length).toBe(1); // Expect one file created
		const [createdFileName, fileType] = projectFiles[0];
		expect(fileType).toBe(FileType.File);
		expect(createdFileName).toMatch(/^mockly-generated-\d+\.txt$/);

		const createdFileUri = mockly.Uri.joinPath(mockly.Uri.file('/project-root'), createdFileName);
		const fileContent = await mockly.workspace.fs.readFile(createdFileUri);
		expect(Buffer.from(fileContent).toString()).toBe('Hello from your Mockly-powered command!');

		// Verify document was opened
		expect(onDidOpenDocSpy).toHaveBeenCalledTimes(1);
		const openedDocument = onDidOpenDocSpy.mock.calls[0][0] as mockly.TextDocument;
		expect(openedDocument.uri.path).toBe(createdFileUri.path);

		// Verify editor state: Active editor should show the new document
		expect(mockly.window.activeTextEditor).toBeDefined();
		expect(mockly.window.activeTextEditor?.document.uri.path).toBe(createdFileUri.path);

		// Verify messages
		expect(infoSpy).toHaveBeenCalledWith(`File created and opened: ${createdFileName}`);
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it('should show an error message if no workspace folder is open', async () => {
		await vscodeSimulator.reset(); // Reset to a state with NO workspace folders

		const errorSpy = vi.spyOn(mockly.window, 'showErrorMessage');
		const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');

		await createFileWithDefaultContentCommand();

		expect(errorSpy).toHaveBeenCalledWith('No workspace folder open. Cannot create file.');
		expect(infoSpy).not.toHaveBeenCalled();
		// Ensure no files were accidentally created
		// (This depends on how robust the check in the command is; if it doesn't check workspace.fs directly)
	});
});
```

## Example 2: Simulating User Input via Quick Pick

Testing a function that asks the user for a choice using `window.showQuickPick`.

**Extension Code Snippet (Conceptual):**

```typescript
// src/myUserInteractions.ts
import * as vscode from 'vscode';

export async function askUserForFruitPreference(): Promise<string | undefined> {
	const fruitChoices = ['Apple', 'Banana', 'Cherry', 'Date'];
	const selection = await vscode.window.showQuickPick(fruitChoices, {
		placeHolder: 'Which fruit do you prefer?',
	});

	if (selection) {
		vscode.window.showInformationMessage(`You chose: ${selection}. Excellent choice!`);
	} else {
		vscode.window.showWarningMessage('No fruit selected. Are you sure?');
	}
	return selection;
}
```

**Test Code (`test/myUserInteractions.test.ts`):**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { askUserForFruitPreference } from '../src/myUserInteractions';

describe('askUserForFruitPreference', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should return the selected fruit and show an info message when user makes a choice', async () => {
		const fruitChoices = ['Apple', 'Banana', 'Cherry', 'Date'];
		const userSelection = 'Banana';

		// Queue the expected response for showQuickPick
		vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(
			fruitChoices, // You can pass the expected items array for validation
			userSelection, // The value showQuickPick should resolve to
		);

		const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');
		const warningSpy = vi.spyOn(mockly.window, 'showWarningMessage');

		const result = await askUserForFruitPreference();

		expect(result).toBe(userSelection);
		expect(infoSpy).toHaveBeenCalledWith(`You chose: ${userSelection}. Excellent choice!`);
		expect(warningSpy).not.toHaveBeenCalled();
	});

	it('should return undefined and show a warning message if user cancels quick pick', async () => {
		const fruitChoices = ['Apple', 'Banana', 'Cherry', 'Date'];

		// Simulate user cancelling (showQuickPick resolves to undefined)
		// If no specific item is expected, just provide undefined as the return.
		// The first argument to expectQuickPickAndReturn can also be a function to validate items.
		vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(
			(items) => items.length === fruitChoices.length, // Example validator
			undefined,
		);

		const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');
		const warningSpy = vi.spyOn(mockly.window, 'showWarningMessage');

		const result = await askUserForFruitPreference();

		expect(result).toBeUndefined();
		expect(warningSpy).toHaveBeenCalledWith('No fruit selected. Are you sure?');
		expect(infoSpy).not.toHaveBeenCalled();
	});
});
```

## Example 3: Reading a Configuration File from the Workspace

Testing a function that reads a specific configuration file (e.g., `.mytoolrc`) from the root of the workspace.

**Extension Code Snippet (Conceptual):**

```typescript
// src/myConfigReader.ts
import * as vscode from 'vscode';

export interface MyConfig {
	settingA: boolean;
	settingB?: string;
}

export async function readMyToolConfig(): Promise<MyConfig | null> {
	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
		vscode.window.showErrorMessage('No workspace folder found to look for .mytoolrc.');
		return null;
	}
	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri;
	const configFileUri = vscode.Uri.joinPath(workspaceRoot, '.mytoolrc');

	try {
		const contentBytes = await vscode.workspace.fs.readFile(configFileUri);
		const contentString = Buffer.from(contentBytes).toString('utf-8');
		return JSON.parse(contentString) as MyConfig;
	} catch (error: any) {
		if (error.code === 'FileNotFound' || error instanceof SyntaxError) {
			// File not found or not valid JSON, return null or default config
			vscode.window.showWarningMessage(`.mytoolrc not found or is invalid. Using default settings.`);
			return null;
		}
		vscode.window.showErrorMessage(`Error reading .mytoolrc: ${error.message}`);
		throw error; // Re-throw unexpected errors
	}
}
```

**Test Code (`test/myConfigReader.test.ts`):**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MyConfig, readMyToolConfig } from '../src/myConfigReader';

describe('readMyToolConfig', () => {
	const workspaceUri = mockly.Uri.file('/project');
	const configFileUri = mockly.Uri.joinPath(workspaceUri, '.mytoolrc');

	beforeEach(async () => {
		await vscodeSimulator.reset();
		// Setup workspace folder
		await vscodeSimulator._fileSystemModule.fs.createDirectory(workspaceUri);
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(workspaceUri);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should read and parse the config file if it exists and is valid JSON', async () => {
		const configContent: MyConfig = { settingA: true, settingB: 'customValue' };
		await mockly.workspace.fs.writeFile(configFileUri, Buffer.from(JSON.stringify(configContent)));
		const warningSpy = vi.spyOn(mockly.window, 'showWarningMessage');

		const result = await readMyToolConfig();

		expect(result).toEqual(configContent);
		expect(warningSpy).not.toHaveBeenCalled();
	});

	it('should return null and show warning if config file does not exist', async () => {
		// Ensure file does not exist (reset does this, but good to be explicit if needed)
		// await mockly.workspace.fs.delete(configFileUri).catch(() => {});
		const warningSpy = vi.spyOn(mockly.window, 'showWarningMessage');

		const result = await readMyToolConfig();

		expect(result).toBeNull();
		expect(warningSpy).toHaveBeenCalledWith('.mytoolrc not found or is invalid. Using default settings.');
	});

	it('should return null and show warning if config file is invalid JSON', async () => {
		await mockly.workspace.fs.writeFile(configFileUri, Buffer.from('this is not json'));
		const warningSpy = vi.spyOn(mockly.window, 'showWarningMessage');

		const result = await readMyToolConfig();

		expect(result).toBeNull();
		expect(warningSpy).toHaveBeenCalledWith('.mytoolrc not found or is invalid. Using default settings.');
	});

	it('should return null and show error if no workspace folder is open', async () => {
		await vscodeSimulator.reset(); // No workspace folder
		const errorSpy = vi.spyOn(mockly.window, 'showErrorMessage');

		const result = await readMyToolConfig();

		expect(result).toBeNull();
		expect(errorSpy).toHaveBeenCalledWith('No workspace folder found to look for .mytoolrc.');
	});
});
```

These examples should provide a good starting point for testing various aspects of your VSCode extension with Mockly-VSC. Remember to adapt them to your specific extension's logic and structure.
