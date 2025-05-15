# API Reference: mockly.workspace

The `mockly.workspace` object simulates the `vscode.workspace` API, providing functionalities related to workspace folders, text documents, file system operations, and workspace-related events.

## Workspace Folders

You can manage and query mock workspace folders. These represent the root folders opened in your mock VSCode environment.

**Key `mockly.workspace` properties and methods for workspace folders:**

- `mockly.workspace.workspaceFolders`: An array of `WorkspaceFolder` objects, or `undefined` if no folder is open. Each `WorkspaceFolder` object has `uri` (a `mockly.Uri`), `name` (string), and `index` (number) properties.
- `mockly.workspace.getWorkspaceFolder(uri: mockly.Uri): WorkspaceFolder | undefined`: Returns the `WorkspaceFolder` that contains the given URI.
- `mockly.workspace.name: string | undefined`: The name of the workspace. This is typically derived from the first workspace folder if not explicitly set for a multi-root workspace.
- `mockly.workspace.workspaceFile: mockly.Uri | undefined`: The URI of the `.code-workspace` file, if a multi-root workspace configuration is active. Mockly-VSC primarily focuses on folder-based workspaces, but this property exists for API completeness.

**Manipulating Workspace Folders (for Test Setup):**

To add, remove, or set workspace folders for your tests, you'll typically use the internal `_workspaceStateService` exposed via `vscodeSimulator`. This is because direct manipulation of workspace folders is usually a user action or project setup step, not a direct API call an extension makes to _change_ the folders (extensions _react_ to folder changes).

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Workspace Folders Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should allow adding and retrieving workspace folders', async () => {
		const folderUri1 = mockly.Uri.file('/project/alpha');
		const folderUri2 = mockly.Uri.file('/project/beta');

		// Important: Folders must exist in the mock file system before being added as workspace folders.
		await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri1);
		await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri2);

		// Use the internal service (via vscodeSimulator) to add folders
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(
			folderUri1,
			'AlphaProject',
		);
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(folderUri2); // Name defaults to basename 'beta'

		expect(mockly.workspace.workspaceFolders?.length).toBe(2);
		expect(mockly.workspace.workspaceFolders?.[0].name).toBe('AlphaProject');
		expect(mockly.workspace.workspaceFolders?.[1].name).toBe('beta');

		const fileInAlpha = mockly.Uri.joinPath(folderUri1, 'file.txt');
		const retrievedFolder = mockly.workspace.getWorkspaceFolder(fileInAlpha);
		expect(retrievedFolder?.uri.toString()).toBe(folderUri1.toString());
		expect(retrievedFolder?.name).toBe('AlphaProject');
	});

	it('should allow setting workspace folders directly, replacing existing ones', async () => {
		const folderUri = mockly.Uri.file('/project/main');
		await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri);

		// Initially add one folder
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(
			mockly.Uri.file('/old/project'),
		);

		// Set new workspace folders (this replaces any existing ones)
		await vscodeSimulator._workspaceModule._workspaceStateService.setWorkspaceFolders([{
			uri: folderUri,
			name: 'MainProject',
			index: 0,
		}]);

		expect(mockly.workspace.workspaceFolders?.length).toBe(1);
		expect(mockly.workspace.workspaceFolders?.[0].name).toBe('MainProject');
		expect(mockly.workspace.name).toBe('MainProject'); // Workspace name often reflects the single/first folder
	});
});
```

## Text Documents

Mockly-VSC simulates the lifecycle of text documents, allowing you to open, read, and manage them.

**Key `mockly.workspace` properties and methods for text documents:**

- `mockly.workspace.textDocuments`: An array of currently open `TextDocument` objects (documents that have not been closed).
- `mockly.workspace.openTextDocument(uriOrOptions: mockly.Uri | string | { language?: string; content?: string }): Promise<TextDocument>`:
  - If a `mockly.Uri` or a file path string is provided, it attempts to read the file from the mock file system (`mockly.workspace.fs`).
  - If an options object `{ language?: string; content?: string }` is provided, it creates an untitled document with the specified language and content.
- `mockly.workspace.saveAll(includeUntitled?: boolean): Promise<boolean>`: Simulates saving all dirty documents. Returns `true` if successful.

**The `TextDocument` Mock:**

The `TextDocument` object provided by `mockly` has properties and methods like:

- `uri: mockly.Uri`
- `fileName: string` (the `fsPath` of the URI)
- `languageId: string`
- `version: number` (increments on change)
- `isDirty: boolean`
- `isClosed: boolean`
- `isUntitled: boolean`
- `lineCount: number`
- `getText(range?: mockly.Range): string`
- `lineAt(lineOrPosition: number | mockly.Position): TextLine`
- `offsetAt(position: mockly.Position): number`
- `positionAt(offset: number): mockly.Position`
- `validateRange(range: mockly.Range): mockly.Range`
- `validatePosition(position: mockly.Position): mockly.Position`

**Example:**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Text Documents Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should open and manage text documents from the mock file system', async () => {
		const fileUri = mockly.Uri.file('/test/doc.txt');
		const fileContent = 'Hello Mockly from file!';

		// 1. Create the file in the mock file system first
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from(fileContent));

		// 2. Open the document
		const document = await mockly.workspace.openTextDocument(fileUri);

		expect(document.uri.toString()).toBe(fileUri.toString());
		expect(document.getText()).toBe(fileContent);
		expect(document.languageId).toBe('plaintext'); // Inferred from .txt or default
		expect(document.isDirty).toBe(false);
		expect(document.isUntitled).toBe(false);
		expect(mockly.workspace.textDocuments.length).toBe(1);
		expect(mockly.workspace.textDocuments[0]).toBe(document);

		// Simulate closing the document (using an internal method for test control, as extensions don't typically "close" docs this way)
		// Extensions usually react to onDidCloseTextDocument.
		// If you need to test behavior after a document is closed, you might trigger this internally.
		await vscodeSimulator._workspaceModule._textDocumentService.closeTextDocument(fileUri);
		expect(document.isClosed).toBe(true);
		// mockly.workspace.textDocuments only returns non-closed documents
		expect(mockly.workspace.textDocuments.length).toBe(0);
	});

	it('should create untitled documents with content and language', async () => {
		const document = await mockly.workspace.openTextDocument({
			content: '## Untitled Markdown\nThis is a test.',
			language: 'markdown',
		});
		expect(document.isUntitled).toBe(true);
		expect(document.uri.scheme).toBe('untitled');
		expect(document.getText()).toBe('## Untitled Markdown\nThis is a test.');
		expect(document.languageId).toBe('markdown');
		expect(mockly.workspace.textDocuments.length).toBe(1);
	});
});
```

## File System (mockly.workspace.fs)

Mockly-VSC provides a complete in-memory file system accessible via `mockly.workspace.fs`. This simulates the `vscode.workspace.fs` API, allowing you to perform file operations without affecting your actual disk. This is crucial for testing file-related functionality in isolation.

**Key `mockly.workspace.fs` methods:**

- `readFile(uri: mockly.Uri): Promise<Uint8Array>`
- `writeFile(uri: mockly.Uri, content: Uint8Array, options?: { create?: boolean; overwrite?: boolean }): Promise<void>`
- `delete(uri: mockly.Uri, options?: { recursive?: boolean; useTrash?: boolean }): Promise<void>`
- `createDirectory(uri: mockly.Uri): Promise<void>`
- `readDirectory(uri: mockly.Uri): Promise<[string, mockly.FileType][]>`
- `stat(uri: mockly.Uri): Promise<mockly.FileStat>` (returns object with `type`, `ctime`, `mtime`, `size`)
- `rename(oldUri: mockly.Uri, newUri: mockly.Uri, options?: { overwrite?: boolean }): Promise<void>`
- `copy(sourceUri: mockly.Uri, targetUri: mockly.Uri, options?: { overwrite?: boolean }): Promise<void>`

The `FileType` enum is available as `mockly.FileType` (`File`, `Directory`, `SymbolicLink`, `Unknown`).
`FileSystemError` can be thrown (e.g., `mockly.FileSystemError.FileNotFound()`).

**Example:**

```typescript
import { FileType, mockly, vscodeSimulator } from 'mockly-vsc'; // Import FileType
import { beforeEach, describe, expect, it } from 'vitest';

describe('Mock File System (workspace.fs) Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset(); // Resets the file system too
	});

	it('should allow file creation, reading, stat, and deletion', async () => {
		const fileUri = mockly.Uri.file('/test/myFile.txt');
		const content = Buffer.from('File system test content!'); // Use Buffer for easy string conversion

		// Write a new file
		await mockly.workspace.fs.writeFile(fileUri, content, { create: true, overwrite: true });

		// Read the file
		const readContentBytes = await mockly.workspace.fs.readFile(fileUri);
		expect(Buffer.from(readContentBytes).toString()).toBe(content.toString());

		// Get file statistics
		const stat = await mockly.workspace.fs.stat(fileUri);
		expect(stat.type).toBe(FileType.File);
		expect(stat.size).toBe(content.length);
		expect(stat.mtime).toBeGreaterThan(0); // Modification time is set

		// Delete the file
		await mockly.workspace.fs.delete(fileUri);

		// Verify deletion by trying to stat it (should throw FileNotFound)
		await expect(mockly.workspace.fs.stat(fileUri))
			.rejects.toThrowError(/FileNotFound/); // Or check e.code === 'FileNotFound'
	});

	it('should handle directories: creation, listing, and recursive deletion', async () => {
		const dirUri = mockly.Uri.file('/test/myDir');
		const fileInDirUri = mockly.Uri.joinPath(dirUri, 'nestedFile.txt');

		// Create directory
		await mockly.workspace.fs.createDirectory(dirUri);
		let stat = await mockly.workspace.fs.stat(dirUri);
		expect(stat.type).toBe(FileType.Directory);

		// Write a file inside the directory
		await mockly.workspace.fs.writeFile(fileInDirUri, Buffer.from('Nested content'));

		// Read directory contents
		const entries = await mockly.workspace.fs.readDirectory(dirUri);
		expect(entries.length).toBe(1);
		expect(entries[0][0]).toBe('nestedFile.txt'); // Entry name
		expect(entries[0][1]).toBe(FileType.File); // Entry type

		// Delete directory recursively
		await mockly.workspace.fs.delete(dirUri, { recursive: true });
		await expect(mockly.workspace.fs.stat(dirUri))
			.rejects.toThrowError(/FileNotFound/);
		await expect(mockly.workspace.fs.stat(fileInDirUri)) // File inside should also be gone
			.rejects.toThrowError(/FileNotFound/);
	});
});
```

## Finding Files

`mockly.workspace.findFiles(include: GlobPattern, exclude?: GlobPattern | null, maxResults?: number, token?: mockly.CancellationToken): Promise<mockly.Uri[]>` allows you to search for files within the mock workspace folders using glob patterns.

**Example:**

```typescript
import { mockly, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Finding Files (workspace.findFiles) Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();

		// Setup a workspace folder and some files for searching
		const projectUri = mockly.Uri.file('/project');
		await vscodeSimulator._fileSystemModule.fs.createDirectory(projectUri); // Create dir in VFS
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(projectUri);

		await mockly.workspace.fs.writeFile(mockly.Uri.joinPath(projectUri, 'file1.ts'), Buffer.from(''));
		await mockly.workspace.fs.writeFile(mockly.Uri.joinPath(projectUri, 'file2.js'), Buffer.from(''));
		await mockly.workspace.fs.createDirectory(mockly.Uri.joinPath(projectUri, 'subfolder'));
		await mockly.workspace.fs.writeFile(
			mockly.Uri.joinPath(projectUri, 'subfolder', 'file3.ts'),
			Buffer.from(''),
		);
		await mockly.workspace.fs.writeFile(
			mockly.Uri.joinPath(projectUri, 'subfolder', 'another.md'),
			Buffer.from(''),
		);
		// A file outside the workspace folder (should not be found by default)
		await mockly.workspace.fs.writeFile(mockly.Uri.file('/other/outside.ts'), Buffer.from(''));
	});

	it('should find files based on include glob pattern within workspace folders', async () => {
		const tsFiles = await mockly.workspace.findFiles('**/*.ts');
		expect(tsFiles.length).toBe(2); // file1.ts, subfolder/file3.ts
		const paths = tsFiles.map(f => f.path);
		expect(paths).toContain('/project/file1.ts');
		expect(paths).toContain('/project/subfolder/file3.ts');
	});

	it('should respect the exclude glob pattern', async () => {
		// Find all .ts files, but exclude those in 'subfolder'
		const tsFiles = await mockly.workspace.findFiles('**/*.ts', '**/subfolder/**');
		expect(tsFiles.length).toBe(1);
		expect(tsFiles[0].path).toBe('/project/file1.ts');
	});

	it('should find a specific file', async () => {
		const jsFiles = await mockly.workspace.findFiles('file2.js');
		expect(jsFiles.length).toBe(1);
		expect(jsFiles[0].path).toBe('/project/file2.js');
	});

	it('should return empty if no workspace folder is open', async () => {
		await vscodeSimulator.reset(); // Clear workspace folders
		const files = await mockly.workspace.findFiles('**/*');
		expect(files.length).toBe(0);
	});
});
```

## Applying Edits (mockly.workspace.applyEdit)

`mockly.workspace.applyEdit(edit: WorkspaceEdit): Promise<boolean>` simulates applying a `WorkspaceEdit`. This is useful for testing code that performs refactorings or bulk modifications across one or more files. A `WorkspaceEdit` can contain text edits and file operations (create, delete, rename).

You can create a new `WorkspaceEdit` instance using `new mockly.WorkspaceEdit()`.

**Example:**

```typescript
import { mockly, Position, Range, vscodeSimulator } from 'mockly-vsc';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Applying WorkspaceEdits (workspace.applyEdit) Tests', () => {
	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	it('should apply text edits (replace, insert, delete) to an existing document', async () => {
		const fileUri = mockly.Uri.file('/test/editable.txt');
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from('Hello wonderful world!'));
		// Document needs to be open for text edits to be applied directly to its buffer in some mock scenarios,
		// though applyEdit can also work on non-open files by modifying them on disk.
		// For simplicity and to check TextDocument state, let's open it.
		const document = await mockly.workspace.openTextDocument(fileUri);

		const edit = new mockly.WorkspaceEdit();
		// Replace "world" with "Mockly"
		edit.replace(fileUri, new mockly.Range(new Position(0, 16), new Position(0, 21)), 'Mockly');
		// Insert " amazing" before "Mockly"
		edit.insert(fileUri, new Position(0, 16), ' amazing'); // Note: positions are based on the state *before* previous edits in the same WorkspaceEdit are applied.
		// However, Mockly's applyEdit processes them sequentially for a single file.
		// Let's adjust for a more robust test of sequential edits or do separate edits.

		// For clearer testing of multiple edits, apply them or build the edit carefully.
		// Let's do one edit first.
		const replaceEdit = new mockly.WorkspaceEdit();
		replaceEdit.replace(fileUri, new Range(0, 16, 0, 21), 'Mockly'); // "Hello wonderful Mockly!"

		let success = await mockly.workspace.applyEdit(replaceEdit);
		expect(success).toBe(true);
		expect(document.getText()).toBe('Hello wonderful Mockly!'); // Document is updated

		const insertEdit = new mockly.WorkspaceEdit();
		insertEdit.insert(fileUri, new Position(0, 16), 'amazing '); // "Hello wonderful amazing Mockly!"
		success = await mockly.workspace.applyEdit(insertEdit);
		expect(success).toBe(true);
		expect(document.getText()).toBe('Hello wonderful amazing Mockly!');
	});

	it('should apply file creation edits', async () => {
		const newFileUri = mockly.Uri.file('/test/newlyCreatedFile.txt');
		const newFileContent = Buffer.from('This file was created by a WorkspaceEdit.');

		const edit = new mockly.WorkspaceEdit();
		// Option 1: Create with content (if mock supports TextDocumentEdit for new file content)
		// edit.createFile(newFileUri, { content: newFileContent }); // This might be a newer API feature or specific interpretation.
		// Option 2: More commonly, create empty file then apply text edit, or ensure `createFile` supports content.
		// Mockly's `createFile` in WorkspaceEdit can take content directly.
		edit.createFile(newFileUri, {
			overwrite: false,
			content: newFileContent, /* Mockly specific enhancement for convenience */
		});

		const success = await mockly.workspace.applyEdit(edit);
		expect(success).toBe(true);

		// Verify file was created
		const stat = await mockly.workspace.fs.stat(newFileUri);
		expect(stat.type).toBe(mockly.FileType.File);
		const content = await mockly.workspace.fs.readFile(newFileUri);
		expect(Buffer.from(content).toString()).toBe(newFileContent.toString());
	});

	it('should apply file deletion and renaming edits', async () => {
		const oldFileUri = mockly.Uri.file('/test/toRename.txt');
		const newFileUri = mockly.Uri.file('/test/renamedFile.txt');
		const toDeleteUri = mockly.Uri.file('/test/toDelete.txt');

		await mockly.workspace.fs.writeFile(oldFileUri, Buffer.from('Original content.'));
		await mockly.workspace.fs.writeFile(toDeleteUri, Buffer.from('Content to be deleted.'));

		const edit = new mockly.WorkspaceEdit();
		edit.renameFile(oldFileUri, newFileUri, { overwrite: false });
		edit.deleteFile(toDeleteUri, { recursive: false });

		const success = await mockly.workspace.applyEdit(edit);
		expect(success).toBe(true);

		// Verify rename
		await expect(mockly.workspace.fs.stat(oldFileUri)).rejects.toThrowError(/FileNotFound/);
		const renamedStat = await mockly.workspace.fs.stat(newFileUri);
		expect(renamedStat.type).toBe(mockly.FileType.File);

		// Verify deletion
		await expect(mockly.workspace.fs.stat(toDeleteUri)).rejects.toThrowError(/FileNotFound/);
	});
});
```

## Workspace Events

Mockly-VSC simulates various workspace-related events. You can subscribe to these events using the `mockly.workspace.onDid...` or `mockly.workspace.onWill...` methods to test how your extension reacts to changes in the workspace. Each of these event handlers returns a `mockly.Disposable` object, which you should call `.dispose()` on during test cleanup to prevent listeners from leaking between tests.

**Key Workspace Events:**

- `mockly.workspace.onDidChangeWorkspaceFolders`: Fired when workspace folders are added, removed, or changed. Event argument: `WorkspaceFoldersChangeEvent`.
- `mockly.workspace.onDidOpenTextDocument`: Fired when a text document is opened. Event argument: `TextDocument`.
- `mockly.workspace.onDidCloseTextDocument`: Fired when a text document is closed. Event argument: `TextDocument`.
- `mockly.workspace.onDidSaveTextDocument`: Fired when a text document is saved. Event argument: `TextDocument`.
- `mockly.workspace.onWillSaveTextDocument`: Fired before a text document is saved. Event argument: `TextDocumentWillSaveEvent`.
- `mockly.workspace.onDidChangeTextDocument`: Fired when the content of a text document changes. Event argument: `TextDocumentChangeEvent`.
- `mockly.workspace.onDidCreateFiles`: Fired when files are created via `workspace.fs`. Event argument: `FileCreateEvent`.
- `mockly.workspace.onDidDeleteFiles`: Fired when files are deleted via `workspace.fs`. Event argument: `FileDeleteEvent`.
- `mockly.workspace.onDidRenameFiles`: Fired when files are renamed via `workspace.fs`. Event argument: `FileRenameEvent`.
- `mockly.workspace.onWillCreateFiles`, `mockly.workspace.onWillDeleteFiles`, `mockly.workspace.onWillRenameFiles`: Pre-operation events.
- `mockly.workspace.onDidChangeConfiguration`: Fired when the configuration changes. Event argument: `ConfigurationChangeEvent`. (Configuration mocking itself is a more advanced topic, often involving `getConfiguration`.)

These events are typically fired automatically by Mockly-VSC when the corresponding actions occur (e.g., opening a document via `openTextDocument`, writing to a file via `workspace.fs.writeFile`, or changing workspace folders via the simulator's internal services).

**Example:**

```typescript
import { mockly, Position, vscodeSimulator } from 'mockly-vsc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Workspace Events Tests', () => {
	let disposables: mockly.Disposable[] = [];

	beforeEach(async () => {
		await vscodeSimulator.reset();
	});

	afterEach(() => {
		disposables.forEach(d => d.dispose());
		disposables = [];
	});

	it('should fire onDidOpenTextDocument when a document is opened', async () => {
		const onOpenSpy = vi.fn();
		disposables.push(mockly.workspace.onDidOpenTextDocument(onOpenSpy));

		const fileUri = mockly.Uri.file('/test/eventDoc.txt');
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from('content')); // Ensure file exists

		const document = await mockly.workspace.openTextDocument(fileUri);

		expect(onOpenSpy).toHaveBeenCalledTimes(1);
		expect(onOpenSpy).toHaveBeenCalledWith(document); // Argument is the opened TextDocument
	});

	it('should fire onDidChangeTextDocument when a document is edited (e.g., via TextEditor.edit or applyEdit)', async () => {
		const onChangeSpy = vi.fn();
		const fileUri = mockly.Uri.file('/test/changeDoc.txt');
		await mockly.workspace.fs.writeFile(fileUri, Buffer.from('initial content'));
		const document = await mockly.workspace.openTextDocument(fileUri);

		// To trigger onDidChangeTextDocument via an edit, we often need a TextEditor instance.
		// This event is also fired if mockly.workspace.applyEdit results in a change.
		const editor = await mockly.window.showTextDocument(document); // Show document to get an editor

		disposables.push(mockly.workspace.onDidChangeTextDocument(onChangeSpy));

		// Perform an edit using the editor
		const success = await editor.edit(editBuilder => {
			editBuilder.insert(new mockly.Position(0, 0), 'new text ');
		});
		expect(success).toBe(true); // Edit was applied

		expect(onChangeSpy).toHaveBeenCalledTimes(1);
		const eventArg = onChangeSpy.mock.calls[0][0]; // TextDocumentChangeEvent
		expect(eventArg.document.uri.toString()).toBe(fileUri.toString());
		expect(eventArg.document.getText()).toBe('new text initial content');
		expect(eventArg.contentChanges.length).toBeGreaterThan(0);
		// Note: Mockly's contentChanges in the event might be simplified.
		// For precise change details, inspect the document's text directly or the change objects.
	});

	it('should fire onDidCreateFiles when workspace.fs.writeFile creates a new file', async () => {
		const onCreateSpy = vi.fn();
		disposables.push(mockly.workspace.onDidCreateFiles(onCreateSpy));

		const newFileUri = mockly.Uri.file('/test/newlyCreatedForEvent.txt');
		await mockly.workspace.fs.writeFile(newFileUri, Buffer.from('newly created'));

		expect(onCreateSpy).toHaveBeenCalledTimes(1);
		const eventArg = onCreateSpy.mock.calls[0][0]; // FileCreateEvent
		expect(eventArg.files.length).toBe(1);
		expect(eventArg.files[0].toString()).toBe(newFileUri.toString());
	});

	it('should fire onDidChangeWorkspaceFolders when folders are changed', async () => {
		const onFoldersChangedSpy = vi.fn();
		disposables.push(mockly.workspace.onDidChangeWorkspaceFolders(onFoldersChangedSpy));

		const folderUri = mockly.Uri.file('/project/eventFolder');
		await vscodeSimulator._fileSystemModule.fs.createDirectory(folderUri);
		await vscodeSimulator._workspaceModule._workspaceStateService.addWorkspaceFolder(folderUri);

		expect(onFoldersChangedSpy).toHaveBeenCalledTimes(1);
		const eventArg = onFoldersChangedSpy.mock.calls[0][0]; // WorkspaceFoldersChangeEvent
		expect(eventArg.added.length).toBe(1);
		expect(eventArg.added[0].uri.toString()).toBe(folderUri.toString());
		expect(eventArg.removed.length).toBe(0);
	});
});
```
