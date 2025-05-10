# Mockly-VSC

Mockly-VSC is a comprehensive library designed for mocking the Visual Studio Code (VSCode) API within a [Vitest](https://vitest.dev/) testing environment. It enables developers to write unit and integration tests for their VSCode extensions with greater ease and reliability by providing a faithful simulation of the `vscode` namespace and its core functionalities.

## Introduction

Testing VSCode extensions can be challenging due to the complex and asynchronous nature of the VSCode API. Mockly-VSC aims to simplify this process by offering a robust, in-memory mock of the API, allowing you to simulate various editor states, user interactions, file system operations, and more, directly within your Vitest tests.

This library leverages dependency injection (via `tsyringe`) to manage its internal services, providing a modular and extensible architecture. It focuses on accurately replicating the behavior of key VSCode components, including the workspace, window, commands, environment, and extensions APIs.

## Features

*   **Comprehensive `vscode` Namespace Mocking**: Simulates `vscode.workspace`, `vscode.window`, `vscode.commands`, `vscode.env`, and `vscode.extensions`.
*   **In-Memory File System**: A virtual file system to test file operations without touching the actual disk.
*   **TextDocument and TextEditor Simulation**: Create, open, edit, and manage mock text documents and editors.
*   **Event Simulation**: Mock and verify VSCode events like `onDidChangeTextDocument`, `onDidOpenTextDocument`, `onDidChangeWorkspaceFolders`, etc.
*   **User Interaction Mocking**: Simulate user inputs for `showQuickPick`, `showInputBox`, and display messages like `showInformationMessage`.
*   **Terminal and Output Channel Simulation**: Create and interact with mock terminals and output channels.
*   **Test Control Utilities**: Easily reset the mock environment's state between tests using `vscodeSimulator.reset()`.
*   **TypeScript First**: Written in TypeScript, providing strong typing for a better development experience.
*   **Dependency Injection**: Built with `tsyringe` for a clean and maintainable codebase.
*   **Core VSCode Types**: Provides mock implementations for essential VSCode types like `Uri`, `Position`, `Range`, `Selection`, `Disposable`, `EventEmitter`, etc.

## Getting Started

### Installation

To add Mockly-VSC to your project, use your preferred package manager:

~~~bash
npm install mockly-vsc --save-dev
# or
yarn add mockly-vsc --dev
# or
pnpm add mockly-vsc --dev
~~~

Ensure you also have `vitest` and `vscode-uri` (a peer dependency often used with VSCode related projects) installed. Mockly-VSC also uses `reflect-metadata` for `tsyringe`, so you'll need to import it once in your test setup file.

~~~bash
npm install vitest vscode-uri reflect-metadata --save-dev
# or
yarn add vitest vscode-uri reflect-metadata --dev
# or
pnpm add vitest vscode-uri reflect-metadata --dev
~~~

**Test Setup File (e.g., `vitest.setup.ts`):**
~~~typescript
import 'reflect-metadata';
~~~
Make sure to configure Vitest to use this setup file.

### Basic Setup

Once installed, you can import `mockly` (the `vscode` API mock) and `vscodeSimulator` (for test control) into your Vitest test files.

Here's a basic example:

~~~typescript
// myExtension.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockly, vscodeSimulator } from 'mockly-vsc';

// Function from your extension that uses the vscode API
async function getOpenDocumentUris() {
  return mockly.workspace.textDocuments.map(doc => doc.uri.toString());
}

describe('My Extension Tests', () => {
  beforeEach(async () => {
    // Reset the simulator's state before each test
    await vscodeSimulator.reset();
  });

  it('should correctly report open document URIs', async () => {
    // Simulate opening a document
    const testUri = mockly.Uri.file('/test/file.txt');
    await mockly.workspace.openTextDocument(testUri);

    const openUris = await getOpenDocumentUris();
    expect(openUris).toContain(testUri.toString());
    expect(openUris.length).toBe(1);
  });

  it('should show an information message', async () => {
    // Spy on the mock implementation
    const spy = vi.spyOn(mockly.window, 'showInformationMessage');

    await mockly.window.showInformationMessage('Hello from Mockly!');

    expect(spy).toHaveBeenCalledWith('Hello from Mockly!');
  });
});
~~~

## Core Concepts

Mockly-VSC provides two primary exports that you'll interact with in your tests:

### The `mockly` Object (Simulating `vscode`)

The `mockly` object is your direct replacement for the standard `vscode` API namespace that you would use in your extension's code. It aims to provide a faithful, mock implementation of the VSCode API.

When writing tests, any part of your extension code that would normally import and use `vscode` (e.g., `vscode.workspace.openTextDocument(...)`, `vscode.window.showInformationMessage(...)`) will, in the test environment, interact with `mockly` instead.

**Key characteristics:**

*   **API Parity**: Strives to mirror the properties, methods, and events of the official `vscode` namespace.
*   **Namespaces**: Provides access to mocked namespaces like:
    *   `mockly.workspace`
    *   `mockly.window`
    *   `mockly.commands`
    *   `mockly.env`
    *   `mockly.extensions`
*   **Core Types**: Exposes mock implementations of core VSCode types such as `mockly.Uri`, `mockly.Position`, `mockly.Range`, `mockly.Selection`, `mockly.Disposable`, `mockly.EventEmitter`, etc.

**Example Usage:**

~~~typescript
import { mockly } from 'mockly-vsc';

// In your extension code (or a function under test):
async function createAndOpenFile(filePath: string, content: string) {
  const uri = mockly.Uri.file(filePath);
  // workspace.fs is used for file operations
  await mockly.workspace.fs.writeFile(uri, Buffer.from(content));
  const document = await mockly.workspace.openTextDocument(uri);
  await mockly.window.showTextDocument(document);
  mockly.window.showInformationMessage(`Opened ${filePath}`);
}
~~~

### The `vscodeSimulator` Object (Test Control)

The `vscodeSimulator` object provides utilities specifically for controlling and interacting with the Mockly-VSC environment during your tests. It is not meant to be a direct mock of any `vscode` API but rather a tool for test setup, teardown, and advanced state manipulation.

**Key characteristics:**

*   **State Management**:
    *   `vscodeSimulator.reset()`: This is the most crucial method. It resets the entire mock VSCode environment to its initial state. This is essential for ensuring test isolation, as it clears all mock workspace folders, open documents, registered commands, queued user interactions, etc. You should typically call this in a `beforeEach` or `afterEach` block in your test suites.
*   **Access to Internal Modules/Services**: For advanced testing scenarios or for verifying internal states of the mock, `vscodeSimulator` provides access to the underlying modules and services that power `mockly`. For example:
    *   `vscodeSimulator._workspaceModule`
    *   `vscodeSimulator._windowModule`
    *   `vscodeSimulator._commandsModule`
    *   `vscodeSimulator._fileSystemModule`
    *   And through these modules, access to their respective internal services (e.g., `_workspaceModule._textDocumentService`, `_windowModule._userInteractionService`). This allows for fine-grained control and assertions if needed.

**Example Usage:**

~~~typescript
import { vscodeSimulator, mockly } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('My Extension with Simulator Control', () => {
  beforeEach(async () => {
    // Reset the entire mock environment before each test
    await vscodeSimulator.reset();
  });

  it('should start with no workspace folders', () => {
    expect(mockly.workspace.workspaceFolders).toBeUndefined();
  });

  it('can access internal services for advanced assertions', async () => {
    const testUri = mockly.Uri.file('/my/project');
    // Directly use the internal service to set up workspace state
    // Note: Adding a folder requires it to exist in the mock file system first.
    await vscodeSimulator._fileSystemModule.fs.createDirectory(testUri); // Create the directory
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(testUri);

    expect(mockly.workspace.workspaceFolders?.[0].uri.toString()).toBe(testUri.toString());

    // Check internal state of the TextDocumentService
    const docService = vscodeSimulator._workspaceModule._textDocumentService;
    expect(docService.getTextDocuments().length).toBe(0); // No documents opened yet
  });
});
~~~

## Mocking `vscode.workspace`

The `mockly.workspace` object simulates the `vscode.workspace` API, providing functionalities related to workspace folders, text documents, file system operations, and workspace-related events.

### Workspace Folders

You can manage and query mock workspace folders.

*   `mockly.workspace.workspaceFolders`: An array of `WorkspaceFolder` objects, or `undefined` if no folder is open.
*   `mockly.workspace.getWorkspaceFolder(uri)`: Returns the `WorkspaceFolder` containing the given URI.
*   `mockly.workspace.name`: The name of the workspace.
*   `mockly.workspace.workspaceFile`: The URI of the `.code-workspace` file, if applicable.

To manipulate workspace folders for your tests, you'll typically use the internal `_workspaceStateService` exposed via `vscodeSimulator`:

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Workspace Folders', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should allow adding and retrieving workspace folders', async () => {
    const folderUri1 = mockly.Uri.file('/project/alpha');
    const folderUri2 = mockly.Uri.file('/project/beta');

    // Folders must exist in the mock file system before being added
    await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri1);
    await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri2);

    // Use the internal service to add folders
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(folderUri1, 'AlphaProject');
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(folderUri2); // Name defaults to basename

    expect(mockly.workspace.workspaceFolders?.length).toBe(2);
    expect(mockly.workspace.workspaceFolders?.[0].name).toBe('AlphaProject');
    expect(mockly.workspace.workspaceFolders?.[1].name).toBe('beta'); // Default name

    const retrievedFolder = mockly.workspace.getWorkspaceFolder(mockly.Uri.joinPath(folderUri1, 'file.txt'));
    expect(retrievedFolder?.uri.toString()).toBe(folderUri1.toString());
  });

  it('should allow setting workspace folders directly', async () => {
    const folderUri = mockly.Uri.file('/project/main');
    await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri);

    await vscodeSimulator._workspaceModule._workspaceStateService.setWorkspaceFolders([folderUri]);
    expect(mockly.workspace.workspaceFolders?.length).toBe(1);
    expect(mockly.workspace.name).toBe('main');
  });
});
~~~

### Text Documents

Mockly simulates the lifecycle of text documents.

*   `mockly.workspace.textDocuments`: An array of currently open `TextDocument` objects.
*   `mockly.workspace.openTextDocument(uriOrOptions)`: Opens a text document. Can take a URI, a file path string, or options to create an untitled document with content/language.
*   `mockly.workspace.saveAll(includeUntitled?)`: Simulates saving all dirty documents.

The `TextDocument` mock provides properties like `uri`, `fileName`, `languageId`, `isDirty`, `isClosed`, `lineCount`, and methods like `getText()`, `lineAt()`, `offsetAt()`, `positionAt()`, `validateRange()`, `validatePosition()`.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Text Documents', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should open and manage text documents', async () => {
    const fileUri = mockly.Uri.file('/test/doc.txt');
    const fileContent = 'Hello Mockly!';

    // Create the file in the mock file system first
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from(fileContent));

    const document = await mockly.workspace.openTextDocument(fileUri);
    expect(document.uri.toString()).toBe(fileUri.toString());
    expect(document.getText()).toBe(fileContent);
    expect(document.languageId).toBe('plaintext'); // Inferred or default
    expect(document.isDirty).toBe(false);
    expect(mockly.workspace.textDocuments.length).toBe(1);

    // Simulate closing the document (internal method for test control)
    await vscodeSimulator._workspaceModule.closeTextDocument(fileUri);
    expect(document.isClosed).toBe(true);
    // textDocuments only returns non-closed documents
    expect(mockly.workspace.textDocuments.length).toBe(0);
  });

  it('should create untitled documents', async () => {
    const document = await mockly.workspace.openTextDocument({
      content: 'Untitled content',
      language: 'markdown'
    });
    expect(document.isUntitled).toBe(true);
    expect(document.getText()).toBe('Untitled content');
    expect(document.languageId).toBe('markdown');
  });
});
~~~

### File System (`workspace.fs`)

Mockly provides an in-memory file system accessible via `mockly.workspace.fs`. This simulates `vscode.workspace.fs` and allows you to perform file operations without affecting your actual file system.

*   `mockly.workspace.fs.readFile(uri)`: Reads the content of a file.
*   `mockly.workspace.fs.writeFile(uri, content, options?)`: Writes content to a file.
*   `mockly.workspace.fs.delete(uri, options?)`: Deletes a file or directory.
*   `mockly.workspace.fs.createDirectory(uri)`: Creates a directory.
*   `mockly.workspace.fs.readDirectory(uri)`: Reads the entries of a directory.
*   `mockly.workspace.fs.stat(uri)`: Retrieves file/directory statistics (like `type`, `size`).
*   `mockly.workspace.fs.rename(oldUri, newUri, options?)`: Renames/moves a file or directory.
*   `mockly.workspace.fs.copy(sourceUri, targetUri, options?)`: Copies a file or directory.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';
import { FileType } from 'mockly-vsc'; // Import FileType enum

describe('Mock File System', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should allow file creation, reading, and deletion', async () => {
    const fileUri = mockly.Uri.file('/test/myFile.txt');
    const content = Buffer.from('File system test!');

    await mockly.workspace.fs.writeFile(fileUri, content, { create: true, overwrite: true });

    const readContent = await mockly.workspace.fs.readFile(fileUri);
    expect(readContent.toString()).toBe(content.toString());

    const stat = await mockly.workspace.fs.stat(fileUri);
    expect(stat.type).toBe(FileType.File);
    expect(stat.size).toBe(content.length);

    await mockly.workspace.fs.delete(fileUri);

    try {
      await mockly.workspace.fs.stat(fileUri);
    } catch (e: any) {
      expect(e.code).toBe('FileNotFound');
    }
  });

  it('should handle directories', async () => {
    const dirUri = mockly.Uri.file('/test/myDir');
    const fileInDirUri = mockly.Uri.joinPath(dirUri, 'nested.txt');

    await mockly.workspace.fs.createDirectory(dirUri);
    await mockly.workspace.fs.writeFile(fileInDirUri, Buffer.from('Nested!'));

    const entries = await mockly.workspace.fs.readDirectory(dirUri);
    expect(entries.length).toBe(1);
    expect(entries[0][0]).toBe('nested.txt');
    expect(entries[0][1]).toBe(FileType.File);
  });
});
~~~

### Finding Files

`mockly.workspace.findFiles(include, exclude?, maxResults?, token?)` allows you to search for files within the mock workspace folders using glob patterns.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Finding Files', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should find files based on glob patterns', async () => {
    const projectUri = mockly.Uri.file('/project');
    await vscodeSimulator._fileSystemModule.fs.createDirectory(projectUri);
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(projectUri);

    await mockly.workspace.fs.writeFile(mockly.Uri.joinPath(projectUri, 'file1.ts'), Buffer.from(''));
    await mockly.workspace.fs.writeFile(mockly.Uri.joinPath(projectUri, 'file2.js'), Buffer.from(''));
    await mockly.workspace.fs.createDirectory(mockly.Uri.joinPath(projectUri, 'sub'));
    await mockly.workspace.fs.writeFile(mockly.Uri.joinPath(projectUri, 'sub', 'file3.ts'), Buffer.from(''));

    const tsFiles = await mockly.workspace.findFiles('**/*.ts');
    expect(tsFiles.length).toBe(2);
    expect(tsFiles.map(f => f.path)).toContain('/project/file1.ts');
    expect(tsFiles.map(f => f.path)).toContain('/project/sub/file3.ts');

    const specificFile = await mockly.workspace.findFiles('file2.js');
    expect(specificFile.length).toBe(1);
    expect(specificFile[0].path).toBe('/project/file2.js');
  });
});
~~~

### Applying Edits

`mockly.workspace.applyEdit(edit)` simulates applying a `WorkspaceEdit`. This is useful for testing code that performs refactorings or bulk modifications. `WorkspaceEdit` itself can be instantiated via `new mockly.WorkspaceEdit()`.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Applying Edits', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should apply text edits to a document', async () => {
    const fileUri = mockly.Uri.file('/test/editable.txt');
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from('Hello world!'));
    const document = await mockly.workspace.openTextDocument(fileUri);

    const edit = new mockly.WorkspaceEdit();
    // Replace "world" with "Mockly"
    edit.replace(fileUri, new mockly.Range(0, 6, 0, 11), 'Mockly');

    const success = await mockly.workspace.applyEdit(edit);
    expect(success).toBe(true);

    // Re-read or get the document to see changes
    const updatedDocument = await mockly.workspace.openTextDocument(fileUri);
    expect(updatedDocument.getText()).toBe('Hello Mockly!');
  });

  it('should apply file creation edits', async () => {
    const newFileUri = mockly.Uri.file('/test/newFile.txt');
    const edit = new mockly.WorkspaceEdit();
    edit.createFile(newFileUri, { content: Buffer.from('New file content') });

    await mockly.workspace.applyEdit(edit);

    const stat = await mockly.workspace.fs.stat(newFileUri);
    expect(stat.type).toBe(mockly.FileType.File);
    const content = await mockly.workspace.fs.readFile(newFileUri);
    expect(content.toString()).toBe('New file content');
  });
});
~~~

### Events

Mockly simulates various workspace events. You can subscribe to these events to test how your extension reacts to them.

*   `mockly.workspace.onDidChangeWorkspaceFolders`
*   `mockly.workspace.onDidOpenTextDocument`
*   `mockly.workspace.onDidCloseTextDocument`
*   `mockly.workspace.onDidSaveTextDocument`
*   `mockly.workspace.onWillSaveTextDocument`
*   `mockly.workspace.onDidChangeTextDocument`
*   `mockly.workspace.onDidCreateFiles`
*   `mockly.workspace.onDidDeleteFiles`
*   `mockly.workspace.onDidRenameFiles`
*   `mockly.workspace.onDidChangeConfiguration`
*   (And `onWill...` variants for file operations)

These events are fired automatically by Mockly when corresponding actions occur (e.g., opening a document, writing to a file via `workspace.fs`).

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Workspace Events', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should fire onDidOpenTextDocument when a document is opened', async () => {
    const onOpenSpy = vi.fn();
    const disposable = mockly.workspace.onDidOpenTextDocument(onOpenSpy);

    const fileUri = mockly.Uri.file('/test/eventDoc.txt');
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from('content')); // Ensure file exists
    const document = await mockly.workspace.openTextDocument(fileUri);

    expect(onOpenSpy).toHaveBeenCalledTimes(1);
    expect(onOpenSpy).toHaveBeenCalledWith(document);

    disposable.dispose();
  });

  it('should fire onDidChangeTextDocument when a document is edited via TextEditor.edit', async () => {
    const onChangeSpy = vi.fn();
    const fileUri = mockly.Uri.file('/test/changeDoc.txt');
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from('initial'));
    const document = await mockly.workspace.openTextDocument(fileUri);
    const editor = await mockly.window.showTextDocument(document); // Need an editor to call .edit()

    const disposable = mockly.workspace.onDidChangeTextDocument(onChangeSpy);

    await editor.edit(editBuilder => {
      editBuilder.insert(new mockly.Position(0, 0), 'new ');
    });

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    const eventArg = onChangeSpy.mock.calls[0][0];
    expect(eventArg.document.uri.toString()).toBe(fileUri.toString());
    expect(eventArg.contentChanges.length).toBeGreaterThan(0);
    // Note: Mockly's contentChanges might be simplified.
    // For precise change details, inspect the document's text directly.
    expect(eventArg.document.getText()).toBe('new initial');


    disposable.dispose();
  });

  it('should fire onDidCreateFiles when workspace.fs.writeFile creates a new file', async () => {
    const onCreateSpy = vi.fn();
    const disposable = mockly.workspace.onDidCreateFiles(onCreateSpy);

    const newFileUri = mockly.Uri.file('/test/created.txt');
    await mockly.workspace.fs.writeFile(newFileUri, Buffer.from('newly created'));

    expect(onCreateSpy).toHaveBeenCalledTimes(1);
    const eventArg = onCreateSpy.mock.calls[0][0];
    expect(eventArg.files.length).toBe(1);
    expect(eventArg.files[0].toString()).toBe(newFileUri.toString());

    disposable.dispose();
  });
});
~~~

## Mocking `vscode.window`

The `mockly.window` object simulates the `vscode.window` API, which is used for UI interactions like showing text editors, displaying messages, creating terminals, and managing status bar items.

### Text Editors

Mockly allows you to simulate the behavior of text editors.

*   `mockly.window.activeTextEditor`: The currently active `TextEditor`, or `undefined`.
*   `mockly.window.visibleTextEditors`: An array of all visible `TextEditor` objects.
*   `mockly.window.showTextDocument(documentOrUri, options?)`: Shows a text document in an editor. This will typically open the document if it's not already open and make an editor for it active and visible.

The `TextEditor` mock itself provides properties like `document`, `selection`, `selections`, `options`, `viewColumn`, and methods like `edit()`, `revealRange()`, `setDecorations()`.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Window Text Editors', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should show a text document and make it active', async () => {
    const fileUri = mockly.Uri.file('/test/editorDoc.txt');
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from('Editor content'));
    const document = await mockly.workspace.openTextDocument(fileUri);

    expect(mockly.window.activeTextEditor).toBeUndefined();
    expect(mockly.window.visibleTextEditors.length).toBe(0);

    const editor = await mockly.window.showTextDocument(document);

    expect(mockly.window.activeTextEditor).toBe(editor);
    expect(mockly.window.visibleTextEditors.length).toBe(1);
    expect(mockly.window.visibleTextEditors[0]).toBe(editor);
    expect(editor.document.uri.toString()).toBe(fileUri.toString());
  });

  it('should allow editing through the active editor', async () => {
    const fileUri = mockly.Uri.file('/test/editMe.txt');
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from('Initial text.'));
    const document = await mockly.workspace.openTextDocument(fileUri);
    const editor = await mockly.window.showTextDocument(document);

    await editor.edit(editBuilder => {
      editBuilder.insert(new mockly.Position(0, 0), 'Prepended: ');
    });

    expect(editor.document.getText()).toBe('Prepended: Initial text.');
    expect(document.getText()).toBe('Prepended: Initial text.'); // Document is the same instance
  });
});
~~~

### User Interactions (Messages, Quick Picks, Input Boxes)

Mockly simulates user interaction dialogs. You can spy on these methods or, for `showQuickPick` and `showInputBox`, queue predefined responses using `vscodeSimulator`.

*   `mockly.window.showInformationMessage(message, ...itemsOrOptions)`
*   `mockly.window.showWarningMessage(message, ...itemsOrOptions)`
*   `mockly.window.showErrorMessage(message, ...itemsOrOptions)`
*   `mockly.window.showQuickPick(items, options?, token?)`
*   `mockly.window.showInputBox(options?, token?)`

To control the return values of `showQuickPick` and `showInputBox` for testing purposes:
*   `vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(expectedItems, returnValue)`
*   `vscodeSimulator._windowModule._userInteractionService.expectInputBoxAndReturn(returnValue)`

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('User Interactions', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should allow spying on showInformationMessage', async () => {
    const spy = vi.spyOn(mockly.window, 'showInformationMessage');
    await mockly.window.showInformationMessage('Test Info');
    expect(spy).toHaveBeenCalledWith('Test Info');
  });

  it('should return a predefined value for showQuickPick', async () => {
    const items = ['Option 1', 'Option 2'];
    const expectedSelection = 'Option 1';

    vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(items, expectedSelection);

    const selection = await mockly.window.showQuickPick(items);
    expect(selection).toBe(expectedSelection);
  });

  it('should return a predefined value for showInputBox', async () => {
    const expectedInput = 'User typed this';

    vscodeSimulator._windowModule._userInteractionService.expectInputBoxAndReturn(expectedInput);

    const input = await mockly.window.showInputBox({ prompt: 'Enter value:' });
    expect(input).toBe(expectedInput);
  });

  it('showQuickPick resolves to undefined if no expectation is set', async () => {
    const items = ['Option 1', 'Option 2'];
    // No expectation set
    const selection = await mockly.window.showQuickPick(items);
    expect(selection).toBeUndefined();
  });
});
~~~

### Output Channels

You can create and interact with mock output channels.

*   `mockly.window.createOutputChannel(name, languageIdOrOptions?)`: Creates or retrieves an existing `OutputChannel` or `LogOutputChannel`.

The `OutputChannel` mock provides methods like `append()`, `appendLine()`, `clear()`, `show()`, `hide()`, `dispose()`. `LogOutputChannel` additionally provides logging methods like `trace()`, `debug()`, `info()`, `warn()`, `error()` and `logLevel` property with `onDidChangeLogLevel` event.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Output Channels', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should create and allow appending to an output channel', () => {
    const channelName = 'My Test Channel';
    const channel = mockly.window.createOutputChannel(channelName);
    expect(channel.name).toBe(channelName);

    // Output is typically logged to console in the mock environment
    const consoleSpy = vi.spyOn(console, 'log');
    channel.appendLine('Hello from channel!');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Output My Test Channel] Hello from channel!'));

    channel.dispose();
    consoleSpy.mockRestore();
  });

  it('should create a LogOutputChannel', () => {
    const channelName = 'My Log Channel';
    const logChannel = mockly.window.createOutputChannel(channelName, { log: true });
    expect(logChannel.name).toBe(channelName);
    expect(logChannel.logLevel).toBe(mockly.LogLevel.Info); // Default

    const consoleSpy = vi.spyOn(console, 'log');
    logChannel.info('This is an info log.');
    // Example: [LogOutput My Log Channel - INFO] This is an info log.
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`[LogOutput ${channelName} - INFO] This is an info log.`));

    // Simulate log level change (internal for testing)
    const onDidChangeLogLevelSpy = vi.fn();
    logChannel.onDidChangeLogLevel(onDidChangeLogLevelSpy);
    (logChannel as any)._setLogLevel(mockly.LogLevel.Debug);
    expect(logChannel.logLevel).toBe(mockly.LogLevel.Debug);
    expect(onDidChangeLogLevelSpy).toHaveBeenCalledWith(mockly.LogLevel.Debug);

    logChannel.dispose();
    consoleSpy.mockRestore();
  });
});
~~~

### Terminals

Mockly simulates the creation and management of terminals.

*   `mockly.window.terminals`: An array of active `Terminal` objects.
*   `mockly.window.activeTerminal`: The currently active `Terminal`, or `undefined`.
*   `mockly.window.createTerminal(nameOrOptions?, shellPath?, shellArgs?)`: Creates a new `Terminal`.

The `Terminal` mock provides properties like `name`, `processId`, `creationOptions`, and methods like `sendText()`, `show()`, `hide()`, `dispose()`.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Terminals', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should create a terminal and make it active', () => {
    expect(mockly.window.terminals.length).toBe(0);
    expect(mockly.window.activeTerminal).toBeUndefined();

    const terminal = mockly.window.createTerminal('TestTerm');
    expect(terminal.name).toBe('TestTerm');
    expect(mockly.window.terminals.length).toBe(1);
    expect(mockly.window.activeTerminal).toBe(terminal);

    const consoleSpy = vi.spyOn(console, 'log');
    terminal.sendText('echo "Hello Terminal"');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Terminal TestTerm] sendText: echo "Hello Terminal"'));

    terminal.dispose();
    expect(mockly.window.terminals.length).toBe(0);
    expect(mockly.window.activeTerminal).toBeUndefined(); // Active terminal is cleared on dispose
    consoleSpy.mockRestore();
  });
});
~~~

### Status Bar

`mockly.window.createStatusBarItem(idOrAlignment?, alignmentOrPriority?, priority?)` creates a mock `StatusBarItem`.

The `StatusBarItem` mock provides properties like `id`, `alignment`, `priority`, `text`, `tooltip`, `command`, and methods `show()`, `hide()`, `dispose()`. Interactions are typically logged to the console.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Status Bar', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should create a status bar item', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const statusBarItem = mockly.window.createStatusBarItem(mockly.StatusBarAlignment.Left, 100);
    statusBarItem.text = 'My Status';
    statusBarItem.tooltip = 'My Tooltip';
    statusBarItem.show();

    expect(statusBarItem.alignment).toBe(mockly.StatusBarAlignment.Left);
    expect(statusBarItem.priority).toBe(100);
    expect(statusBarItem.text).toBe('My Status');
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`StatusBarItem ${statusBarItem.id}.show()`));

    statusBarItem.hide();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`StatusBarItem ${statusBarItem.id}.hide()`));

    statusBarItem.dispose();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`StatusBarItem ${statusBarItem.id}.dispose()`));

    consoleSpy.mockRestore();
  });
});
~~~

### Tree Data Providers

`mockly.window.registerTreeDataProvider(viewId, treeDataProvider)` simulates registering a `TreeDataProvider`. The mock implementation primarily logs the registration and disposal. Testing tree data providers usually involves testing the provider's methods (`getChildren`, `getTreeItem`) directly.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Tree Data Providers', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should register and dispose a tree data provider', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const mockProvider = {
      getChildren: vi.fn(),
      getTreeItem: vi.fn(),
      // onDidChangeTreeData: new mockly.EventEmitter<any>().event // If needed
    };

    const disposable = mockly.window.registerTreeDataProvider('myTestView', mockProvider);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[UI MOCK] registerTreeDataProvider called for view: myTestView'));

    disposable.dispose();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[UI MOCK] Disposing TreeDataProvider for view: myTestView'));

    consoleSpy.mockRestore();
  });
});
~~~

### Events

Mockly simulates various window-related events.

*   `mockly.window.onDidChangeActiveTextEditor`
*   `mockly.window.onDidChangeVisibleTextEditors`
*   `mockly.window.onDidChangeTextEditorSelection`
*   `mockly.window.onDidChangeTextEditorVisibleRanges`
*   `mockly.window.onDidChangeTextEditorOptions`
*   `mockly.window.onDidChangeTextEditorViewColumn`
*   `mockly.window.onDidChangeWindowState`
*   `mockly.window.onDidOpenTerminal`
*   `mockly.window.onDidCloseTerminal`
*   `mockly.window.onDidChangeActiveTerminal`

These events are fired automatically by Mockly when corresponding actions occur.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Window Events', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should fire onDidChangeActiveTextEditor', async () => {
    const onActiveEditorChangeSpy = vi.fn();
    const disposable = mockly.window.onDidChangeActiveTextEditor(onActiveEditorChangeSpy);

    const fileUri = mockly.Uri.file('/test/activeChange.txt');
    await mockly.workspace.fs.writeFile(fileUri, Buffer.from('content'));
    const document = await mockly.workspace.openTextDocument(fileUri);

    // Showing a document makes it active by default
    const editor = await mockly.window.showTextDocument(document);

    expect(onActiveEditorChangeSpy).toHaveBeenCalledTimes(1);
    expect(onActiveEditorChangeSpy).toHaveBeenCalledWith(editor);

    // Simulate making no editor active (e.g., by closing the last one or test control)
    // For test control, you can use the internal service:
    vscodeSimulator._windowModule._textEditorService.setActiveTextEditor(undefined);
    expect(onActiveEditorChangeSpy).toHaveBeenCalledTimes(2);
    expect(onActiveEditorChangeSpy).toHaveBeenLastCalledWith(undefined);


    disposable.dispose();
  });

  it('should fire onDidOpenTerminal', () => {
    const onOpenTerminalSpy = vi.fn();
    const disposable = mockly.window.onDidOpenTerminal(onOpenTerminalSpy);

    const terminal = mockly.window.createTerminal('EventTerm');
    expect(onOpenTerminalSpy).toHaveBeenCalledTimes(1);
    expect(onOpenTerminalSpy).toHaveBeenCalledWith(terminal);

    disposable.dispose();
  });
});
~~~

## Mocking `vscode.commands`

The `mockly.commands` object simulates the `vscode.commands` API.

### Registering and Executing Commands

*   `mockly.commands.registerCommand(commandId, callback, thisArg?)`: Registers a command handler.
*   `mockly.commands.executeCommand(commandId, ...args)`: Executes a registered command.
*   `mockly.commands.getCommands(filterInternal?)`: Gets a list of registered command IDs.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Commands', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should register and execute a command', async () => {
    const commandId = 'my.test.command';
    const mockCallback = vi.fn((arg1: string) => `Received: ${arg1}`);

    const disposable = mockly.commands.registerCommand(commandId, mockCallback);

    const result = await mockly.commands.executeCommand<string>(commandId, 'hello');
    expect(mockCallback).toHaveBeenCalledWith('hello');
    expect(result).toBe('Received: hello');

    const commands = await mockly.commands.getCommands();
    expect(commands).toContain(commandId);

    disposable.dispose(); // Unregisters the command

    const commandsAfterDispose = await mockly.commands.getCommands();
    expect(commandsAfterDispose).not.toContain(commandId);

    await expect(mockly.commands.executeCommand(commandId, 'world'))
      .rejects.toThrowError(/Command 'my.test.command' not found/);
  });
});
~~~

## Mocking `vscode.env`

The `mockly.env` object simulates the `vscode.env` API, providing information about the mock environment.

### Environment Properties

Mockly provides sensible defaults for most `vscode.env` properties:

*   `mockly.env.appName`: e.g., "Mock VS Code"
*   `mockly.env.appRoot`: e.g., "/mock/app/root"
*   `mockly.env.language`: e.g., "en"
*   `mockly.env.machineId`: e.g., "mock-machine-id"
*   `mockly.env.sessionId`: A unique mock session ID.
*   `mockly.env.uiKind`: `UIKind.Desktop`
*   `mockly.env.uriScheme`: "vscode"
*   `mockly.env.logLevel`: Current log level of the mock utilities.
*   `mockly.env.onDidChangeLogLevel`: Event fired when the mock log level changes.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Environment', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should provide mock environment properties', () => {
    expect(mockly.env.appName).toBe('Mock VS Code');
    expect(mockly.env.language).toBe('en');
    expect(mockly.env.uiKind).toBe(mockly.UIKind.Desktop);
  });
});
~~~

### Clipboard

`mockly.env.clipboard` simulates the system clipboard with `readText()` and `writeText()` methods.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Clipboard', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset(); // Resets clipboard content
  });

  it('should simulate clipboard read and write', async () => {
    const textToWrite = 'Copied to mock clipboard!';
    await mockly.env.clipboard.writeText(textToWrite);

    const readText = await mockly.env.clipboard.readText();
    expect(readText).toBe(textToWrite);
  });
});
~~~

### External URI Handling

*   `mockly.env.openExternal(uri)`: Simulates opening a URI externally (e.g., in a browser). Returns a promise resolving to `true`.
*   `mockly.env.asExternalUri(uri)`: Simulates converting a URI to an external URI. Returns the same URI by default.

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('External URI Handling', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should simulate openExternal', async () => {
    const consoleSpy = vi.spyOn(console, 'log'); // Mockly logs these actions
    const targetUri = mockly.Uri.parse('https://example.com');
    const success = await mockly.env.openExternal(targetUri);

    expect(success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`EnvService.openExternal called for: ${targetUri.toString()}`));
    consoleSpy.mockRestore();
  });
});
~~~

## Mocking `vscode.extensions`

The `mockly.extensions` object simulates the `vscode.extensions` API.

### Managing Mock Extensions

*   `mockly.extensions.getExtension(extensionId)`: Retrieves a mock extension by its ID.
*   `mockly.extensions.all`: An array of all registered mock extensions.
*   `mockly.extensions.onDidChange`: Event fired when the list of extensions changes.

To add or remove mock extensions for testing, you use the internal `_extensionsService` via `vscodeSimulator`:

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('Extensions', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should allow adding and retrieving mock extensions', () => {
    const mockExtension = {
      id: 'publisher.my-mock-ext',
      extensionUri: mockly.Uri.file('/mock/extensions/my-mock-ext'),
      extensionPath: '/mock/extensions/my-mock-ext',
      isActive: false,
      packageJSON: { name: 'my-mock-ext', version: '1.0.0' },
      extensionKind: mockly.ExtensionKind.Workspace,
      exports: {},
      activate: vi.fn().mockResolvedValue({}),
    };

    // Add using the internal service
    vscodeSimulator._extensionsModule._extensionsService._addExtension(mockExtension);

    const retrievedExt = mockly.extensions.getExtension('publisher.my-mock-ext');
    expect(retrievedExt).toBeDefined();
    expect(retrievedExt?.id).toBe(mockExtension.id);
    expect(mockly.extensions.all.length).toBe(1);

    // Simulate activation
    if (retrievedExt) {
      await retrievedExt.activate();
      expect(mockExtension.activate).toHaveBeenCalled();
    }
  });
});
~~~

## Mocking Core VS Code Types

Mockly-VSC provides mock implementations for many of the core types, classes, and enums found in the `vscode` API. These are generally accessible directly from the `mockly` object.

### `Uri`

Mockly uses `vscode-uri` internally and exposes its `URI` class (and related static methods like `file()`, `parse()`, `joinPath()`) via `mockly.Uri`.

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, it, expect } from 'vitest';

describe('Uri Type', () => {
  it('should create file URIs', () => {
    const fileUri = mockly.Uri.file('/path/to/your/file.txt');
    expect(fileUri.scheme).toBe('file');
    expect(fileUri.fsPath).toBe('/path/to/your/file.txt'); // fsPath might be platform-dependent for normalization
  });

  it('should parse URIs', () => {
    const parsedUri = mockly.Uri.parse('untitled:Untitled-1');
    expect(parsedUri.scheme).toBe('untitled');
    expect(parsedUri.path).toBe('Untitled-1');
  });

  it('should join paths', () => {
    const baseUri = mockly.Uri.file('/base');
    const joinedUri = mockly.Uri.joinPath(baseUri, 'folder', 'file.ext');
    expect(joinedUri.path).toBe('/base/folder/file.ext');
  });
});
~~~

### `Position`, `Range`, `Selection`, `Location`

These fundamental types for representing locations and areas within documents are available:

*   `new mockly.Position(line, character)`
*   `new mockly.Range(startPositionOrLine, endPositionOrChar, endLine?, endChar?)`
*   `new mockly.Selection(anchorPositionOrLine, activePositionOrChar, activeLine?, activeChar?)`
*   `new mockly.Location(uri, rangeOrPosition)`

These classes come with their standard methods like `isBefore`, `contains`, `isEqual`, `translate`, `with`, etc.

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, it, expect } from 'vitest';

describe('Positional Types', () => {
  it('should create and compare Positions', () => {
    const pos1 = new mockly.Position(0, 5);
    const pos2 = new mockly.Position(1, 0);
    expect(pos1.isBefore(pos2)).toBe(true);
  });

  it('should create Ranges', () => {
    const range = new mockly.Range(new mockly.Position(0, 0), new mockly.Position(0, 10));
    expect(range.isEmpty).toBe(false);
    expect(range.isSingleLine).toBe(true);
  });

  it('should create Selections', () => {
    const anchor = new mockly.Position(1, 5);
    const active = new mockly.Position(1, 0);
    const selection = new mockly.Selection(anchor, active); // anchor, active
    expect(selection.isReversed).toBe(true); // active is before anchor
    expect(selection.start.isEqual(active)).toBe(true); // Range start/end are sorted
    expect(selection.end.isEqual(anchor)).toBe(true);
  });
});
~~~

### `Disposable`, `EventEmitter`

*   `new mockly.Disposable(callOnDisposeFunction)`: Creates a disposable object.
*   `mockly.Disposable.from(...disposables)`: Creates a disposable that groups other disposables.
*   `new mockly.EventEmitter<T>()`: Creates an event emitter. The `event` property provides the `Event<T>` interface, and `fire(data)` emits an event.

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, it, expect, vi } from 'vitest';

describe('Eventing Types', () => {
  it('should handle Disposables', () => {
    const disposeFn = vi.fn();
    const disposable = new mockly.Disposable(disposeFn);
    disposable.dispose();
    expect(disposeFn).toHaveBeenCalledTimes(1);
  });

  it('should work with EventEmitter', () => {
    const emitter = new mockly.EventEmitter<string>();
    const listener = vi.fn();

    const subscription = emitter.event(listener);
    emitter.fire('test-event');

    expect(listener).toHaveBeenCalledWith('test-event');
    subscription.dispose();
    emitter.fire('another-event');
    expect(listener).toHaveBeenCalledTimes(1); // Listener removed
    emitter.dispose();
  });
});
~~~

### `CancellationTokenSource`

`new mockly.CancellationTokenSource()` creates a source for cancellation tokens, useful for testing operations that can be cancelled.

*   `cancellationTokenSource.token`: The `CancellationToken`.
*   `cancellationTokenSource.cancel()`: Signals cancellation.
*   `cancellationTokenSource.dispose()`

The `CancellationToken` has `isCancellationRequested` and `onCancellationRequested` (an `Event<void>`).

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, it, expect, vi } from 'vitest';

describe('Cancellation', () => {
  it('should simulate CancellationTokenSource', async () => {
    const cts = new mockly.CancellationTokenSource();
    const token = cts.token;
    const onCancelSpy = vi.fn();
    token.onCancellationRequested(onCancelSpy);

    expect(token.isCancellationRequested).toBe(false);
    cts.cancel();
    expect(token.isCancellationRequested).toBe(true);
    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    cts.dispose();
  });
});
~~~

### `TextEdit`, `WorkspaceEdit`

*   `mockly.TextEdit.replace(range, newText)`
*   `mockly.TextEdit.insert(position, newText)`
*   `mockly.TextEdit.delete(range)`
*   `new mockly.WorkspaceEdit()`: Creates a workspace edit. It has methods like `replace()`, `insert()`, `delete()` (for text edits), and `createFile()`, `deleteFile()`, `renameFile()` (for file operations).

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, it, expect } from 'vitest';

describe('Edits', () => {
  it('should create TextEdits', () => {
    const range = new mockly.Range(0, 0, 0, 5);
    const textEdit = mockly.TextEdit.replace(range, 'new');
    expect(textEdit.newText).toBe('new');
    expect(textEdit.range.isEqual(range)).toBe(true);
  });

  it('should allow operations on WorkspaceEdit', () => {
    const wsEdit = new mockly.WorkspaceEdit();
    const uri = mockly.Uri.file('/test.txt');
    const range = new mockly.Range(0,0,0,0);

    wsEdit.insert(uri, new mockly.Position(0,0), 'hello');
    wsEdit.delete(uri, range); // Example, might not be logical sequence

    expect(wsEdit.size).toBe(2); // Two operations
    const entries = wsEdit.get(uri);
    expect(entries.length).toBe(2);
  });
});
~~~

### `FileSystemError`, `FileType`, and other Enums

Mockly exposes core enums and the `FileSystemError` class:

*   `mockly.FileSystemError.FileNotFound(uri?)`, `mockly.FileSystemError.FileExists(uri?)`, etc.
*   `mockly.FileType.File`, `mockly.FileType.Directory`, `mockly.FileType.Unknown`
*   `mockly.LogLevel`
*   `mockly.ViewColumn`
*   `mockly.EndOfLine`
*   `mockly.DiagnosticSeverity`
*   And many others (see `vscEnums.ts` in the source for a full list).

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, it, expect } from 'vitest';

describe('Enums and Errors', () => {
  it('should provide FileType enum', () => {
    expect(mockly.FileType.File).toBe(1);
    expect(mockly.FileType.Directory).toBe(2);
  });

  it('should create FileSystemErrors', () => {
    const uri = mockly.Uri.file('/nonexistent.txt');
    const error = mockly.FileSystemError.FileNotFound(uri);
    expect(error.name).toBe('FileSystemError');
    expect(error.code).toBe('FileNotFound');
  });

  it('should provide LogLevel enum', () => {
    expect(mockly.LogLevel.Info).toBe(3);
  });
});
~~~

## Test Control and State Management

### Resetting the Mock Environment

To ensure test isolation, it's crucial to reset Mockly's state before or after each test. The `vscodeSimulator.reset()` method handles this.

~~~typescript
import { vscodeSimulator } from 'mockly-vsc';
import { beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
  await vscodeSimulator.reset();
});

// Or, if you prefer afterEach:
// afterEach(async () => {
//   await vscodeSimulator.reset();
// });
~~~

This clears:
*   Workspace folders, name, and workspace file.
*   Open text documents.
*   The entire mock file system state.
*   Active and visible text editors.
*   Queued user interactions (quick picks, input boxes).
*   Active and created terminals.
*   Created output channels.
*   Registered commands.
*   Clipboard content and other environment states.
*   Registered mock extensions.
*   All event listeners on internal event emitters.

### Accessing Internal Services (Advanced)

For advanced scenarios, such as setting up complex initial states or verifying internal behavior of the mock, `vscodeSimulator` exposes its internal modules, which in turn expose their services:

*   `vscodeSimulator._workspaceModule`: Access to `_workspaceStateService`, `_textDocumentService`, etc.
*   `vscodeSimulator._windowModule`: Access to `_textEditorService`, `_userInteractionService`, `_terminalService`, `_outputChannelService`.
*   `vscodeSimulator._commandsModule`: Access to `_commandsService`.
*   `vscodeSimulator._envModule`: Access to `_envService`.
*   `vscodeSimulator._extensionsModule`: Access to `_extensionsService`.
*   `vscodeSimulator._fileSystemModule`: Access to `_fileSystemStateService`, `_uriService`, `_nodePathService`, and the `fs` (IFileSystemService) itself.

**Example:** Directly adding a file to the mock file system without going through `mockly.workspace.fs.writeFile`.

~~~typescript
import { vscodeSimulator, mockly } from 'mockly-vsc';
import { describe, it, expect } from 'vitest';

describe('Advanced State Management', () => {
  it('should allow direct manipulation of the file system state', async () => {
    const fileUri = mockly.Uri.file('/internal/file.txt');
    const content = Uint8Array.from(Buffer.from('Internal content'));

    // Access internal FileSystemStateService via FileSystemModule
    vscodeSimulator._fileSystemModule._fileSystemStateService.addFile(fileUri, content);

    const stat = await mockly.workspace.fs.stat(fileUri); // Verify via public API
    expect(stat.type).toBe(mockly.FileType.File);
    const readContent = await mockly.workspace.fs.readFile(fileUri);
    expect(readContent.toString()).toBe('Internal content');
  });
});
~~~
**Caution**: Directly manipulating internal services should be done sparingly, as it can make tests more brittle if internal structures change. Prefer using the public `mockly` API for interactions whenever possible.

## Examples

Here are a few examples demonstrating common testing scenarios with Mockly-VSC.

### Example: Testing a Command

Let's say you have a command that creates a new file with some default content.

**Extension Code (simplified):**
~~~typescript
// src/myExtension.ts
import * as vscode from 'vscode';

export async function createFileWithContentCommand() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return;
  }
  const rootPath = workspaceFolders[0].uri;
  const newFilePath = vscode.Uri.joinPath(rootPath, 'newMocklyFile.txt');
  const defaultContent = 'Hello from Mockly command!';

  try {
    await vscode.workspace.fs.writeFile(newFilePath, Buffer.from(defaultContent));
    const document = await vscode.workspace.openTextDocument(newFilePath);
    await vscode.window.showTextDocument(document);
    vscode.window.showInformationMessage(`File created: ${newFilePath.fsPath}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to create file: ${error}`);
  }
}
~~~

**Test Code:**
~~~typescript
// test/myExtension.test.ts
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { describe, it, expect, beforeEach, vi } from 'vitest';
// Assuming createFileWithContentCommand is exported or accessible for testing
import { createFileWithContentCommand } from '../src/myExtension';


describe('createFileWithContentCommand', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();

    // Setup a workspace folder for the command to use
    const workspaceUri = mockly.Uri.file('/project');
    await vscodeSimulator._fileSystemModule.fs.createDirectory(workspaceUri); // Create dir in VFS
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(workspaceUri);
  });

  it('should create a new file with default content and open it', async () => {
    const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');
    const errorSpy = vi.spyOn(mockly.window, 'showErrorMessage');

    await createFileWithContentCommand();

    const expectedFilePath = '/project/newMocklyFile.txt';
    const expectedFileUri = mockly.Uri.file(expectedFilePath);

    // Verify file was created in the mock file system
    const fileStat = await mockly.workspace.fs.stat(expectedFileUri);
    expect(fileStat.type).toBe(mockly.FileType.File);
    const fileContent = await mockly.workspace.fs.readFile(expectedFileUri);
    expect(fileContent.toString()).toBe('Hello from Mockly command!');

    // Verify document was opened and shown
    expect(mockly.workspace.textDocuments.some(doc => doc.uri.path === expectedFilePath)).toBe(true);
    expect(mockly.window.activeTextEditor?.document.uri.path).toBe(expectedFilePath);

    // Verify messages
    expect(infoSpy).toHaveBeenCalledWith(`File created: ${expectedFilePath}`);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should show error if no workspace folder is open', async () => {
    await vscodeSimulator.reset(); // Reset to a state with no workspace folders
    const errorSpy = vi.spyOn(mockly.window, 'showErrorMessage');

    await createFileWithContentCommand();

    expect(errorSpy).toHaveBeenCalledWith('No workspace folder open.');
  });
});
~~~

### Example: Simulating User Input

Testing a function that asks the user for input via `showQuickPick`.

**Extension Code (simplified):**
~~~typescript
// src/myUserInput.ts
import * as vscode from 'vscode';

export async function askUserForChoice(): Promise<string | undefined> {
  const choices = ['Apple', 'Banana', 'Cherry'];
  const selection = await vscode.window.showQuickPick(choices, { placeHolder: 'Choose a fruit' });
  if (selection) {
    vscode.window.showInformationMessage(`You chose: ${selection}`);
  }
  return selection;
}
~~~

**Test Code:**
~~~typescript
// test/myUserInput.test.ts
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { askUserForChoice } from '../src/myUserInput';

describe('askUserForChoice', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should return the selected choice and show message', async () => {
    const choices = ['Apple', 'Banana', 'Cherry'];
    const userSelection = 'Banana';

    // Queue the expected response for showQuickPick
    vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(choices, userSelection);
    const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');

    const result = await askUserForChoice();

    expect(result).toBe(userSelection);
    expect(infoSpy).toHaveBeenCalledWith(`You chose: ${userSelection}`);
  });

  it('should return undefined if user cancels quick pick', async () => {
    const choices = ['Apple', 'Banana', 'Cherry'];
    // Queue 'undefined' to simulate cancellation
    vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(choices, undefined);
    const infoSpy = vi.spyOn(mockly.window, 'showInformationMessage');

    const result = await askUserForChoice();

    expect(result).toBeUndefined();
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
~~~

### Example: Working with the Mock File System

Testing a function that reads a configuration file.

**Extension Code (simplified):**
~~~typescript
// src/myConfigReader.ts
import * as vscode from 'vscode';

export async function readMyConfig(): Promise<string | null> {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
    return null;
  }
  const configFileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.myconfig');
  try {
    const contentBytes = await vscode.workspace.fs.readFile(configFileUri);
    return Buffer.from(contentBytes).toString('utf-8');
  } catch (error) {
    if ((error as vscode.FileSystemError).code === 'FileNotFound') {
      return null;
    }
    throw error;
  }
}
~~~

**Test Code:**
~~~typescript
// test/myConfigReader.test.ts
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { describe, it, expect, beforeEach } from 'vitest';
import { readMyConfig } from '../src/myConfigReader';

describe('readMyConfig', () => {
  const workspaceUri = mockly.Uri.file('/project');
  const configFileUri = mockly.Uri.joinPath(workspaceUri, '.myconfig');

  beforeEach(async () => {
    await vscodeSimulator.reset();
    // Setup workspace folder
    await vscodeSimulator._fileSystemModule.fs.createDirectory(workspaceUri);
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(workspaceUri);
  });

  it('should read the config file if it exists', async () => {
    const configContent = 'setting=true';
    await mockly.workspace.fs.writeFile(configFileUri, Buffer.from(configContent));

    const result = await readMyConfig();
    expect(result).toBe(configContent);
  });

  it('should return null if config file does not exist', async () => {
    // Ensure file does not exist (reset does this, but good to be explicit)
    try {
      await mockly.workspace.fs.delete(configFileUri);
    } catch (e) { /* Ignore if already deleted */ }

    const result = await readMyConfig();
    expect(result).toBeNull();
  });

  it('should return null if no workspace folder is open', async () => {
    await vscodeSimulator.reset(); // No workspace folder

    const result = await readMyConfig();
    expect(result).toBeNull();
  });
});
~~~

### Example: Managing Workspace Folders

Testing logic that depends on the number or names of workspace folders.

**Extension Code (simplified):**
~~~typescript
// src/myWorkspaceLogic.ts
import * as vscode from 'vscode';

export function getWorkspaceStatus(): string {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return "No workspace open.";
  }
  if (folders.length === 1) {
    return `Single-root: ${folders[0].name}`;
  }
  return `Multi-root: ${folders.map(f => f.name).join(', ')}`;
}
~~~

**Test Code:**
~~~typescript
// test/myWorkspaceLogic.test.ts
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { describe, it, expect, beforeEach } from 'vitest';
import { getWorkspaceStatus } from '../src/myWorkspaceLogic';

describe('getWorkspaceStatus', () => {
  beforeEach(async () => {
    await vscodeSimulator.reset();
  });

  it('should report "No workspace open" when no folders', () => {
    expect(getWorkspaceStatus()).toBe("No workspace open.");
  });

  it('should report single-root status', async () => {
    const folderUri = mockly.Uri.file('/my-project');
    await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri);
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(folderUri, 'MyProject');

    expect(getWorkspaceStatus()).toBe("Single-root: MyProject");
  });

  it('should report multi-root status', async () => {
    const folderUri1 = mockly.Uri.file('/project-alpha');
    const folderUri2 = mockly.Uri.file('/project-beta');
    await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri1);
    await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri2);

    await vscodeSimulator._workspaceModule._workspaceStateService.setWorkspaceFolders([
      { uri: folderUri1, name: 'Alpha', index: 0 },
      { uri: folderUri2, name: 'Beta', index: 1 },
    ]);

    expect(getWorkspaceStatus()).toBe("Multi-root: Alpha, Beta");
  });
});
~~~

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

(Further details on contribution guidelines, development setup, etc., can be added here.)

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.