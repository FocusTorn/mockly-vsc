// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { FileType, LogLevel } from '../../../_vscCore/vscEnums.ts'
import { TextEdit, CancellationTokenSource } from '../../../_vscCore/vscClasses.ts'
import { FileSystemError } from '../../../_vscCore/vscFileSystemError.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { IWorkspaceStateService } from '../_interfaces/IWorkspaceStateService.ts'
import type { IFileSystemModule } from '../../fileSystem/_interfaces/IFileSystemModule.ts'
import type { IUriService } from '../../fileSystem/_interfaces/IUriService.ts'
import type { IMockNodePathService } from '../../fileSystem/_interfaces/IMockNodePathService.ts'
import type { IFileSystemService } from '../../fileSystem/_interfaces/IFileSystemService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IWorkspaceNamespace } from '../_interfaces/IWorkspaceNamespace.ts'
import type { IWorkspaceModule } from '../_interfaces/IWorkspaceModule.ts'
import type { TextDocumentService } from '../services/textDocument.service.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents the Workspace module in the mocked VS Code API.
 * Encapsulates workspace-related services and exposes the `vscode.workspace` namespace.
 */
@injectable()
export class WorkspaceModule implements IWorkspaceModule {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly workspace: IWorkspaceNamespace

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService, // Keep if directly used, or remove if only sub-services use it
		@inject('IWorkspaceStateService') private wsStateService: IWorkspaceStateService,
		@inject('ITextDocumentService') private docService: TextDocumentService, // Concrete class for internal access
		@inject('IFileSystemModule') private fileSystemModule: IFileSystemModule, // Inject FileSystemModule
		@inject('IWorkspaceNamespace') mockWorkspaceImpl: IWorkspaceNamespace,
	) {
		this.utils.log(LogLevel.Debug, 'WorkspaceModuleImpl initializing...')
		this.workspace = mockWorkspaceImpl
		this.utils.log(LogLevel.Debug, 'WorkspaceModuleImpl initialized.')
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Accessors for vscode API elements (delegating to FileSystemModule where appropriate)            │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get Uri(): IUriService { return this.fileSystemModule.Uri }
	get FileSystemError(): typeof FileSystemError { return FileSystemError } // Static class from _vscCore
	get FileType(): typeof FileType { return FileType } // Enum from _vscCore
	get CancellationTokenSource(): typeof CancellationTokenSource { return CancellationTokenSource } // Class from _vscCore
	get TextEdit(): typeof TextEdit { return TextEdit } // Class from _vscCore

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	async reset(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Resetting WorkspaceModuleImpl state...')

		// await this.fileSystemModule.reset() // Removed: FileSystemModule is reset by the simulator
		await this.wsStateService.clearWorkspace()
		await this.docService._reset()

		this.utils.log(LogLevel.Debug, 'WorkspaceModuleImpl reset complete.')
	} //<
    
	/**
	 * @inheritdoc
	 */
	async closeTextDocument(uri: vt.Uri, fireEvent: boolean = true): Promise<void> { //>
		await this.docService.closeTextDocument(uri, fireEvent)
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal Accessors (for testing and advanced integration)                                       │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	get _workspaceStateService(): IWorkspaceStateService { //>
		return this.wsStateService
	} //<

	/**
	 * @inheritdoc
	 */
	get _textDocumentService(): TextDocumentService { //>
		return this.docService
	} //<

	/**
	 * @inheritdoc
	 */
	get _uriService(): IUriService { //>
		return this.fileSystemModule.Uri // Delegate to FileSystemModule
	} //<

	/**
	 * @inheritdoc
	 */
	get _nodePathService(): IMockNodePathService { //>
		return this.fileSystemModule.path // Delegate to FileSystemModule
	} //<

	/**
	 * @inheritdoc
	 */
	get _fileSystemService(): IFileSystemService { //>
		return this.fileSystemModule.fs // Delegate to FileSystemModule
	} //<

}