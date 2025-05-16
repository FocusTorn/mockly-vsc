// ESLint & Imports -->>

//= INJECTED TYPES ============================================================================================
import type { IFileSystemService } from './IFileSystemService.ts'
import type { IUriService } from './IUriService.ts'
import type { IFileSystemStateService } from './IFileSystemStateService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the public contract of the FileSystemModule.
 * It exposes the `vscode.workspace.fs` compatible service and related utilities.
 */
export interface IFileSystemModule {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * The mock `vscode.workspace.fs` (FileSystem) API.
	 */
	readonly fs: IFileSystemService

	/**
	 * The mock `vscode.Uri` factory and utility service.
	 */
	readonly Uri: IUriService


	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Resets the state of the file system module and its services.
	 */
	reset: () => Promise<void>

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal (for testing and advanced integration)                                                 │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Exposes the internal FileSystemStateService for testing and state inspection.
	 * This service manages the raw in-memory representation of the file system.
	 */
	readonly _fileSystemStateService: IFileSystemStateService

}
