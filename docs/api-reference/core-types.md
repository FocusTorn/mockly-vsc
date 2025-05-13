# API Reference: Core VSCode Types

Mockly-VSC provides mock implementations and re-exports for many of the core types, classes, and enums found in the `vscode` API namespace. These are generally accessible directly from the `mockly` object (e.g., `new mockly.Position(...)`, `mockly.Uri.file(...)`, `mockly.FileType.File`).

Understanding these core types is fundamental, as they are used throughout the `mockly` API, just as they are in the real VSCode API.

## `mockly.Uri`

Mockly-VSC uses the `vscode-uri` library internally for URI manipulation and exposes its `URI` class and static methods directly via `mockly.Uri`. This ensures compatibility and correct handling of URI schemes, paths, and components.

**Key `mockly.Uri` static methods:**

- `mockly.Uri.file(path: string): Uri`: Creates a new URI from a file system path.
- `mockly.Uri.parse(value: string, strict?: boolean): Uri`: Creates a new URI from a URI string.
- `mockly.Uri.joinPath(base: Uri, ...pathSegments: string[]): Uri`: Joins path segments to a base URI.
- `mockly.Uri.isUri(thing: any): thing is Uri`: Checks if a value is a Uri instance.

**`Uri` instance properties:**

- `scheme: string` (e.g., 'file', 'untitled')
- `authority: string`
- `path: string`
- `query: string`
- `fragment: string`
- `fsPath: string` (for 'file' scheme URIs, gives the platform-specific file system path)
- `with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri`
- `toString(skipEncoding?: boolean): string`

**Example:**

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, expect, it } from 'vitest';

describe('Uri Type Tests', () => {
	it('should create file URIs correctly', () => {
		const path = '/path/to/your/file.txt'; // Use POSIX paths for consistency in tests
		const fileUri = mockly.Uri.file(path);
		expect(fileUri.scheme).toBe('file');
		// fsPath behavior can be platform-specific regarding normalization,
		// but for POSIX input, it should generally match.
		expect(fileUri.fsPath).toBe(path);
		expect(fileUri.path).toBe(path);
	});

	it('should parse URI strings', () => {
		const parsedUri = mockly.Uri.parse('untitled:Untitled-1?query=abc#frag');
		expect(parsedUri.scheme).toBe('untitled');
		expect(parsedUri.path).toBe('Untitled-1');
		expect(parsedUri.query).toBe('query=abc');
		expect(parsedUri.fragment).toBe('frag');
	});

	it('should join paths to a base URI', () => {
		const baseUri = mockly.Uri.file('/base/project');
		const joinedUri = mockly.Uri.joinPath(baseUri, 'src', 'component.ts');
		// For file URIs, joinPath typically normalizes to POSIX paths internally for the 'path' component.
		expect(joinedUri.path).toBe('/base/project/src/component.ts');
	});
});
~~~

**Note on Path Manipulation:**
While `mockly.Uri` is used for creating and managing `Uri` objects (which are expected by many `mockly` API methods), for general string-based path manipulation (like joining path segments as strings, getting basenames, normalizing string paths, etc.) in your test helpers, prefer using `vscodeSimulator.path` or `mockly.node.path`. See the [Path Manipulation section in Test Control](/test-control#path-manipulation-mockly-node-path-and-vscodesimulator-path) for more details.

## Positional Types (`Position`, `Range`, `Selection`, `Location`)

These are fundamental types for representing locations and areas within text documents.

- **`mockly.Position(line: number, character: number)`**: Represents a line and character position in a document.
  - Key methods: `isBefore(other: Position)`, `isEqual(other: Position)`, `translate(lineDelta?: number, characterDelta?: number)`, `with(line?: number, character?: number)`.
- **`mockly.Range(start: Position, end: Position)` or `mockly.Range(startLine: number, startCharacter: number, endLine: number, endCharacter: number)`**: Represents a continuous range of characters between a start and end position.
  - Key properties: `start: Position`, `end: Position`, `isEmpty: boolean`, `isSingleLine: boolean`.
  - Key methods: `contains(positionOrRange: Position | Range)`, `isEqual(other: Range)`, `intersection(other: Range)`, `union(other: Range)`, `with(start?: Position, end?: Position)`.
- **`mockly.Selection(anchor: Position, active: Position)` or `mockly.Selection(anchorLine: number, anchorChar: number, activeLine: number, activeChar: number)`**: A `Range` with an `anchor` and an `active` (cursor) position. The `active` position determines the direction of the selection.
  - Inherits from `Range`.
  - Key properties: `anchor: Position`, `active: Position`, `isReversed: boolean` (true if `active` is before `anchor`).
- **`mockly.Location(uri: Uri, rangeOrPosition: Range | Position)`**: Represents a location in a specific URI, identified by a range or a position.

**Example:**

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, expect, it } from 'vitest';

describe('Positional Types Tests', () => {
	it('should create and compare Positions', () => {
		const pos1 = new mockly.Position(0, 5); // Line 0, Character 5
		const pos2 = new mockly.Position(1, 0); // Line 1, Character 0
		expect(pos1.isBefore(pos2)).toBe(true);
		expect(pos1.isEqual(new mockly.Position(0, 5))).toBe(true);
	});

	it('should create Ranges and check properties', () => {
		const startPos = new mockly.Position(1, 2);
		const endPos = new mockly.Position(1, 10);
		const range = new mockly.Range(startPos, endPos);

		expect(range.isEmpty).toBe(false);
		expect(range.isSingleLine).toBe(true);
		expect(range.contains(new mockly.Position(1, 5))).toBe(true);
		expect(range.contains(new mockly.Position(1, 10))).toBe(false); // End position is exclusive for contains
	});

	it('should create Selections and check direction', () => {
		const anchor = new mockly.Position(2, 10);
		const active = new mockly.Position(2, 5); // Cursor is before the anchor
		const selection = new mockly.Selection(anchor, active);

		expect(selection.isReversed).toBe(true);
		expect(selection.anchor.isEqual(anchor)).toBe(true);
		expect(selection.active.isEqual(active)).toBe(true);
		// The Range part of a Selection is always sorted (start <= end)
		expect(selection.start.isEqual(active)).toBe(true);
		expect(selection.end.isEqual(anchor)).toBe(true);
	});

	it('should create Locations', () => {
		const uri = mockly.Uri.file('/test.txt');
		const range = new mockly.Range(0, 0, 0, 10);
		const location = new mockly.Location(uri, range);
		expect(location.uri.toString()).toBe(uri.toString());
		expect(location.range.isEqual(range)).toBe(true);
	});
});
~~~

## Eventing Types (`Disposable`, `EventEmitter`)

These are crucial for managing resources and handling events.

- **`mockly.Disposable(callOnDisposeFunction: () => any)`**: Creates an object that can be "disposed" to free up resources or unregister listeners. The provided function is called when `dispose()` is invoked.
  - Static method `mockly.Disposable.from(...disposables: { dispose(): any }[]): Disposable`: Creates a new disposable that groups other disposables. Calling `dispose()` on the result will dispose all of them.
- **`new mockly.EventEmitter<T>()`**: A helper to manage and fire events.
  - `event: mockly.Event<T>`: The property to subscribe to. It's a function that takes a listener `(e: T) => any` and returns a `Disposable`.
  - `fire(data: T): void`: Emits an event to all subscribers.
  - `dispose(): void`: Disposes the emitter, removing all listeners.

**Example:**

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, expect, it, vi } from 'vitest';

describe('Eventing Types Tests', () => {
	it('should handle Disposables correctly', () => {
		const disposeFn = vi.fn();
		const disposable1 = new mockly.Disposable(disposeFn);

		disposable1.dispose();
		expect(disposeFn).toHaveBeenCalledTimes(1);

		// Test Disposable.from
		const disposeFn2 = vi.fn();
		const disposable2 = new mockly.Disposable(disposeFn2);
		const groupedDisposable = mockly.Disposable.from(disposable1, disposable2); // disposable1 is already disposed

		groupedDisposable.dispose();
		expect(disposeFn).toHaveBeenCalledTimes(1); // Not called again
		expect(disposeFn2).toHaveBeenCalledTimes(1);
	});

	it('should work with EventEmitter for event subscription and firing', () => {
		const emitter = new mockly.EventEmitter<string>();
		const listener1 = vi.fn();
		const listener2 = vi.fn();

		const subscription1 = emitter.event(listener1); // Subscribe listener1
		const subscription2 = emitter.event(listener2); // Subscribe listener2

		emitter.fire('test-event-payload');
		expect(listener1).toHaveBeenCalledWith('test-event-payload');
		expect(listener2).toHaveBeenCalledWith('test-event-payload');

		subscription1.dispose(); // Unsubscribe listener1
		emitter.fire('another-payload');
		expect(listener1).toHaveBeenCalledTimes(1); // listener1 not called again
		expect(listener2).toHaveBeenCalledTimes(2);
		expect(listener2).toHaveBeenLastCalledWith('another-payload');

		emitter.dispose(); // Dispose emitter, all remaining listeners removed
		emitter.fire('final-payload');
		expect(listener2).toHaveBeenCalledTimes(2); // listener2 not called again
	});
});
~~~

## Cancellation (`CancellationTokenSource`, `CancellationToken`)

Used for signaling that an operation should be cancelled.

- **`new mockly.CancellationTokenSource()`**: Creates a source for a `CancellationToken`.
  - `token: mockly.CancellationToken`: The actual token to pass to operations that support cancellation.
  - `cancel(): void`: Signals cancellation to the associated token.
  - `dispose(): void`: Disposes the source.
- **`mockly.CancellationToken`**: The token itself.
  - `isCancellationRequested: boolean`: True if cancellation has been signaled.
  - `onCancellationRequested: mockly.Event<any>`: An event that fires when cancellation is requested.

**Example:**

~~~typescript
import { mockly } from 'mockly-vsc';
import { describe, expect, it, vi } from 'vitest';

describe('Cancellation Token Tests', () => {
	it('should simulate CancellationTokenSource and CancellationToken', (ctx) => {
		// Vitest uses an object for the test context, pass it to onCancellationRequested if needed for async tests.
		// For simple synchronous spy, it's not strictly necessary.
		return new Promise<void>(resolve => {
			const cts = new mockly.CancellationTokenSource();
			const token = cts.token;
			const onCancelSpy = vi.fn(() => resolve()); // Resolve promise when spy is called

			expect(token.isCancellationRequested).toBe(false);

			const disposable = token.onCancellationRequested(onCancelSpy);

			cts.cancel(); // Signal cancellation

			expect(token.isCancellationRequested).toBe(true);
			expect(onCancelSpy).toHaveBeenCalledTimes(1);

			disposable.dispose();
			cts.dispose();
		});
	});
});
~~~

## Edit Types (`TextEdit`, `WorkspaceEdit`)

Used for describing text changes and file operations.

- **`mockly.TextEdit`**: Represents a textual change.
  - Static factory methods:
    - `mockly.TextEdit.replace(range: Range, newText: string): TextEdit`
    - `mockly.TextEdit.insert(position: Position, newText: string): TextEdit`
    - `mockly.TextEdit.delete(range: Range): TextEdit`
    - `mockly.TextEdit.setEndOfLine(eol: mockly.EndOfLine): TextEdit`
  - Properties: `range: Range`, `newText: string`, `newEol?: mockly.EndOfLine`.
- **`new mockly.WorkspaceEdit()`**: Represents a collection of edits to documents and files.
  - Text edit methods: `replace(uri: Uri, range: Range, newText: string)`, `insert(uri: Uri, position: Position, newText: string)`, `delete(uri: Uri, range: Range)`.
  - File operation methods: `createFile(uri: Uri, options?: { overwrite?: boolean, ignoreIfExists?: boolean, content?: Uint8Array })`, `deleteFile(uri: Uri, options?: { recursive?: boolean, ignoreIfNotExists?: boolean })`, `renameFile(oldUri: Uri, newUri: Uri, options?: { overwrite?: boolean, ignoreIfExists?: boolean })`.
  - Other methods: `set(uri: Uri, edits: TextEdit[])`, `get(uri: Uri): TextEdit[]`, `size: number`, `entries(): [Uri, TextEdit[]][]`.

**Example:**

~~~typescript
import { mockly, Position, Range } from 'mockly-vsc';
import { describe, expect, it } from 'vitest';

describe('Edit Types Tests', () => {
	it('should create TextEdits using static factory methods', () => {
		const range = new mockly.Range(0, 0, 0, 5); // Replace first 5 chars on line 0
		const textEdit = mockly.TextEdit.replace(range, 'new_value');

		expect(textEdit.newText).toBe('new_value');
		expect(textEdit.range.isEqual(range)).toBe(true);

		const insertEdit = mockly.TextEdit.insert(new Position(1, 0), 'insert this');
		expect(insertEdit.newText).toBe('insert this');
		expect(insertEdit.range.isEmpty).toBe(true); // Insert range is empty
		expect(insertEdit.range.start.isEqual(new Position(1, 0))).toBe(true);
	});

	it('should allow adding various operations to a WorkspaceEdit', () => {
		const wsEdit = new mockly.WorkspaceEdit();
		const file1Uri = mockly.Uri.file('/test1.txt');
		const file2Uri = mockly.Uri.file('/test2.txt');
		const newFileUri = mockly.Uri.file('/newFile.md');

		// Add a text edit
		wsEdit.insert(file1Uri, new mockly.Position(0, 0), 'Initial text. ');
		// Add another text edit to the same file
		wsEdit.replace(file1Uri, new mockly.Range(0, 8, 0, 12), 'content'); // "Initial content. "

		// Add a file creation
		wsEdit.createFile(newFileUri, { content: Buffer.from('# New Markdown') });

		// Add a file deletion
		wsEdit.deleteFile(file2Uri);

		expect(wsEdit.size).toBe(3); // Number of URIs affected (file1Uri, newFileUri, file2Uri)

		const file1Edits = wsEdit.get(file1Uri);
		expect(file1Edits.length).toBe(2); // Two text edits for file1Uri
		expect(file1Edits[0].newText).toBe('Initial text. ');
		expect(file1Edits[1].newText).toBe('content');

		const newFileEdits = wsEdit.get(newFileUri); // For createFile, this might be an empty array or specific internal marker
		// The actual file operation is stored differently, check entries or apply and verify fs.
		// For Mockly, `get` on a `createFile` URI might return a special edit or an empty array.
		// The important part is that `applyEdit` handles it.
	});
});
~~~

## Errors and Enums

Mockly-VSC exposes core error classes like `FileSystemError` and numerous enums used throughout the API.

- **`mockly.FileSystemError`**: Represents file system-related errors.
  - Static factory methods: `mockly.FileSystemError.FileNotFound(uri?)`, `mockly.FileSystemError.FileExists(uri?)`, `mockly.FileSystemError.FileNotADirectory(uri?)`, `mockly.FileSystemError.FileIsADirectory(uri?)`, `mockly.FileSystemError.NoPermissions(uri?)`, `mockly.FileSystemError.Unavailable(uri?)`.
  - Properties: `name: string` ("FileSystemError"), `code: string` (e.g., "FileNotFound"), `message: string`.

- **Common Enums (accessible via `mockly.<EnumName>`):**
  - `mockly.FileType`: `File`, `Directory`, `SymbolicLink`, `Unknown`
  - `mockly.LogLevel`: `Off`, `Trace`, `Debug`, `Info`, `Warning`, `Error`
  - `mockly.ViewColumn`: `Active`, `Beside`, `One`, `Two`, ... `Nine`
  - `mockly.EndOfLine`: `LF` (1), `CRLF` (2)
  - `mockly.TextEditorRevealType`: `Default`, `InCenter`, `InCenterIfOutsideViewport`, `AtTop`
  - `mockly.StatusBarAlignment`: `Left`, `Right`
  - `mockly.ExtensionKind`: `UI`, `Workspace`
  - `mockly.UIKind`: `Desktop`, `Web`
  - `mockly.QuickPickItemKind`: `Default` (0), `Separator` (-1)
  - `mockly.ConfigurationTarget`: `Global`, `Workspace`, `WorkspaceFolder`
  - `mockly.DiagnosticSeverity`: `Error`, `Warning`, `Information`, `Hint`
  - ...and many more. For a comprehensive list, you can inspect the `vscEnums.ts` file in the Mockly-VSC source code or rely on TypeScript autocompletion.

**Example:**

~~~typescript
import { FileSystemError, FileType, LogLevel, mockly } from 'mockly-vsc'; // Import specific enums/errors
import { describe, expect, it } from 'vitest';

describe('Errors and Enums Tests', () => {
	it('should provide FileType enum values', () => {
		expect(mockly.FileType.File).toBe(1);
		expect(FileType.Directory).toBe(2); // Can also import directly
		expect(mockly.FileType.Unknown).toBe(0);
	});

	it('should allow creation of FileSystemErrors', () => {
		const uri = mockly.Uri.file('/nonexistent/file.txt');
		const error = mockly.FileSystemError.FileNotFound(uri);

		expect(error).toBeInstanceOf(Error); // It's an Error subclass
		expect(error.name).toBe('FileSystemError');
		expect(error.code).toBe('FileNotFound');
		expect(error.message).toContain('FileNotFound');
		// expect(error.message).toContain(uri.toString()); // Message often includes URI
	});

	it('should provide LogLevel enum values', () => {
		expect(mockly.LogLevel.Info).toBe(3); // As per VSCode's definition
		expect(LogLevel.Debug).toBe(2);
	});

	it('should provide ViewColumn enum values', () => {
		expect(mockly.ViewColumn.Active).toBe(-1);
		expect(mockly.ViewColumn.Beside).toBe(-2);
		expect(mockly.ViewColumn.One).toBe(1);
	});
});
~~~

This covers many of the essential core types. For types not explicitly detailed here, they generally follow the structure and behavior of their counterparts in the official `vscode` API, adapted for a mock environment.