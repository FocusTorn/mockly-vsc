// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type {
	FileType as LocalFileType,
} from '../../_vscCore/vscEnums.ts'
import {
	LogLevel,
	ViewColumn,
	UIKind,
	DiagnosticSeverity,
	QuickPickItemKind,
	StatusBarAlignment,
	TreeItemCollapsibleState,
	EndOfLine,
} from '../../_vscCore/vscEnums.ts'
import {
	Position,
	Range,
	Selection,
	EventEmitter,
	Location,
	Diagnostic,
	Disposable,
	ThemeColor,
	ThemeIcon,
	TreeItem,
	WorkspaceEdit,
	RelativePattern,
	TextEdit as LocalTextEdit, // Renamed to avoid conflict
} from '../../_vscCore/vscClasses.ts'
import type { MockFileSystemErrorNamespace, TextEditFactory } from '../../_vscCore/_vscInterfaces.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../_interfaces/IEventBusService.ts'

// IMockNodePathService is no longer directly injected here
import type { IUriService } from '../../modules/fileSystem/_interfaces/IUriService.ts'

// Path updated
import type { IVSCodeAPISimulatorService } from '../_interfaces/IVSCodeAPISimulatorService.ts'
import type { ICommandsModule } from '../../modules/commands/_interfaces/ICommandsModule.ts'
import type { IEnvModule } from '../../modules/env/_interfaces/IEnvModule.ts'
import type { IExtensionsModule } from '../../modules/extensions/_interfaces/IExtensionsModule.ts'
import type { IWindowModule } from '../../modules/window/_interfaces/IWindowModule.ts'
import type { IWorkspaceModule } from '../../modules/workspace/_interfaces/IWorkspaceModule.ts'

import type { IFileSystemModule } from '../../modules/fileSystem/_interfaces/IFileSystemModule.ts'

// Added

//= IMPLEMENTATION TYPES ======================================================================================
import type { IWindowNamespace } from '../../modules/window/_interfaces/IWindowNamespace.ts'
import type { ICommandsNamespace } from '../../modules/commands/_interfaces/ICommandsNamespace.ts'
import type { IEnvNamespace } from '../../modules/env/_interfaces/IEnvNamespace.ts'
import type { IExtensionsNamespace } from '../../modules/extensions/_interfaces/IExtensionsNamespace.ts'
import type { IWorkspaceNamespace } from '../../modules/workspace/_interfaces/IWorkspaceNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Provides the mock implementations for the core VS Code API namespaces
 * like vscode.window, vscode.workspace, vscode.commands, etc.
 * Acts as the main facade for the `mockly.vscode` object, using
 * other services internally to manage state and behavior.
 * Implements the IVSCodeAPISimulatorService interface.
 */
@injectable()
@singleton()
export class VSCodeAPISimulatorService implements IVSCodeAPISimulatorService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly _workspaceModule: IWorkspaceModule
	readonly _windowModule: IWindowModule
	readonly _commandsModule: ICommandsModule
	readonly _envModule: IEnvModule
	readonly _extensionsModule: IExtensionsModule
	readonly _fileSystemModule: IFileSystemModule // Added

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		// IMockNodePathService removed from direct injection
		@inject('IWorkspaceModule') workspaceModule: IWorkspaceModule,
		@inject('IWindowModule') windowModule: IWindowModule,
		@inject('ICommandsModule') commandsModule: ICommandsModule,
		@inject('IEnvModule') envModule: IEnvModule,
		@inject('IExtensionsModule') extensionsModule: IExtensionsModule,
		@inject('IFileSystemModule') fileSystemModule: IFileSystemModule, // Injected
	) {
		this.utils.log(LogLevel.Debug, 'VSCodeAPISimulatorService initializing...')
		this._workspaceModule = workspaceModule
		this._windowModule = windowModule
		this._commandsModule = commandsModule
		this._envModule = envModule
		this._extensionsModule = extensionsModule
		this._fileSystemModule = fileSystemModule // Assigned
		this.utils.log(LogLevel.Debug, 'VSCodeAPISimulatorService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public API Namespaces                                                                           │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	get workspace(): IWorkspaceNamespace { return this._workspaceModule.workspace }
	get window(): IWindowNamespace { return this._windowModule.window }
	get commands(): ICommandsNamespace { return this._commandsModule.commands }
	get env(): IEnvNamespace { return this._envModule.env }
	get extensions(): IExtensionsNamespace { return this._extensionsModule.extensions }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public API Types, Classes, Enums                                                                │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	get Uri(): IUriService { return this._fileSystemModule.Uri } // Sourced from FileSystemModule
	get FileSystemError(): MockFileSystemErrorNamespace { return this._workspaceModule.FileSystemError } // WorkspaceModule still exposes this (from _vscCore)
	get FileType(): typeof LocalFileType { return this._workspaceModule.FileType } // WorkspaceModule still exposes this (from _vscCore)
	get CancellationTokenSource(): typeof vt.CancellationTokenSource { return this._workspaceModule.CancellationTokenSource } // WorkspaceModule still exposes this (from _vscCore)
	get TextEdit(): TextEditFactory { return LocalTextEdit } // Directly use the imported class/factory

	get Position(): typeof Position { return Position }
	get Range(): typeof Range { return Range }
	get Selection(): typeof Selection { return Selection }
	get Location(): typeof Location { return Location }
	get RelativePattern(): typeof RelativePattern { return RelativePattern }
	get Diagnostic(): typeof Diagnostic { return Diagnostic }
	get Disposable(): typeof Disposable { return Disposable }
	get EventEmitter(): typeof EventEmitter { return EventEmitter }
	get ThemeColor(): typeof ThemeColor { return ThemeColor }
	get ThemeIcon(): typeof ThemeIcon { return ThemeIcon }
	get TreeItem(): typeof TreeItem { return TreeItem }
	get WorkspaceEdit(): typeof WorkspaceEdit { return WorkspaceEdit }
	get DiagnosticSeverity(): typeof DiagnosticSeverity { return DiagnosticSeverity }
	get QuickPickItemKind(): typeof QuickPickItemKind { return QuickPickItemKind }
	get ViewColumn(): typeof ViewColumn { return ViewColumn }
	get StatusBarAlignment(): typeof StatusBarAlignment { return StatusBarAlignment }
	get TreeItemCollapsibleState(): typeof TreeItemCollapsibleState { return TreeItemCollapsibleState }
	get UIKind(): typeof UIKind { return UIKind }
	get EndOfLine(): typeof EndOfLine { return EndOfLine }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Other Public API Properties                                                                     │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	get version(): string { return 'mock-1.90.0' }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	async reset(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Resetting VSCodeAPISimulatorService...')

		await this._workspaceModule.reset()
		await this._windowModule.reset()
		await this._commandsModule.reset()
		await this._envModule.reset()
		await this._extensionsModule.reset()
		await this._fileSystemModule.reset() // Added reset for FileSystemModule

		this.eventBus.reset()

		this.utils.log(LogLevel.Debug, 'VSCodeAPISimulatorService reset complete.')
	
	} //<

}
