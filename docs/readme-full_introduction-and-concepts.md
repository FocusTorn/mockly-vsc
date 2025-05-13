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
*   **Node.js Utilities (`mockly.node.path`, `mockly.node.fs`)**: Provides mocks for Node.js `path` and `fs` (primarily synchronous operations) modules, accessible via `mockly.node.path` and `mockly.node.fs`, for testing extension code that directly uses these Node.js APIs.
*   **Declarative VFS Population**: Easily set up the in-memory file system for your tests using `vscodeSimulator.vfs.populateSync()` or `vscodeSimulator.vfs.populate()` with a simple structure object.
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
    *   `mockly.node` (for Node.js `fs` and `path` mocks)
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
*   **Path Utilities (`vscodeSimulator.path`)**: Provides convenient access to Node.js-like path manipulation functions (e.g., `join`, `dirname`, `basename`, `normalize`) for use in test helpers. This is the same service instance exposed via `mockly.node.path`. See [Test Control & State Management > Path Manipulation](/test-control#path-manipulation-mockly-node-path-and-vscodesimulator-path) for details.
*   **VFS Population Utilities (`vscodeSimulator.vfs`)**: Offers `populate(structure)` and `populateSync(structure)` methods to declaratively set up the virtual file system. See [Test Control & State Management > Populating the Virtual File System](/test-control#populating-the-virtual-file-system-with-vscodesimulator-vfs) for details.
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
    // Use vfs.populateSync to create the directory
    vscodeSimulator.vfs.populateSync({ '/my/project': null });
    await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(testUri);

    expect(mockly.workspace.workspaceFolders?.[0].uri.toString()).toBe(testUri.toString());

    // Check internal state of the TextDocumentService
    const docService = vscodeSimulator._workspaceModule._textDocumentService;
    expect(docService.getTextDocuments().length).toBe(0); // No documents opened yet
  });
});
~~~