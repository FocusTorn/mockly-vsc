# API Reference: mockly.commands

The `mockly.commands` object simulates the `vscode.commands` API, which is used for registering, executing, and discovering commands within the VSCode environment.

## Registering and Executing Commands

Mockly-VSC allows you to register mock command handlers and then execute them, simulating the command flow in a real VSCode extension.

**Key `mockly.commands` methods:**

- `mockly.commands.registerCommand(commandId: string, callback: (...args: any[]) => any, thisArg?: any): mockly.Disposable`:
  - Registers a command handler function (`callback`) for a given `commandId`.
  - The `callback` will be invoked when `executeCommand` is called with this `commandId`.
  - Returns a `mockly.Disposable`. Calling `.dispose()` on this object will unregister the command.
- `mockly.commands.executeCommand<T = unknown>(commandId: string, ...args: any[]): Promise<T>`:
  - Executes the command associated with the given `commandId`.
  - Any additional arguments (`...args`) are passed to the registered command handler.
  - Returns a promise that resolves with the result of the command handler. If the command is not found, the promise rejects.
- `mockly.commands.getCommands(filterInternal?: boolean): Promise<string[]>`:
  - Gets a list of all registered command IDs.
  - `filterInternal` (defaults to `false` in mock, `true` in actual VSCode) can be used to filter out commands starting with `_`. Mockly-VSC doesn't typically register internal commands unless you do so in your tests.

**Example:**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Commands API (mockly.commands) Tests', () => {
	let disposables: mockly.Disposable[] = [];

	beforeEach(async () => {
		await vscodeSimulator.reset(); // Clears all registered commands
	});

	afterEach(() => {
		disposables.forEach(d => d.dispose());
		disposables = [];
	});

	it('should register a command, execute it, and receive its result', async () => {
		const commandId = 'myExtension.testCommand';
		const mockCallback = vi.fn((name: string, count: number) => {
			return `Hello, ${name}! Count: ${count}.`;
		});

		// Register the command
		const disposable = mockly.commands.registerCommand(commandId, mockCallback);
		disposables.push(disposable);

		// Execute the command
		const argName = 'MocklyUser';
		const argCount = 5;
		const result = await mockly.commands.executeCommand<string>(commandId, argName, argCount);

		// Verify callback was called with correct arguments
		expect(mockCallback).toHaveBeenCalledTimes(1);
		expect(mockCallback).toHaveBeenCalledWith(argName, argCount);

		// Verify the result from executeCommand
		expect(result).toBe(`Hello, ${argName}! Count: ${argCount}.`);
	});

	it('should allow getting a list of registered commands', async () => {
		const commandId1 = 'myExtension.commandOne';
		const commandId2 = 'myExtension.commandTwo';

		disposables.push(mockly.commands.registerCommand(commandId1, () => {}));
		disposables.push(mockly.commands.registerCommand(commandId2, () => {}));

		const allCommands = await mockly.commands.getCommands();
		expect(allCommands).toContain(commandId1);
		expect(allCommands).toContain(commandId2);
		expect(allCommands.length).toBeGreaterThanOrEqual(2); // Could be other default commands if any
	});

	it('should unregister a command when its disposable is disposed', async () => {
		const commandId = 'myExtension.disposableCommand';
		const mockCallback = vi.fn();

		const disposable = mockly.commands.registerCommand(commandId, mockCallback);
		// No need to push to disposables array for this specific test if we dispose manually

		let commands = await mockly.commands.getCommands();
		expect(commands).toContain(commandId);

		// Dispose the command registration
		disposable.dispose();

		commands = await mockly.commands.getCommands();
		expect(commands).not.toContain(commandId);

		// Attempting to execute a disposed command should fail
		await expect(mockly.commands.executeCommand(commandId))
			.rejects.toThrowError(`Command '${commandId}' not found.`);
	});

	it('executeCommand should reject if the command is not found', async () => {
		const unknownCommandId = 'myExtension.nonExistentCommand';
		await expect(mockly.commands.executeCommand(unknownCommandId))
			.rejects.toThrowError(`Command '${unknownCommandId}' not found.`);
	});

	it('registerCommand should replace an existing command with the same ID', async () => {
		const commandId = 'myExtension.reRegisterCommand';
		const firstCallback = vi.fn(() => 'first');
		const secondCallback = vi.fn(() => 'second');

		// Register first time
		disposables.push(mockly.commands.registerCommand(commandId, firstCallback));
		let result = await mockly.commands.executeCommand(commandId);
		expect(result).toBe('first');
		expect(firstCallback).toHaveBeenCalledTimes(1);

		// Re-register with the same ID
		disposables.push(mockly.commands.registerCommand(commandId, secondCallback)); // Previous one is effectively disposed by re-registration
		result = await mockly.commands.executeCommand(commandId);
		expect(result).toBe('second');
		expect(secondCallback).toHaveBeenCalledTimes(1);
		expect(firstCallback).toHaveBeenCalledTimes(1); // First callback not called again
	});
});
```

## Built-in Commands (Simulation)

VSCode has many built-in commands (e.g., `'workbench.action.quickOpen'`, `'editor.action.formatDocument'`). Mockly-VSC does **not** provide mock implementations for all of these by default.

If your extension calls `vscode.commands.executeCommand` with a built-in VSCode command ID, and that command is not explicitly registered in your test setup (either by your own `registerCommand` or by Mockly-VSC's internal setup for a few very common commands), it will likely result in a "Command not found" error.

**Testing Extensions that Execute Built-in Commands:**

1. **Focus on Your Logic:** Test the parts of your extension that _decide_ to call a built-in command and the arguments they prepare.
2. **Mock the Specific Built-in Command:** If the _effect_ of the built-in command is crucial for your extension's subsequent logic, you can register a mock handler for that specific built-in command ID in your test:

   ```typescript
   it('should correctly call a built-in VSCode command', async () => {
   	const builtInCommandId = 'editor.action.formatDocument';
   	const mockFormatHandler = vi.fn();

   	// Register a mock handler for the built-in command for this test
   	const disposable = mockly.commands.registerCommand(builtInCommandId, mockFormatHandler);
   	disposables.push(disposable);

   	// --- Code in your extension that would eventually call this ---
   	// Example:
   	// async function formatActiveDocument() {
   	//   await vscode.commands.executeCommand('editor.action.formatDocument');
   	// }
   	// await formatActiveDocument();
   	// --- End of extension code example ---

   	// For the test, directly execute it or call your extension's function
   	await mockly.commands.executeCommand(builtInCommandId);

   	expect(mockFormatHandler).toHaveBeenCalledTimes(1);
   });
   ```
3. **Verify Side Effects:** If the built-in command is supposed to cause a change that Mockly-VSC _does_ simulate (e.g., opening a file, changing text), you might not need to mock the command itself but rather verify the side effect through `mockly.workspace` or `mockly.window`.

Mockly-VSC may provide mock implementations for a small, select set of common built-in commands if their behavior is tightly coupled with the core mocked APIs (e.g., a command that opens a specific view). However, the general approach is to allow users to mock them as needed for their specific testing scenarios.
