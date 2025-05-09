// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { IFileSystemService } from 'src/modules/fileSystem/_interfaces/IFileSystemService.ts'
import type * as vt from 'vscode'

//= IMPLEMENTATION TYPES ======================================================================================

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface simulating the `vscode.workspace` namespace.
 */
export interface IWorkspaceNamespace extends Pick<typeof vt.workspace,
	// Properties
  | 'workspaceFolders'
  | 'workspaceFile'
  | 'name'
  | 'textDocuments'

    // Methods
  | 'getWorkspaceFolder'
  | 'asRelativePath'
  | 'findFiles'
  | 'openTextDocument'
  | 'saveAll'
  | 'applyEdit'
  | 'registerTextDocumentContentProvider'
  | 'registerTaskProvider'
  | 'registerFileSystemProvider'
  | 'createFileSystemWatcher'

    // Events (provided by EventBusService)
  | 'onDidChangeWorkspaceFolders'
  | 'onDidOpenTextDocument'
  | 'onDidCloseTextDocument'
  | 'onDidSaveTextDocument'
  | 'onWillSaveTextDocument'
  | 'onDidChangeTextDocument'
  | 'onDidCreateFiles'
  | 'onDidDeleteFiles'
  | 'onDidRenameFiles'
  | 'onWillDeleteFiles'
  | 'onWillRenameFiles'
  | 'onDidChangeConfiguration'> {

	// The 'fs' property should be on the public namespace
	readonly fs: IFileSystemService

	// The 'delete' method is part of the public API
	delete: (uri: vt.Uri, options?: { recursive?: boolean, useTrash?: boolean }) => Promise<void>

}
