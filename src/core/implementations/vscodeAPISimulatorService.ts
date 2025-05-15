// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type {
	FileType as LocalFileType,
} from '../../_vscCore/vscEnums.ts'
import {
	LogLevel as LocalLogLevel, // Renamed to avoid conflict with parameter name
	ViewColumn,
	UIKind,
	DiagnosticSeverity,
	QuickPickItemKind,
	StatusBarAlignment,
	TreeItemCollapsibleState,
	EndOfLine,
	TextEditorRevealType, // ADDED
	ExtensionKind, // ADDED
	ConfigurationTarget, // ADDED
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
	TextEdit as LocalTextEdit, // Alias local mock
} from '../../_vscCore/vscClasses.ts'
import type { MockFileSystemErrorNamespace, TextEditFactory } from '../../_vscCore/_vscInterfaces.ts'

import type { FileSystemError as LocalFileSystemError } from '../../_vscCore/vscFileSystemError.ts'

// Alias local mock

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../_interfaces/IEventBusService.ts'

// IMockNodePathService is no longer directly injected here
import type { IUriService } from '../../modules/fileSystem/_interfaces/IUriService.ts'

// Path updated
import type { IVSCodeAPISimulatorService, IVSCodeAPISimulatorVFSHelpers } from '../_interfaces/IVSCodeAPISimulatorService.ts'
import type { ICommandsModule } from '../../modules/commands/_interfaces/ICommandsModule.ts'
import type { IEnvModule } from '../../modules/env/_interfaces/IEnvModule.ts'
import type { IExtensionsModule } from '../../modules/extensions/_interfaces/IExtensionsModule.ts'
import type { IWindowModule } from '../../modules/window/_interfaces/IWindowModule.ts'
import type { IWorkspaceModule } from '../../modules/workspace/_interfaces/IWorkspaceModule.ts'

import type { IFileSystemModule } from '../../modules/fileSystem/_interfaces/IFileSystemModule.ts'

// Added
import type { IMockNodePathService } from '../../modules/nodePath/_interfaces/IMockNodePathService.ts'
import type { INodeFsService } from '../../modules/nodeFs/_interfaces/INodeFsService.ts'
import type { IFileSystemStructure } from '../../modules/fileSystem/_interfaces/IFileSystemStateService.ts'

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
	readonly _fileSystemModule: IFileSystemModule
	readonly _nodeFsService: INodeFsService
	private readonly _nodePathServiceInstance: IMockNodePathService
	readonly vfs: IVSCodeAPISimulatorVFSHelpers;

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		@inject('IWorkspaceModule') workspaceModule: IWorkspaceModule,
		@inject('IWindowModule') windowModule: IWindowModule,
		@inject('ICommandsModule') commandsModule: ICommandsModule,
		@inject('IEnvModule') envModule: IEnvModule,
		@inject('IExtensionsModule') extensionsModule: IExtensionsModule,
		@inject('IFileSystemModule') fileSystemModule: IFileSystemModule,
		@inject('INodeFsService') nodeFsService: INodeFsService, // Injected
		@inject('IMockNodePathService') nodePathServiceInstance: IMockNodePathService, // MODIFIED: Injected IMockNodePathService
	) {
		this.utils.log(LocalLogLevel.Debug, 'VSCodeAPISimulatorService initializing...')
		this._workspaceModule = workspaceModule
		this._windowModule = windowModule
		this._commandsModule = commandsModule
		this._envModule = envModule
		this._extensionsModule = extensionsModule
		this._fileSystemModule = fileSystemModule
		this._nodeFsService = nodeFsService // Assigned
		this._nodePathServiceInstance = nodePathServiceInstance // MODIFIED: Assigned

		this.vfs = {
			populate: async (structure: IFileSystemStructure): Promise<void> => {
				await this._fileSystemModule._fileSystemStateService.populate(structure)
			},
			populateSync: (structure: IFileSystemStructure): void => {
				this._fileSystemModule._fileSystemStateService.populateSync(structure)
			},
		}

		this.utils.log(LocalLogLevel.Debug, 'VSCodeAPISimulatorService initialized.')

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
	get FileSystemError(): typeof LocalFileSystemError { return this._workspaceModule.FileSystemError } // Corrected type hint
	get FileType(): typeof LocalFileType { return this._workspaceModule.FileType } // WorkspaceModule still exposes this (from _vscCore)
	get CancellationTokenSource(): typeof LocalCancellationTokenSource { return this._workspaceModule.CancellationTokenSource } // Corrected type hint
	get TextEdit(): typeof LocalTextEdit { return LocalTextEdit } // Corrected type hint

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
	get LogLevel(): typeof LocalLogLevel { return LocalLogLevel } // Expose the enum
	get TextEditorRevealType(): typeof TextEditorRevealType { return TextEditorRevealType } // ADDED
	get ExtensionKind(): typeof ExtensionKind { return ExtensionKind } // ADDED
	get ConfigurationTarget(): typeof ConfigurationTarget { return ConfigurationTarget } // ADDED

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public Path Service Accessor (for test helpers)                                                 │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	get path(): IMockNodePathService { return this._nodePathServiceInstance } // MODIFIED: Use directly injected instance
	get nodePathService(): IMockNodePathService { return this._nodePathServiceInstance; } // MODIFIED: Use directly injected instance
	get nodeFsService(): INodeFsService { return this._nodeFsService; } // Implement getter

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
		this.utils.log(LocalLogLevel.Info, 'Resetting VSCodeAPISimulatorService...')

		await this._workspaceModule.reset()
		await this._windowModule.reset()
		await this._commandsModule.reset()
		await this._envModule.reset()
		await this._extensionsModule.reset()
		await this._fileSystemModule.reset()
		// Assuming INodeFsService might have a reset method if it becomes stateful
		// For now, if it's purely delegating to VFSStateService, its state is reset via VFSStateService.
		// If NodeFsService itself had internal state (e.g. open file descriptors mock), it would need:
		// await (this._nodeFsService as any)._reset?.()

		this.eventBus.reset()

		this.utils.log(LocalLogLevel.Debug, 'VSCodeAPISimulatorService reset complete.')

	} //<

	// ...
	setLogLevel(level: LocalLogLevel | string): void { //>
		this.utils.log(LocalLogLevel.Info, `VSCodeAPISimulatorService.setLogLevel called with: ${level}`);
		let targetLevel: LocalLogLevel | undefined;

		if (typeof level === 'string') {
			const lowerLevel = level.toLowerCase();
			switch (lowerLevel) {
				case 'off': targetLevel = LocalLogLevel.Off; break;
				case 'trace': targetLevel = LocalLogLevel.Trace; break;
				case 'debug': targetLevel = LocalLogLevel.Debug; break;
				case 'info': targetLevel = LocalLogLevel.Info; break;
				case 'warning': targetLevel = LocalLogLevel.Warning; break;
				case 'error': targetLevel = LocalLogLevel.Error; break;
				default:
					this.utils.warn(`VSCodeAPISimulatorService.setLogLevel: Invalid log level string '${level}'. No change will be made.`);
					return;
			}
		} else if (typeof level === 'number' && LocalLogLevel[level] !== undefined) {
			// Check if the number is a valid enum value
			targetLevel = level as LocalLogLevel;
		} else {
			this.utils.warn(`VSCodeAPISimulatorService.setLogLevel: Invalid log level type or value '${level}'. No change will be made.`);
			return;
		}

		if (targetLevel !== undefined) {
			this.utils.setLogLevel(targetLevel);
		}
	} //<
}