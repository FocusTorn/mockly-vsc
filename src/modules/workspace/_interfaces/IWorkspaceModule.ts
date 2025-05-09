// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type { MockFileSystemErrorNamespace } from '../../../_vscCore/_vscInterfaces.ts'
import type { CancellationTokenSource } from '../../../_vscCore/vscClasses.ts'
import type { FileType } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceNamespace } from './IWorkspaceNamespace.ts'
import type { IWorkspaceStateService } from './IWorkspaceStateService.ts'

//= IMPLEMENTATIONS ===========================================================================================
import type { TextDocumentService } from '../services/textDocument.service.ts'
import type { IFileSystemService } from 'src/modules/fileSystem/_interfaces/IFileSystemService.ts'
import type { IMockNodePathService } from 'src/modules/fileSystem/_interfaces/IMockNodePathService.ts'
import type { IUriService } from 'src/modules/fileSystem/_interfaces/IUriService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the public contract of the WorkspaceModule implementation.
 * It exposes the vscode.workspace namespace mock and a reset method.
 * Redundant top-level VS Code types/enums/classes are exposed via the
 * IVSCodeAPISimulatorService instead.
 */
export interface IWorkspaceModule {
	readonly workspace: IWorkspaceNamespace
	reset: () => Promise<void>

	// Expose necessary types/enums/classes that are part of the workspace namespace or closely related
	// These are typically accessed via `vscode.Uri`, `vscode.FileType`, etc.
	readonly Uri: IUriService
	readonly FileSystemError: MockFileSystemErrorNamespace
	readonly FileType: typeof FileType
	readonly CancellationTokenSource: typeof CancellationTokenSource
	// Removed: readonly TextEdit: TextEditFactory // TextEdit class should be exposed by the simulator directly

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Exposes the internal WorkspaceStateService for testing and state inspection.
	 */
	readonly _workspaceStateService: IWorkspaceStateService

	/**
	 * Exposes the internal TextDocumentService for testing and state inspection.
	 */
	readonly _textDocumentService: TextDocumentService // Changed type here

	/**
	 * Exposes the internal UriService for testing and state inspection.
	 */
	readonly _uriService: IUriService

	/**
	 * Exposes the internal MockNodePathService for testing and state inspection.
	 */
	readonly _nodePathService: IMockNodePathService

	/**
	 * Exposes the internal FileSystemService for testing and state inspection.
	 */
	readonly _fileSystemService: IFileSystemService

	/**
	 * Closes a text document, removing it from the list of open documents.
	 * Note: This is a Mockly-specific internal method, not part of the public vscode.workspace API.
	 * @param uri The Uri of the document to close.
	 * @param fireEvent Whether to fire the onDidCloseTextDocument event (default true).
	 */
	closeTextDocument: (uri: vt.Uri, fireEvent?: boolean) => Promise<void> //>
}
