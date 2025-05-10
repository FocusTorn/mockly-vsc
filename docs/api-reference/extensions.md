# API Reference: `mockly.extensions`

The `mockly.extensions` object simulates the `vscode.extensions` API, which provides access to information about installed extensions and allows interaction with their exported APIs. In Mockly-VSC, you primarily use this to set up mock extension data for your tests.

## Managing and Retrieving Mock Extensions

Mockly-VSC allows you to define and manage a list of mock extensions. Your extension under test can then query this list or retrieve specific mock extensions by their ID.

**Key `mockly.extensions` properties and methods:**

- `mockly.extensions.getExtension<T>(extensionId: string): Extension<T> | undefined`:
  - Retrieves a mock `Extension` object by its fully qualified ID (e.g., `publisher.name`).
  - The type parameter `T` represents the type of the extension's exported API (its `exports`).
  - Returns `undefined` if no extension with that ID is found in the mock registry.
- `mockly.extensions.all: readonly Extension<any>[]`:
  - An array of all currently registered mock `Extension` objects.
- `mockly.extensions.onDidChange: mockly.Event<void>`:
  - An event that fires when the list of mock extensions changes (e.g., when an extension is added or removed for testing purposes via the simulator).

**The `Extension<T>` Mock Object:**

The mock `Extension` object has the following key properties and methods:

- `id: string`: The unique identifier of the extension (e.g., `publisher.name`).
- `extensionUri: mockly.Uri`: The URI to the directory where the extension is notionally located in the mock file system.
- `extensionPath: string`: The file system path to the extension's directory.
- `isActive: boolean`: Indicates whether the mock extension is currently considered active.
- `packageJSON: any`: A mock representation of the extension's `package.json` content.
- `extensionKind: mockly.ExtensionKind`: The kind of extension (e.g., `UI`, `Workspace`). Defaults to `Workspace`.
- `exports: T`: The API exported by this mock extension. This is what `getExtension<T>(...).exports` would return.
- `activate(): Promise<T>`: A mock `activate` function. When called, it typically sets `isActive` to `true` and returns a promise resolving to `exports`. The actual mock implementation of `activate` can be provided when defining the mock extension.

**Adding and Managing Mock Extensions (for Test Setup):**

To add, remove, or modify mock extensions for your tests, you use the internal `_extensionsService` exposed via `vscodeSimulator`. Extensions don't typically add other extensions programmatically; this is for setting up the test environment.

- `vscodeSimulator._extensionsModule._extensionsService._addExtension(extensionData: Partial<Extension<any>> & { id: string })`: Adds or updates a mock extension.
- `vscodeSimulator._extensionsModule._extensionsService._removeExtension(extensionId: string)`: Removes a mock extension.
- `vscodeSimulator._extensionsModule._extensionsService._clearExtensions()`: Removes all mock extensions.

**Example:**

```typescript
import { ExtensionKind, mockly, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Define a type for our mock extension's API for better type safety
interface MyMockExtensionApi {
	greet: (name: string) => string;
	version: string;
}

describe('Extensions API (mockly.extensions) Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset(); // Clears registered mock extensions
	});

	it('should allow adding a mock extension and retrieving it', () => {
		const mockExtensionId = 'publisher.mock-dependency';
		const mockApi: MyMockExtensionApi = {
			greet: (name: string) => `Hello, ${name} from ${mockExtensionId}!`,
			version: '1.2.3',
		};

		const mockExtensionData = {
			id: mockExtensionId,
			extensionUri: mockly.Uri.file('/mock/extensions/mock-dependency'),
			extensionPath: '/mock/extensions/mock-dependency',
			isActive: false,
			packageJSON: {
				name: 'mock-dependency',
				version: '1.0.0',
				publisher: 'publisher',
				displayName: 'Mock Dependency Extension',
			},
			extensionKind: ExtensionKind.Workspace,
			exports: mockApi,
			activate: vi.fn(async () => { // Mock the activate function
				// 'this' inside activate refers to the Extension object itself
				(this as any).isActive = true;
				return mockApi;
			}),
		};

		// Add the mock extension using the internal service for test setup
		vscodeSimulator._extensionsModule._extensionsService._addExtension(mockExtensionData);

		// Retrieve the extension using the public API
		const retrievedExt = mockly.extensions.getExtension<MyMockExtensionApi>(mockExtensionId);

		expect(retrievedExt).toBeDefined();
		expect(retrievedExt?.id).toBe(mockExtensionId);
		expect(retrievedExt?.isActive).toBe(false); // Not yet activated
		expect(retrievedExt?.packageJSON.displayName).toBe('Mock Dependency Extension');
		expect(retrievedExt?.exports).toEqual(mockApi); // Exports are available even before activation in this mock setup
	});

	it('should simulate extension activation', async () => {
		const mockExtensionId = 'publisher.activatable-ext';
		const mockApi = { getStatus: () => 'active' };
		const activateSpy = vi.fn(async function(this: mockly.Extension<any>) { // Use function to get 'this'
			this.isActive = true;
			return mockApi;
		});

		vscodeSimulator._extensionsModule._extensionsService._addExtension({
			id: mockExtensionId,
			extensionUri: mockly.Uri.file('/mock/extensions/activatable-ext'),
			extensionPath: '/mock/extensions/activatable-ext',
			isActive: false,
			packageJSON: { name: 'activatable-ext', version: '0.1.0' },
			exports: {}, // Initial exports might be empty or different pre-activation
			activate: activateSpy,
		});

		const extension = mockly.extensions.getExtension(mockExtensionId);
		expect(extension?.isActive).toBe(false);

		// Activate the extension
		const exportedApi = await extension?.activate();

		expect(activateSpy).toHaveBeenCalledTimes(1);
		expect(extension?.isActive).toBe(true);
		expect(exportedApi).toEqual(mockApi);
		// After activation, the 'exports' property on the extension object itself is also updated
		expect(extension?.exports).toEqual(mockApi);
	});

	it('getExtension should return undefined for non-existent extensions', () => {
		const nonExistentId = 'publisher.does-not-exist';
		const extension = mockly.extensions.getExtension(nonExistentId);
		expect(extension).toBeUndefined();
	});

	it('mockly.extensions.all should list all registered mock extensions', () => {
		vscodeSimulator._extensionsModule._extensionsService._addExtension({ id: 'ext.one', packageJSON: {} });
		vscodeSimulator._extensionsModule._extensionsService._addExtension({ id: 'ext.two', packageJSON: {} });

		const allExtensions = mockly.extensions.all;
		expect(allExtensions.length).toBe(2);
		expect(allExtensions.map(e => e.id)).toContain('ext.one');
		expect(allExtensions.map(e => e.id)).toContain('ext.two');
	});

	it('onDidChange event should fire when extensions are added or removed', () => {
		const onChangeSpy = vi.fn();
		const disposable = mockly.extensions.onDidChange(onChangeSpy);

		vscodeSimulator._extensionsModule._extensionsService._addExtension({ id: 'evt.ext1', packageJSON: {} });
		expect(onChangeSpy).toHaveBeenCalledTimes(1);

		vscodeSimulator._extensionsModule._extensionsService._removeExtension('evt.ext1');
		expect(onChangeSpy).toHaveBeenCalledTimes(2);

		vscodeSimulator._extensionsModule._extensionsService._clearExtensions();
		if (mockly.extensions.all.length > 0) { // Only fires if there were extensions to clear
			expect(onChangeSpy).toHaveBeenCalledTimes(3);
		}

		disposable.dispose();
	});
});
```

**Testing Extensions that Depend on Other Extensions:**

If your extension under test depends on the API of another extension, you can use the methods described above to:

1. Define a mock version of the dependent extension, including its `id` and a mock `exports` object.
2. In your test, your extension code would call `vscode.extensions.getExtension('dependency.id')`.
3. Mockly-VSC will return your defined mock extension, allowing your code to interact with its `exports`.
4. You can then assert that your extension correctly uses the dependent API and that the mock `activate` function (if relevant) was called.

This approach allows you to test inter-extension interactions in a controlled environment without needing the actual dependent extensions to be "installed" in your test runner.
