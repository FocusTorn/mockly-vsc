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
	TextEditorRevealType,
	ExtensionKind,
	ConfigurationTarget,
} from '../../_vscCore/vscEnums.ts'

import type {
	CancellationTokenSource as LocalCancellationTokenSource,
} from '../../_vscCore/vscClasses.ts'
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
	TextEdit as LocalTextEdit,
} from '../../_vscCore/vscClasses.ts'
import type { MockFileSystemErrorNamespace, TextEditFactory } from '../../_vscCore/_vscInterfaces.ts'

import type { FileSystemError as LocalFileSystemError } from '../../_vscCore/vscFileSystemError.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../_interfaces/IEventBusService.ts'
import type { IUriService } from '../../modules/fileSystem/_interfaces/IUriService.ts'
import type { IVSCodeAPISimulatorService, IVSCodeAPISimulatorVFSHelpers } from '../_interfaces/IVSCodeAPISimulatorService.ts'
import type { ICommandsModule } from '../../modules/commands/_interfaces/ICommandsModule.ts'
import type { IEnvModule } from '../../modules/env/_interfaces/IEnvModule.ts'
import type { IExtensionsModule } from '../../modules/extensions/_interfaces/IExtensionsModule.ts'
import type { IWindowModule } from '../../modules/window/_interfaces/IWindowModule.ts'
import type { IWorkspaceModule } from '../../modules/workspace/_interfaces/IWorkspaceModule.ts'

import type { IFileSystemModule } from '../../modules/fileSystem/_interfaces/IFileSystemModule.ts'
import type { IMockNodePathService } from '../../modules/nodePath/_interfaces/IMockNodePathService.ts'
import type { INodeFsService } from '../../modules/nodeFs/_interfaces/INodeFsService.ts'
import type { IFileSystemStructure, IVfsPopulationService } from '../../modules/fileSystem/_interfaces/IVfsPopulationService.ts' // MODIFIED: Added IVfsPopulationService

//= IMPLEMENTATION TYPES ======================================================================================
import type { IWindowNamespace } from '../../modules/window/_interfaces/IWindowNamespace.ts'
import type { ICommandsNamespace } from '../../modules/commands/_interfaces/ICommandsNamespace.ts'
import type { IEnvNamespace } from '../../modules/env/_interfaces/IEnvNamespace.ts'
import type { IExtensionsNamespace } from '../../modules/extensions/_interfaces/IExtensionsNamespace.ts'
import type { IWorkspaceNamespace } from '../../modules/workspace/_interfaces/IWorkspaceNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

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
	readonly _fileSystemModule: IFileSystemModule
	readonly _nodeFsService: INodeFsService
	private readonly _nodePathServiceInstance: IMockNodePathService
	readonly vfs: IVSCodeAPISimulatorVFSHelpers

	constructor( //>
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		@inject('IWorkspaceModule') workspaceModule: IWorkspaceModule,
		@inject('IWindowModule') windowModule: IWindowModule,
		@inject('ICommandsModule') commandsModule: ICommandsModule,
		@inject('IEnvModule') envModule: IEnvModule,
		@inject('IExtensionsModule') extensionsModule: IExtensionsModule,
		@inject('IFileSystemModule') fileSystemModule: IFileSystemModule,
		@inject('INodeFsService') nodeFsService: INodeFsService,
		@inject('IMockNodePathService') nodePathServiceInstance: IMockNodePathService,
		@inject('IVfsPopulationService') private vfsPopulationService: IVfsPopulationService, // ADDED DIRECT INJECTION
	) {
		this.utils.log(LogLevel.Debug, 'VSCodeAPISimulatorService initializing...')
		this._workspaceModule = workspaceModule
		this._windowModule = windowModule
		this._commandsModule = commandsModule
		this._envModule = envModule
		this._extensionsModule = extensionsModule
		this._fileSystemModule = fileSystemModule
		this._nodeFsService = nodeFsService
		this._nodePathServiceInstance = nodePathServiceInstance

		this.vfs = {
			populate: async (structure: IFileSystemStructure): Promise<void> => {
				await this.vfsPopulationService.populate(structure) // MODIFIED: Use direct injection
			
			},
			populateSync: (structure: IFileSystemStructure): void => {
				this.vfsPopulationService.populateSync(structure) // MODIFIED: Use direct injection
			
			},
		}

		this.utils.log(LogLevel.Debug, 'VSCodeAPISimulatorService initialized.')
	
	} //<

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
	get Uri(): IUriService { return this._fileSystemModule.Uri }
	get FileSystemError(): typeof LocalFileSystemError { return this._workspaceModule.FileSystemError }
	get FileType(): typeof LocalFileType { return this._workspaceModule.FileType }
	get CancellationTokenSource(): typeof LocalCancellationTokenSource { return this._workspaceModule.CancellationTokenSource }
	get TextEdit(): typeof LocalTextEdit { return LocalTextEdit }

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
	get LogLevel(): typeof LogLevel { return LogLevel }
	get TextEditorRevealType(): typeof TextEditorRevealType { return TextEditorRevealType }
	get ExtensionKind(): typeof ExtensionKind { return ExtensionKind }
	get ConfigurationTarget(): typeof ConfigurationTarget { return ConfigurationTarget }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public Path Service Accessor (for test helpers)                                                 │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	get path(): IMockNodePathService { return this._nodePathServiceInstance }
	get nodePathService(): IMockNodePathService { return this._nodePathServiceInstance }
	get nodeFsService(): INodeFsService { return this._nodeFsService }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Other Public API Properties                                                                     │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	get version(): string { return 'mock-1.90.0' }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async reset(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Resetting VSCodeAPISimulatorService...')

		await this._workspaceModule.reset()
		await this._windowModule.reset()
		await this._commandsModule.reset()
		await this._envModule.reset()
		await this._extensionsModule.reset()
		await this._fileSystemModule.reset()

		this.eventBus.reset()

		this.utils.log(LogLevel.Debug, 'VSCodeAPISimulatorService reset complete.')
	
	} //<

	setLogLevel(newLevel: LogLevel | string): void { //>
		this.utils.log(LogLevel.Info, `VSCodeAPISimulatorService.setLogLevel called with: ${newLevel}`)
		let targetLevel: LogLevel | undefined

		if (typeof newLevel === 'string') {
			const lowerLevel = newLevel.toLowerCase()
			switch (lowerLevel) {
				case 'off': targetLevel = LogLevel.Off; break
				case 'trace': targetLevel = LogLevel.Trace; break
				case 'debug': targetLevel = LogLevel.Debug; break
				case 'info': targetLevel = LogLevel.Info; break
				case 'warn':
				case 'warning':
					targetLevel = LogLevel.Warning; break
				case 'error': targetLevel = LogLevel.Error; break
				default:
					this.utils.warn(`VSCodeAPISimulatorService.setLogLevel: Invalid log level string '${newLevel}'. No change.`)
					return
			}
		
		}
		else if (typeof newLevel === 'number' && LogLevel[newLevel] !== undefined) {
			targetLevel = newLevel as LogLevel
		
		}
		else {
			this.utils.warn(`VSCodeAPISimulatorService.setLogLevel: Invalid log level type or value '${newLevel}'. No change.`)
			return
		
		}

		if (targetLevel !== undefined) {
			this.utils.setLogLevel(targetLevel)
		
		}
	
	} //<

}
