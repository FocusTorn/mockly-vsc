# API Reference: mockly.env

The `mockly.env` object simulates the `vscode.env` API, providing information about the mock application environment, clipboard access, external URI handling, and other environment-specific utilities.

## Environment Properties

Mockly-VSC provides sensible default mock values for most `vscode.env` properties. These properties allow your extension to query information about the "VSCode instance" it's running in.

**Key `mockly.env` properties:**

- `mockly.env.appName: string`: The name of the application (e.g., "Mock VS Code").
- `mockly.env.appRoot: string`: The root path of the application (e.g., "/mock/app/root").
- `mockly.env.appHost: string`: The host of the application (e.g., "desktop").
- `mockly.env.language: string`: The display language of the application (e.g., "en").
- `mockly.env.machineId: string`: A unique identifier for the machine (e.g., "mock-machine-id").
- `mockly.env.sessionId: string`: A unique identifier for the current session (e.g., a UUID like "mock-session-...") that changes with each `vscodeSimulator.reset()`.
- `mockly.env.remoteName: string | undefined`: The name of the remote, if any (e.g., "wsl", "ssh-remote"). Defaults to `undefined`. Can be set for testing via `vscodeSimulator._envModule._envService.setRemoteName('my-remote')`.
- `mockly.env.uiKind: mockly.UIKind`: The kind of UI. Defaults to `mockly.UIKind.Desktop`.
- `mockly.env.uriScheme: string`: The URI scheme used by VSCode (typically "vscode").
- `mockly.env.logLevel: mockly.LogLevel`: The current log level of the mock environment/VSCode itself. This can be controlled for testing.
- `mockly.env.onDidChangeLogLevel: mockly.Event<mockly.LogLevel>`: An event that fires when `mockly.env.logLevel` changes.
- `mockly.env.isNewAppInstall: boolean`: Whether this is a new install. Defaults to `false`.
- `mockly.env.isTelemetryEnabled: boolean`: Whether telemetry is enabled. Defaults to `false`.
- `mockly.env.onDidChangeTelemetryEnabled: mockly.Event<boolean>`: Event for telemetry state changes.
- `mockly.env.shell: string`: The user's default shell (e.g., "/bin/bash" or "powershell.exe"). Defaults to a mock value.

**Example:**

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc'; // LogLevel and UIKind are accessed via mockly
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Environment API (mockly.env) Properties Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should provide default mock environment properties', () => {
		expect(mockly.env.appName).toBe('Mock VS Code');
		expect(mockly.env.language).toBe('en');
		expect(mockly.env.uiKind).toBe(mockly.UIKind.Desktop); // Use mockly.UIKind
		expect(mockly.env.machineId).toBeDefined();
		expect(mockly.env.sessionId).toBeDefined();
		expect(mockly.env.uriScheme).toBe('vscode');
		expect(mockly.env.isTelemetryEnabled).toBe(false); // Default mock value
	});

	it('should allow changing and observing logLevel', () => {
		const initialLogLevel = mockly.env.logLevel; // Default is typically Info or as set by simulator
		const onLogLevelChangeSpy = vi.fn();
		const disposable = mockly.env.onDidChangeLogLevel(onLogLevelChangeSpy);

		// Simulate changing the log level (e.g., via a setting or command in a real scenario)
		// In Mockly, this can be done via the internal service for testing:
		vscodeSimulator._envModule._envService.setLogLevel(mockly.LogLevel.Debug); // Use mockly.LogLevel

		expect(mockly.env.logLevel).toBe(mockly.LogLevel.Debug); // Use mockly.LogLevel
		expect(onLogLevelChangeSpy).toHaveBeenCalledTimes(1);
		expect(onLogLevelChangeSpy).toHaveBeenCalledWith(mockly.LogLevel.Debug); // Use mockly.LogLevel

		disposable.dispose();
	});

	it('should allow setting and getting remoteName', () => {
		expect(mockly.env.remoteName).toBeUndefined(); // Default
		const testRemoteName = 'ssh-mock-server';
		vscodeSimulator._envModule._envService.setRemoteName(testRemoteName);
		expect(mockly.env.remoteName).toBe(testRemoteName);
	});
});
~~~

## Clipboard (mockly.env.clipboard)

`mockly.env.clipboard` provides an in-memory simulation of the system clipboard, allowing you to test copy and paste functionality.

**Key `mockly.env.clipboard` methods:**

- `readText(): Promise<string>`: Reads the current text content from the mock clipboard.
- `writeText(value: string): Promise<void>`: Writes the given text `value` to the mock clipboard.

The clipboard content is reset when `vscodeSimulator.reset()` is called.

**Example:**

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Clipboard (mockly.env.clipboard) Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset(); // Resets clipboard content to empty string
	});

	it('should simulate clipboard read and write operations', async () => {
		const textToWrite = 'This text is copied to the mock clipboard!';

		// Write to clipboard
		await mockly.env.clipboard.writeText(textToWrite);

		// Read from clipboard
		const readText = await mockly.env.clipboard.readText();
		expect(readText).toBe(textToWrite);
	});

	it('should start with an empty clipboard after reset', async () => {
		// Write something first to ensure it's cleared
		await mockly.env.clipboard.writeText('some initial text');

		await vscodeSimulator.reset(); // Reset again

		const textAfterReset = await mockly.env.clipboard.readText();
		expect(textAfterReset).toBe(''); // Default empty state
	});
});
~~~

## External URI Handling

Mockly-VSC simulates methods for opening external URIs (e.g., in a web browser) and converting URIs for external use.

**Key `mockly.env` methods for external URIs:**

- `openExternal(target: mockly.Uri): Promise<boolean>`:
  - Simulates opening a URI externally. In the mock environment, this typically logs the action to the console and resolves to `true`.
- `asExternalUri(target: mockly.Uri): Promise<mockly.Uri>`:
  - Simulates converting a URI to a URI that can be opened externally (e.g., by a browser).
  - In the default mock implementation, this usually returns the same `target` URI, but it can be customized for more complex remote scenarios if needed via internal service access.

**Example:**

~~~typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('External URI Handling (mockly.env) Tests', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		await vscodeSimulator.reset();
		consoleSpy = vi.spyOn(console, 'log'); // Mockly often logs these actions
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should simulate openExternal and log the action', async () => {
		const targetUri = mockly.Uri.parse('https://www.example.com/mockly-test');
		const success = await mockly.env.openExternal(targetUri);

		expect(success).toBe(true); // Mock always succeeds by default
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`EnvService.openExternal called for: ${targetUri.toString()}`),
		);
	});

	it('should simulate asExternalUri, returning the same URI by default', async () => {
		const internalUri = mockly.Uri.file('/path/to/resource');
		const externalUri = await mockly.env.asExternalUri(internalUri);

		expect(externalUri.toString()).toBe(internalUri.toString());
		// Check console for logging if any (asExternalUri might not log by default)
	});
});
~~~