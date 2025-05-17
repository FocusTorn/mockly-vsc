// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IFileSystemService } from '../_interfaces/IFileSystemService.ts'
import type { IUriService } from '../_interfaces/IUriService.ts'
import type { IFileSystemStateService } from '../_interfaces/IFileSystemStateService.ts'
import type { IVfsPopulationService } from '../_interfaces/IVfsPopulationService.ts' // ADDED

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

	readonly fs: IFileSystemService
	readonly Uri: IUriService
	readonly _fileSystemStateService: IFileSystemStateService
	readonly _vfsPopulationService: IVfsPopulationService // ADDED

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IFileSystemService') fileSystemService: IFileSystemService,
		@inject('IUriService') uriService: IUriService,
		@inject('IFileSystemStateService') fileSystemStateService: IFileSystemStateService,
		@inject('IVfsPopulationService') vfsPopulationService: IVfsPopulationService, // ADDED
	) {
		this.utils.log(LogLevel.Debug, 'FileSystemModule initializing...')
		this.fs = fileSystemService
		this.Uri = uriService
		this._fileSystemStateService = fileSystemStateService
		this._vfsPopulationService = vfsPopulationService // ADDED
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

		await this.fs._clear()
		// VfsPopulationService is typically stateless beyond its dependencies,
		// or its state is implicitly reset when FileSystemStateService is reset.
		// If VfsPopulationService had its own direct state, a reset call would be added here.

		this.utils.log(LogLevel.Debug, 'FileSystemModule reset complete.')
	
	} //<

}
