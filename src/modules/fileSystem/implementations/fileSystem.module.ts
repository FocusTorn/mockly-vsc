// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IFileSystemService } from '../_interfaces/IFileSystemService.ts'
import type { IUriService } from '../_interfaces/IUriService.ts'
import type { IMockNodePathService } from '../_interfaces/IMockNodePathService.ts'
import type { IFileSystemStateService } from '../_interfaces/IFileSystemStateService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IFileSystemModule } from '../_interfaces/IFileSystemModule.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents the FileSystem module in the mocked VS Code API.
 * Encapsulates file system-related services and exposes them.
 * This module will provide the `vscode.workspace.fs` functionality
 * and related utilities like Uri and path services.
 */
@injectable()
export class FileSystemModule implements IFileSystemModule {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly fs: IFileSystemService // This will be the main `vscode.workspace.fs` object
	readonly Uri: IUriService // Expose UriService, similar to how WorkspaceModule does
	readonly path: IMockNodePathService // Expose MockNodePathService

	// Keep internal services if they need to be exposed for testing or specific internal module access
	readonly _fileSystemStateService: IFileSystemStateService // If state is managed separately

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IFileSystemService') fileSystemService: IFileSystemService,
		@inject('IUriService') uriService: IUriService,
		@inject('IMockNodePathService') mockNodePathService: IMockNodePathService,
		@inject('IFileSystemStateService') fileSystemStateService: IFileSystemStateService,
	) {
		this.utils.log(LogLevel.Debug, 'FileSystemModule initializing...')
		this.fs = fileSystemService
		this.Uri = uriService
		this.path = mockNodePathService
		this._fileSystemStateService = fileSystemStateService
		this.utils.log(LogLevel.Debug, 'FileSystemModule initialized.')
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Resets the state of all services managed by this module.
	 */
	async reset(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Resetting FileSystemModule state...')

		// Delegate reset to the encapsulated internal services
		// The IFileSystemService itself should have a reset/clear method for its VFS.
		// If IFileSystemStateService is separate, it needs reset too.
		await this.fs._clear() // Assuming IFileSystemService has _clear for its VFS
		await this._fileSystemStateService.clear() // If state is separate

		// UriService and MockNodePathService are typically stateless or have simple state
		// that might not need explicit reset beyond DI container clearing instances.
		// If they do have resettable state, add their reset calls here.

		this.utils.log(LogLevel.Debug, 'FileSystemModule reset complete.')
	} //<

}