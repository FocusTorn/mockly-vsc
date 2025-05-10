# Getting Started with Mockly-VSC

This guide will walk you through installing Mockly-VSC and setting up your first tests.

## Installation

To add Mockly-VSC to your VSCode extension project, use your preferred package manager:

```bash
npm install mockly-vsc --save-dev
# or
yarn add mockly-vsc --dev
# or
pnpm add mockly-vsc --dev
```

### Peer Dependencies and Setup

Mockly-VSC relies on a few peer dependencies and requires a one-time setup for `reflect-metadata` (used by `tsyringe` for dependency injection).

1. **Install Peer Dependencies:**
   Ensure you have `vitest` and `vscode-uri` installed in your project:
   ```bash
   npm install vitest vscode-uri reflect-metadata --save-dev
   # or
   yarn add vitest vscode-uri reflect-metadata --dev
   # or
   pnpm add vitest vscode-uri reflect-metadata --dev
   ```

2. **Configure `reflect-metadata`:**
   Import `reflect-metadata` once in your Vitest setup file (e.g., `vitest.setup.ts` or `test/setup.ts`).
   Create this file if you don't have one already.

   **Example `vitest.setup.ts`:**
   ```typescript
   import 'reflect-metadata';

   // You can add other global test setups here if needed
   ```

3. **Configure Vitest to use the setup file:**
   Update your `vitest.config.ts` (or `vite.config.ts`) to include the `setupFiles` option:

   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
   	test: {
   		// ... other Vitest configurations
   		setupFiles: ['./path/to/your/vitest.setup.ts'], // Adjust the path accordingly
   		globals: true, // Optional: if you want Vitest globals like describe, it, etc.
   	},
   });
   ```

## Basic Usage

Once installed and configured, you can import `mockly` (the `vscode` API mock) and `vscodeSimulator` (for test control utilities) into your Vitest test files.

The `mockly` object is designed to be a drop-in replacement for the `vscode` namespace in your tests. The `vscodeSimulator` provides helper functions to control the mock environment, such as resetting its state.

Here's a basic example demonstrating how to test a function that interacts with the VSCode API:

```typescript
// myExtensionFeature.test.ts
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Imagine this is a function from your extension:
async function getOpenDocumentDetails() {
	if (mockly.workspace.textDocuments.length === 0) {
		return 'No documents open.';
	}
	const firstDoc = mockly.workspace.textDocuments[0];
	return `First open document: ${firstDoc.uri.fsPath}, Language: ${firstDoc.languageId}`;
}

async function showWelcomeMessage() {
	const userResponse = await mockly.window.showInformationMessage(
		'Welcome to My Extension!',
		'Learn More',
	);
	if (userResponse === 'Learn More') {
		mockly.env.openExternal(mockly.Uri.parse('https://example.com/learn-more'));
	}
	return userResponse;
}

// Your Vitest tests:
describe('My Extension Feature Tests', () => {
	beforeEach(async () => {
		// Reset the simulator's state before each test for isolation
		await vscodeSimulator.reset();
	});

	it('should report no open documents initially', async () => {
		const details = await getOpenDocumentDetails();
		expect(details).toBe('No documents open.');
	});

	it('should correctly report details of an opened document', async () => {
		const testFileUri = mockly.Uri.file('/project/test.ts');
		const fileContent = Buffer.from('console.log("hello world");');

		// 1. Create the file in the mock file system
		await mockly.workspace.fs.writeFile(testFileUri, fileContent);

		// 2. Open the document
		const document = await mockly.workspace.openTextDocument(testFileUri);
		// (Optional) You can also explicitly set the language if needed,
		// otherwise it might default or be inferred.
		// For this example, let's assume it's inferred or we can set it if we were creating an untitled doc.
		// If opening from a file, language ID is often inferred from the extension.
		// We can also open with options:
		// const document = await mockly.workspace.openTextDocument({ language: 'typescript', content: '...' });

		const details = await getOpenDocumentDetails();
		expect(details).toBe(`First open document: /project/test.ts, Language: typescript`); // Mockly infers 'typescript' from '.ts'
		expect(mockly.workspace.textDocuments.length).toBe(1);
		expect(mockly.workspace.textDocuments[0].uri.toString()).toBe(testFileUri.toString());
		expect(mockly.workspace.textDocuments[0].getText()).toBe('console.log("hello world");');
	});

	it('should handle information message and user response', async () => {
		const messageSpy = vi.spyOn(mockly.window, 'showInformationMessage');
		const openExternalSpy = vi.spyOn(mockly.env, 'openExternal');

		// Simulate the user clicking "Learn More"
		vscodeSimulator._windowModule._userInteractionService.expectInformationMessageAndReturn('Learn More');

		const response = await showWelcomeMessage();

		expect(messageSpy).toHaveBeenCalledWith('Welcome to My Extension!', 'Learn More');
		expect(response).toBe('Learn More');
		expect(openExternalSpy).toHaveBeenCalledWith(mockly.Uri.parse('https://example.com/learn-more'));
	});

	it('should handle information message dismissal', async () => {
		const messageSpy = vi.spyOn(mockly.window, 'showInformationMessage');
		const openExternalSpy = vi.spyOn(mockly.env, 'openExternal');

		// Simulate the user dismissing the message (or no specific button click)
		// For showInformationMessage, if no expectation is set, it resolves to undefined.
		// Or, explicitly:
		vscodeSimulator._windowModule._userInteractionService.expectInformationMessageAndReturn(undefined);

		const response = await showWelcomeMessage();

		expect(messageSpy).toHaveBeenCalledWith('Welcome to My Extension!', 'Learn More');
		expect(response).toBeUndefined();
		expect(openExternalSpy).not.toHaveBeenCalled();
	});
});
```

This example covers:

- Resetting the mock environment using `vscodeSimulator.reset()`.
- Creating a file in the mock file system using `mockly.workspace.fs.writeFile()`.
- Opening a text document using `mockly.workspace.openTextDocument()`.
- Accessing properties of the mocked `TextDocument`.
- Spying on `mockly.window.showInformationMessage` and `mockly.env.openExternal`.
- Controlling the return value of `showInformationMessage` using `vscodeSimulator` for testing different user interaction paths.

Now you're ready to start writing tests for your VSCode extension's functionality! For more detailed information on specific API areas, refer to the other sections in this documentation.
