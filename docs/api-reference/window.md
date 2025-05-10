# API Reference: `mockly.window`

The `mockly.window` object simulates the `vscode.window` API, which is used for UI interactions such as showing text editors, displaying messages, creating terminals, managing status bar items, and handling window-related events.

## Text Editors

Mockly-VSC allows you to simulate the behavior of text editors within the mock environment.

**Key `mockly.window` properties and methods for text editors:**

- `mockly.window.activeTextEditor: TextEditor | undefined`: The currently active `TextEditor`, or `undefined` if no editor is active.
- `mockly.window.visibleTextEditors: TextEditor[]`: An array of all currently visible `TextEditor` objects.
- `mockly.window.showTextDocument(documentOrUri: TextDocument | mockly.Uri, options?: { viewColumn?: mockly.ViewColumn, preserveFocus?: boolean, preview?: boolean, selection?: mockly.Range }): Promise<TextEditor>`:
  - Shows a text document in an editor. If a `mockly.Uri` is provided, it will attempt to open the document first (via `mockly.workspace.openTextDocument`).
  - This will typically make an editor for the document active and visible.
  - Returns a promise that resolves to the `TextEditor` instance.

**The `TextEditor` Mock:**

The `TextEditor` object provided by `mockly` has properties and methods like:

- `document: TextDocument` (the document displayed in this editor)
- `selection: mockly.Selection` (the primary selection)
- `selections: mockly.Selection[]` (all selections)
- `options: mockly.TextEditorOptions` (e.g., tab size, insert spaces)
- `viewColumn: mockly.ViewColumn | undefined`
- `edit(callback: (editBuilder: TextEditorEdit) => void, options?: { undoStopBefore: boolean; undoStopAfter: boolean }): Promise<boolean>`: Performs edits on the document associated with this editor. The `TextEditorEdit` builder has methods like `insert`, `replace`, `delete`.
- `revealRange(range: mockly.Range, revealType?: mockly.TextEditorRevealType): void` (Simulated, typically logs)
- `setDecorations(decorationType: TextEditorDecorationType, rangesOrOptions: mockly.Range[] | DecorationOptions[]): void` (Simulated, typically logs)

**Example:**

```typescript
import { mockly, Position, Range, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Window Text Editors Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should show a text document and make it active', async () => {
		const fileUri = mockly.Uri.file('/test/editorDoc.txt');
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from('Content for the editor.'));
		// Note: showTextDocument can open the document if a URI is passed,
		// or you can pass an already opened TextDocument instance.
		// const document = await mockly.workspace.openTextDocument(fileUri);

		expect(mockly.window.activeTextEditor).toBeUndefined();
		expect(mockly.window.visibleTextEditors.length).toBe(0);

		const editor = await mockly.window.showTextDocument(fileUri); // Pass URI directly

		expect(mockly.window.activeTextEditor).toBe(editor);
		expect(mockly.window.visibleTextEditors.length).toBe(1);
		expect(mockly.window.visibleTextEditors[0]).toBe(editor);
		expect(editor.document.uri.toString()).toBe(fileUri.toString());
		expect(editor.document.getText()).toBe('Content for the editor.');
	});

	it('should allow editing through the active editor, updating the document', async () => {
		const fileUri = mockly.Uri.file('/test/editThisFile.txt');
		const initialContent = 'Initial text.';
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from(initialContent));
		const document = await mockly.workspace.openTextDocument(fileUri); // Open doc first
		const editor = await mockly.window.showTextDocument(document); // Then show it

		const success = await editor.edit(editBuilder => {
			editBuilder.insert(new mockly.Position(0, 0), 'Prepended content: ');
			editBuilder.replace(new mockly.Range(0, 26, 0, 30), 'TEXT'); // "Initial TEXT."
		});

		expect(success).toBe(true); // Indicates edit was applied
		const expectedText = 'Prepended content: Initial TEXT.';
		expect(editor.document.getText()).toBe(expectedText);
		// The underlying TextDocument instance is also updated
		expect(document.getText()).toBe(expectedText);
		expect(document.isDirty).toBe(true); // Edits make the document dirty
	});
});
```

## User Interactions (Messages, Quick Picks, Input Boxes)

Mockly-VSC simulates user interaction dialogs like messages, quick picks, and input boxes. You can spy on these methods to verify they are called, and for `showQuickPick` and `showInputBox` (and message boxes with buttons), you can queue predefined responses using `vscodeSimulator` to test different user interaction flows.

**Key `mockly.window` methods for user interactions:**

- `mockly.window.showInformationMessage(message: string, ...itemsOrOptions: string[] | MessageOptions | MessageItem[]): Promise<string | MessageItem | undefined>`
- `mockly.window.showWarningMessage(message: string, ...itemsOrOptions: string[] | MessageOptions | MessageItem[]): Promise<string | MessageItem | undefined>`
- `mockly.window.showErrorMessage(message: string, ...itemsOrOptions: string[] | MessageOptions | MessageItem[]): Promise<string | MessageItem | undefined>`
- `mockly.window.showQuickPick(items: readonly T[] | Promise<readonly T[]>, options?: QuickPickOptions, token?: mockly.CancellationToken): Promise<T | undefined>`
- `mockly.window.showInputBox(options?: InputBoxOptions, token?: mockly.CancellationToken): Promise<string | undefined>`

**Controlling Responses with `vscodeSimulator`:**

To control the return values of these interactive methods for testing purposes:

- `vscodeSimulator._windowModule._userInteractionService.expectInformationMessageAndReturn(returnValue: string | MessageItem | undefined)`
- `vscodeSimulator._windowModule._userInteractionService.expectWarningMessageAndReturn(returnValue: string | MessageItem | undefined)`
- `vscodeSimulator._windowModule._userInteractionService.expectErrorMessageAndReturn(returnValue: string | MessageItem | undefined)`
- `vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(expectedItemsOrValidator: any[] | ((items: any[]) => boolean), returnValue: any)`
  - You can provide the exact items array or a validator function for `expectedItemsOrValidator`.
- `vscodeSimulator._windowModule._userInteractionService.expectInputBoxAndReturn(returnValue: string | undefined, validator?: (options: InputBoxOptions) => boolean)`
  - Optionally provide a validator for the `InputBoxOptions`.

If no expectation is set using `vscodeSimulator` for a method that awaits user input (like `showQuickPick`, `showInputBox`, or messages with buttons), it will typically resolve to `undefined` by default, simulating a user dismissing the dialog.

**Example:**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('User Interactions Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should allow spying on showInformationMessage and controlling its response', async () => {
		const spy = vi.spyOn(mockly.window, 'showInformationMessage');
		const actionButton = 'Take Action';

		// Simulate user clicking the "Take Action" button
		vscodeSimulator._windowModule._userInteractionService.expectInformationMessageAndReturn(actionButton);

		const result = await mockly.window.showInformationMessage('Test Info Message', actionButton, 'Cancel');

		expect(spy).toHaveBeenCalledWith('Test Info Message', actionButton, 'Cancel');
		expect(result).toBe(actionButton);
	});

	it('should return a predefined value for showQuickPick', async () => {
		const items = ['Option 1', 'Option 2', 'Option 3'];
		const expectedSelection = 'Option 2';
		const quickPickOptions = { placeHolder: 'Choose wisely' };

		// Queue the expected response for showQuickPick
		// The first argument to expectQuickPickAndReturn can be the items array itself for simple cases,
		// or a function that validates the items passed to showQuickPick.
		vscodeSimulator._windowModule._userInteractionService.expectQuickPickAndReturn(
			(actualItems) => expect(actualItems).toEqual(items), // Validate items
			expectedSelection, // Return value
		);

		const selection = await mockly.window.showQuickPick(items, quickPickOptions);
		expect(selection).toBe(expectedSelection);
	});

	it('should return a predefined value for showInputBox, validating options', async () => {
		const expectedInput = 'User typed this text';
		const inputBoxOptions = { prompt: 'Enter your name:', value: 'Default' };

		vscodeSimulator._windowModule._userInteractionService.expectInputBoxAndReturn(
			expectedInput,
			(actualOptions) => { // Validate options passed to showInputBox
				expect(actualOptions.prompt).toBe(inputBoxOptions.prompt);
				expect(actualOptions.value).toBe(inputBoxOptions.value);
				return true;
			},
		);

		const input = await mockly.window.showInputBox(inputBoxOptions);
		expect(input).toBe(expectedInput);
	});

	it('showQuickPick resolves to undefined if no expectation is set (user cancellation)', async () => {
		const items = ['Option A', 'Option B'];
		// No expectation set via vscodeSimulator for this call
		const selection = await mockly.window.showQuickPick(items);
		expect(selection).toBeUndefined();
	});
});
```

## Output Channels

You can create and interact with mock output channels, which are useful for displaying textual information or logs from your extension.

**Key `mockly.window` method:**

- `mockly.window.createOutputChannel(name: string, languageIdOrOptions?: string | { log: true, languageId?: string }): OutputChannel | LogOutputChannel`:
  - Creates or retrieves an existing `OutputChannel` with the given name.
  - If `{ log: true }` is passed in options, it creates a `LogOutputChannel`.

**The `OutputChannel` Mock:**
Provides methods like `name`, `append(value: string)`, `appendLine(value: string)`, `replace(value: string)`, `clear()`, `show(preserveFocusOrColumn?: boolean | ViewColumn)`, `hide()`, `dispose()`.
In Mockly-VSC, output channel operations (like `appendLine`) are typically logged to the `console` by default, prefixed with the channel name.

**The `LogOutputChannel` Mock:**
Extends `OutputChannel` and adds logging methods like `trace()`, `debug()`, `info()`, `warn()`, `error()`. It also has a `logLevel: mockly.LogLevel` property and an `onDidChangeLogLevel: mockly.Event<mockly.LogLevel>` event.

**Example:**

```typescript
import { LogLevel, mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Output Channels Tests', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		await vscodeSimulator.reset();
		// Spy on console.log as Mockly's output channels write there by default
		consoleSpy = vi.spyOn(console, 'log');
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should create a standard output channel and allow appending to it', () => {
		const channelName = 'MyTestOutputChannel';
		const channel = mockly.window.createOutputChannel(channelName);

		expect(channel.name).toBe(channelName);

		channel.appendLine('Hello from the output channel!');
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[Output ${channelName}] Hello from the output channel!`),
		);

		channel.clear();
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`[Output ${channelName}] clear()`));

		channel.dispose();
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`[Output ${channelName}] dispose()`));
	});

	it('should create a LogOutputChannel and allow logging at different levels', () => {
		const logChannelName = 'MyLogChannel';
		// To get LogOutputChannel, pass { log: true }
		const logChannel = mockly.window.createOutputChannel(logChannelName, { log: true });

		expect(logChannel.name).toBe(logChannelName);
		expect(logChannel.logLevel).toBe(LogLevel.Info); // Default LogLevel

		logChannel.info('This is an informational message.');
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[LogOutput ${logChannelName} - INFO] This is an informational message.`),
		);

		logChannel.warn('This is a warning message.');
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[LogOutput ${logChannelName} - WARN] This is a warning message.`),
		);

		// Test changing log level (internally for the mock, or via API if extension can control it)
		const onDidChangeLogLevelSpy = vi.fn();
		const disposable = logChannel.onDidChangeLogLevel(onDidChangeLogLevelSpy);

		// Simulate log level change (e.g., if your extension has a command to do this)
		// For testing, you might need an internal way if not exposed, or test the command.
		// Mockly's LogOutputChannel allows direct setting for test purposes:
		(logChannel as any)._setLogLevel(LogLevel.Debug); // Internal method for test control

		expect(logChannel.logLevel).toBe(LogLevel.Debug);
		expect(onDidChangeLogLevelSpy).toHaveBeenCalledWith(LogLevel.Debug);

		logChannel.debug('This is a debug message (should now be visible).');
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[LogOutput ${logChannelName} - DEBUG] This is a debug message`),
		);

		disposable.dispose();
		logChannel.dispose();
	});
});
```

## Terminals

Mockly-VSC simulates the creation and management of integrated terminals.

**Key `mockly.window` properties and methods for terminals:**

- `mockly.window.terminals: readonly Terminal[]`: An array of active (non-disposed) `Terminal` objects.
- `mockly.window.activeTerminal: Terminal | undefined`: The currently active `Terminal`, or `undefined`.
- `mockly.window.createTerminal(nameOrOptions?: string | TerminalOptions, shellPath?: string, shellArgs?: string[] | string): Terminal`: Creates a new `Terminal`.
  - `TerminalOptions` can include `name`, `shellPath`, `shellArgs`, `cwd`, `env`, `message`, etc.

**The `Terminal` Mock:**
Provides properties like `name`, `processId` (a mock ID), `creationOptions`, `exitStatus`, and methods like `sendText(text: string, addNewLine?: boolean)`, `show(preserveFocus?: boolean)`, `hide()`, `dispose()`.
Terminal interactions (like `sendText`) are typically logged to the `console`.

**Example:**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Terminals Tests', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		await vscodeSimulator.reset();
		consoleSpy = vi.spyOn(console, 'log');
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should create a terminal, make it active, and allow sending text', () => {
		expect(mockly.window.terminals.length).toBe(0);
		expect(mockly.window.activeTerminal).toBeUndefined();

		const terminalName = 'TestTerminal1';
		const terminal = mockly.window.createTerminal(terminalName);

		expect(terminal.name).toBe(terminalName);
		expect(terminal.processId).toBeDefined(); // Mockly assigns a process ID
		expect(mockly.window.terminals.length).toBe(1);
		expect(mockly.window.terminals[0]).toBe(terminal);
		expect(mockly.window.activeTerminal).toBe(terminal); // Newly created terminal becomes active

		terminal.sendText('echo "Hello from mock terminal!"');
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[Terminal ${terminalName}] sendText: echo "Hello from mock terminal!"`),
		);

		terminal.sendText('exit', false); // Send 'exit' without adding a new line
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[Terminal ${terminalName}] sendText: exit`),
		);

		terminal.dispose();
		expect(mockly.window.terminals.length).toBe(0);
		// Active terminal is cleared if the disposed terminal was active
		expect(mockly.window.activeTerminal).toBeUndefined();
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`[Terminal ${terminalName}] dispose()`));
	});

	it('should create a terminal with options', () => {
		const options = {
			name: 'OptionsTerm',
			shellPath: '/bin/custom_shell',
			shellArgs: ['--login'],
			message: 'Welcome to OptionsTerm!',
		};
		const terminal = mockly.window.createTerminal(options);
		expect(terminal.name).toBe(options.name);
		expect(terminal.creationOptions.shellPath).toBe(options.shellPath);
		expect(terminal.creationOptions.message).toBe(options.message);
		// The welcome message is typically shown by the terminal itself. Mockly might log this.
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[Terminal ${options.name}] created with message: ${options.message}`),
		);
	});
});
```

## Status Bar

`mockly.window.createStatusBarItem(idOrAlignment?: string | StatusBarAlignment, alignmentOrPriority?: StatusBarAlignment | number, priority?: number): StatusBarItem` creates a mock `StatusBarItem`.

**The `StatusBarItem` Mock:**
Provides properties like `id`, `alignment: StatusBarAlignment`, `priority: number`, `text: string`, `tooltip: string | MarkdownString`, `color`, `backgroundColor`, `command: string | Command`, `name`, `accessibilityInformation`, and methods `show()`, `hide()`, `dispose()`.
Interactions (like `show`, `hide`, setting text) are typically logged to the `console`.

**Example:**

```typescript
import { mockly, StatusBarAlignment, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Status Bar Item Tests', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		await vscodeSimulator.reset();
		consoleSpy = vi.spyOn(console, 'log');
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should create a status bar item, allow setting properties, and simulate show/hide/dispose', () => {
		const statusBarItem = mockly.window.createStatusBarItem(StatusBarAlignment.Left, 100);
		// An ID is auto-generated if not provided.
		expect(statusBarItem.id).toBeDefined();
		expect(statusBarItem.alignment).toBe(StatusBarAlignment.Left);
		expect(statusBarItem.priority).toBe(100);

		statusBarItem.text = '$(sync~spin) Syncing...';
		statusBarItem.tooltip = 'Project synchronization is in progress.';
		statusBarItem.command = 'myExtension.runSync';

		expect(statusBarItem.text).toBe('$(sync~spin) Syncing...');
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`StatusBarItem ${statusBarItem.id} text set to: $(sync~spin) Syncing...`),
		);

		statusBarItem.show();
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`StatusBarItem ${statusBarItem.id}.show()`),
		);

		statusBarItem.hide();
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`StatusBarItem ${statusBarItem.id}.hide()`),
		);

		statusBarItem.dispose();
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`StatusBarItem ${statusBarItem.id}.dispose()`),
		);
	});

	it('should create a status bar item with a specific ID', () => {
		const itemId = 'myExtension.customStatus';
		const statusBarItemWithId = mockly.window.createStatusBarItem(itemId, StatusBarAlignment.Right, -10);
		expect(statusBarItemWithId.id).toBe(itemId);
		expect(statusBarItemWithId.alignment).toBe(StatusBarAlignment.Right);
		expect(statusBarItemWithId.priority).toBe(-10);
	});
});
```

## Tree Data Providers

`mockly.window.registerTreeDataProvider<T>(viewId: string, treeDataProvider: TreeDataProvider<T>): Disposable` simulates registering a `TreeDataProvider` for a custom tree view.

The mock implementation primarily logs the registration and disposal of the tree data provider. Testing the tree view itself usually involves:

1. Instantiating your `TreeDataProvider` implementation directly.
2. Calling its methods (`getChildren`, `getTreeItem`, `resolveTreeItem` if applicable) with mock data or state.
3. Asserting the results returned by these methods.
4. Testing that your extension correctly registers the provider using `mockly.window.registerTreeDataProvider` and handles the returned `Disposable`.

**Example:**

```typescript
import { EventEmitter, mockly, TreeItem, TreeItemCollapsibleState, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// A simple mock TreeDataProvider implementation for testing
class MyMockTreeDataProvider implements mockly.TreeDataProvider<string> {
	private _onDidChangeTreeData: EventEmitter<string | undefined | null | void> = new EventEmitter();
	readonly onDidChangeTreeData: mockly.Event<string | undefined | null | void> =
		this._onDidChangeTreeData.event;

	data: string[] = ['Item 1', 'Item 2'];

	getTreeItem(element: string): TreeItem | Thenable<TreeItem> {
		const item = new TreeItem(element, TreeItemCollapsibleState.None);
		item.id = element.replace(' ', '').toLowerCase();
		return item;
	}

	getChildren(element?: string): mockly.ProviderResult<string[]> {
		if (element) {
			// For this simple example, no nested children
			return [];
		}
		return this.data;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

describe('Tree Data Provider Registration Tests', () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(async () => {
		await vscodeSimulator.reset();
		consoleSpy = vi.spyOn(console, 'log');
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it('should register and dispose a tree data provider, logging the actions', () => {
		const viewId = 'myExtensionTestView';
		const myProvider = new MyMockTreeDataProvider();

		const disposable = mockly.window.registerTreeDataProvider(viewId, myProvider);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[UI MOCK] registerTreeDataProvider called for view: ${viewId}`),
		);
		// You can also check internal state of the simulator if needed for more advanced tests
		// e.g., vscodeSimulator._windowModule._uiControllerService.isTreeDataProviderRegistered(viewId)

		disposable.dispose();
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`[UI MOCK] Disposing TreeDataProvider for view: ${viewId}`),
		);
	});

	it('TreeDataProvider methods can be tested directly', async () => {
		const provider = new MyMockTreeDataProvider();
		provider.data = ['Alpha', 'Beta'];

		const children = await provider.getChildren(); // Get root children
		expect(children).toEqual(['Alpha', 'Beta']);

		const treeItemAlpha = await provider.getTreeItem('Alpha') as TreeItem;
		expect(treeItemAlpha.label).toBe('Alpha');
		expect(treeItemAlpha.collapsibleState).toBe(TreeItemCollapsibleState.None);
	});
});
```

## Window Events

Mockly-VSC simulates various window-related events. You can subscribe to these to test how your extension reacts to changes in the window state. Each event handler returns a `mockly.Disposable`.

**Key Window Events:**

- `mockly.window.onDidChangeActiveTextEditor`: Fired when the active text editor changes. Event argument: `TextEditor | undefined`.
- `mockly.window.onDidChangeVisibleTextEditors`: Fired when the set of visible text editors changes. Event argument: `readonly TextEditor[]`.
- `mockly.window.onDidChangeTextEditorSelection`: Fired when the text editor selection changes. Event argument: `TextEditorSelectionChangeEvent`.
- `mockly.window.onDidChangeTextEditorVisibleRanges`: Fired when the visible ranges of a text editor change. Event argument: `TextEditorVisibleRangesChangeEvent`.
- `mockly.window.onDidChangeTextEditorOptions`: Fired when the options of a text editor change. Event argument: `TextEditorOptionsChangeEvent`.
- `mockly.window.onDidChangeTextEditorViewColumn`: Fired when the view column of a text editor changes. Event argument: `TextEditorViewColumnChangeEvent`.
- `mockly.window.onDidChangeWindowState`: Fired when the focus state of the VSCode window changes. Event argument: `WindowState`.
- `mockly.window.onDidOpenTerminal`: Fired when a terminal is opened. Event argument: `Terminal`.
- `mockly.window.onDidCloseTerminal`: Fired when a terminal is closed. Event argument: `Terminal`.
- `mockly.window.onDidChangeActiveTerminal`: Fired when the active terminal changes. Event argument: `Terminal | undefined`.

These events are fired automatically by Mockly-VSC when corresponding actions occur (e.g., showing a text document, creating a terminal, changing selection).

**Example:**

```typescript
import { mockly, Position, Selection, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Window Events Tests', () => {
	let disposables: mockly.Disposable[] = [];

	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	afterEach(() => {
		disposables.forEach(d => d.dispose());
		disposables = [];
	});

	it('should fire onDidChangeActiveTextEditor when a document is shown or active editor changes', async () => {
		const onActiveEditorChangeSpy = vi.fn();
		disposables.push(mockly.window.onDidChangeActiveTextEditor(onActiveEditorChangeSpy));

		const fileUri1 = mockly.Uri.file('/test/activeChangeDoc1.txt');
		await mockly.workspace.fs.writeFile(fileUri1, Buffer.from('content1'));

		// Showing a document makes its editor active
		const editor1 = await mockly.window.showTextDocument(fileUri1);
		expect(onActiveEditorChangeSpy).toHaveBeenCalledTimes(1); // Called for editor1 becoming active
		expect(onActiveEditorChangeSpy).toHaveBeenLastCalledWith(editor1);

		const fileUri2 = mockly.Uri.file('/test/activeChangeDoc2.txt');
		await mockly.workspace.fs.writeFile(fileUri2, Buffer.from('content2'));
		const editor2 = await mockly.window.showTextDocument(fileUri2); // editor2 becomes active

		expect(onActiveEditorChangeSpy).toHaveBeenCalledTimes(2); // Called again for editor2
		expect(onActiveEditorChangeSpy).toHaveBeenLastCalledWith(editor2);

		// Simulate making no editor active (e.g., by closing the last one or through test control)
		// For test control, you can use the internal service:
		vscodeSimulator._windowModule._textEditorService.setActiveTextEditor(undefined);
		expect(onActiveEditorChangeSpy).toHaveBeenCalledTimes(3);
		expect(onActiveEditorChangeSpy).toHaveBeenLastCalledWith(undefined);
	});

	it('should fire onDidOpenTerminal and onDidChangeActiveTerminal when a terminal is created', () => {
		const onOpenTerminalSpy = vi.fn();
		const onActiveTerminalChangeSpy = vi.fn();
		disposables.push(mockly.window.onDidOpenTerminal(onOpenTerminalSpy));
		disposables.push(mockly.window.onDidChangeActiveTerminal(onActiveTerminalChangeSpy));

		const terminal = mockly.window.createTerminal('EventDrivenTerm');

		expect(onOpenTerminalSpy).toHaveBeenCalledTimes(1);
		expect(onOpenTerminalSpy).toHaveBeenCalledWith(terminal);

		expect(onActiveTerminalChangeSpy).toHaveBeenCalledTimes(1); // Assuming no active terminal before
		expect(onActiveTerminalChangeSpy).toHaveBeenCalledWith(terminal);
	});

	it('should fire onDidChangeTextEditorSelection when editor selection changes', async () => {
		const onSelectionChangeSpy = vi.fn();
		const fileUri = mockly.Uri.file('/test/selectionChange.txt');
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from('Select me!'));
		const editor = await mockly.window.showTextDocument(fileUri);

		disposables.push(mockly.window.onDidChangeTextEditorSelection(onSelectionChangeSpy));

		// Change selection
		editor.selection = new mockly.Selection(new Position(0, 0), new Position(0, 6)); // Select "Select"

		expect(onSelectionChangeSpy).toHaveBeenCalledTimes(1);
		const eventArg = onSelectionChangeSpy.mock.calls[0][0]; // TextEditorSelectionChangeEvent
		expect(eventArg.textEditor).toBe(editor);
		expect(eventArg.selections.length).toBe(1);
		expect(eventArg.selections[0].active.isEqual(new Position(0, 6))).toBe(true);
		expect(eventArg.kind).toBeDefined(); // e.g., TextEditorSelectionChangeKind.Command, .Keyboard, .Mouse (mock might simplify this)
	});
});
```
