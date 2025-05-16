// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { Uri, WorkspaceFolder } from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

export enum WorkspaceType { //>
	NONE = 'none',
	SINGLE_ROOT = 'single',
	MULTI_ROOT = 'multi',
	REMOTE = 'remote',
	UNTITLED = 'untitled',
} //<

/**
 * Manages the state of the VS Code workspace(s) within the mock environment,
 * including workspace folders, type, and potentially configuration access.
 */
export interface IWorkspaceStateService {
	/**
	 * The type of the current workspace.
	 */
	readonly workspaceType: WorkspaceType

	/**
	 * An array containing the workspace folders. Returns `undefined` if no folder is open.
	 * Returns an empty array for an empty multi-root workspace.
	 */
	readonly workspaceFolders: readonly WorkspaceFolder[] | undefined

	/**
	 * The name of the workspace. `undefined` if no folder is open.
	 * Derived from the folder name for single-root or the .code-workspace file for multi-root.
	 */
	readonly name: string | undefined

	/**
	 * The location of the workspace configuration file (`.code-workspace`).
	 * `undefined` if not a multi-root workspace or if the file doesn't exist virtually.
	 */
	readonly workspaceFile: Uri | undefined

	/**
	 * Adds a folder to the workspace.
	 * If no workspace is open, this becomes the first root folder (single-root).
	 * If a single-root workspace is open, it might transition to multi-root (requires handling).
	 * If a multi-root workspace is open, adds the folder to the list.
	 * Validates the folder exists in the VirtualFileSystemService.
	 * @param folderUri The Uri of the folder to add.
	 * @param name Optional custom name for the workspace folder.
	 * @returns True if the folder was added successfully, false otherwise (e.g., doesn't exist).
	 * @throws Error if the path is not a directory or other validation errors.
	 */
	addWorkspaceFolder: (folderUri: Uri, name?: string) => Promise<boolean> //>

	/**
	 * Removes a folder from the workspace.
	 * If it's the last folder, the workspace might become empty or close.
	 * @param folderUri The Uri of the folder to remove.
	 * @returns True if the folder was removed successfully, false otherwise (e.g., not found).
	 */
	removeWorkspaceFolder: (folderUri: Uri) => Promise<boolean> //>

	/**
	 * Sets the workspace folders explicitly, replacing any existing ones.
	 * Determines the workspace type based on the number of folders.
	 * Validates folders exist in the VirtualFileSystemService.
	 * @param folders An array of WorkspaceFolder objects or Uris to set.
	 * @param workspaceFileUri Optional Uri for the .code-workspace file (implies multi-root).
	 */
	setWorkspaceFolders: (folders: readonly (WorkspaceFolder | Uri)[], workspaceFileUri?: Uri) => Promise<void> //>

	/**
	 * Retrieves the workspace folder that contains a given resource Uri.
	 * @param uri The Uri of the resource (file or folder).
	 * @returns The WorkspaceFolder containing the resource, or undefined if none.
	 */
	getWorkspaceFolder: (uri: Uri) => WorkspaceFolder | undefined //>

	/**
	 * Clears the current workspace state, effectively closing the workspace.
	 * Resets workspaceType, workspaceFolders, etc.
	 */
	clearWorkspace: () => Promise<void> //>
}
