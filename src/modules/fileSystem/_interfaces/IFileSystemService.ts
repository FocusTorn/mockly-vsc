// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface simulating the `vscode.FileSystem` API.
 * This is the public interface for file system operations, mirroring `vscode.workspace.fs`.
 */
export interface IFileSystemService extends Omit<vt.FileSystem, 'writeFile'> { // Omit the original writeFile

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Write data to a file, replacing its entire contents.
	 * @param uri The uri of the file.
	 * @param content The new content of the file.
	 * @param options Options for writing the file.
	 * @param options.create Create the file if it does not exist.
	 * @param options.overwrite Overwrite the file if it already exists.
	 */
	writeFile: (uri: vt.Uri, content: Uint8Array, options?: { create?: boolean, overwrite?: boolean }) => Thenable<void>

	/**
	 * Clears the internal state of the file system.
	 * NOTE: This is a Mockly-specific internal method, not part of the public vscode.FileSystem API.
	 */
	_clear: () => Promise<void>

}