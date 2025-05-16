// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type {
	Position,
	Range,
	Selection,
	Location,
	RelativePattern,
	Diagnostic,
	Disposable,
	EventEmitter,
	ThemeColor,
	ThemeIcon,
	TreeItem,
	WorkspaceEdit,
	CancellationTokenSource,
	TextEdit,
} from '../../_vscCore/vscClasses.ts'
import type {
	FileType,
	DiagnosticSeverity,
	QuickPickItemKind,
	ViewColumn,
	StatusBarAlignment,
	TreeItemCollapsibleState,
	UIKind,
	EndOfLine,
	LogLevel, // Added LogLevel here for the new method signature
	TextEditorRevealType, // ADDED
	ExtensionKind, // ADDED
	ConfigurationTarget, // ADDED
} from '../../_vscCore/vscEnums.ts'
import type { FileSystemError } from '../../_vscCore/vscFileSystemError.ts'

//= INJECTED TYPES ============================================================================================
import type { ICommandsNamespace } from '../../modules/commands/_interfaces/ICommandsNamespace.ts'
import type { IEnvNamespace } from '../../modules/env/_interfaces/IEnvNamespace.ts'
import type { IExtensionsNamespace } from '../../modules/extensions/_interfaces/IExtensionsNamespace.ts'
import type { IMockNodePathService } from '../../modules/nodePath/_interfaces/IMockNodePathService.ts'
import type { IUriService } from '../../modules/fileSystem/_interfaces/IUriService.ts'
import type { IWindowNamespace } from '../../modules/window/_interfaces/IWindowNamespace.ts'
import type { IWorkspaceNamespace } from '../../modules/workspace/_interfaces/IWorkspaceNamespace.ts'
import type { ICommandsModule } from '../../modules/commands/_interfaces/ICommandsModule.ts'
import type { IEnvModule } from '../../modules/env/_interfaces/IEnvModule.ts'
import type { IExtensionsModule } from '../../modules/extensions/_interfaces/IExtensionsModule.ts'
import type { IFileSystemModule } from '../../modules/fileSystem/_interfaces/IFileSystemModule.ts'
import type { IWindowModule } from '../../modules/window/_interfaces/IWindowModule.ts'
import type { IWorkspaceModule } from '../../modules/workspace/_interfaces/IWorkspaceModule.ts'
import type { INodeFsService } from '../../modules/nodeFs/_interfaces/INodeFsService.ts'
import type { IFileSystemStructure } from '../../modules/fileSystem/_interfaces/IFileSystemStateService.ts'

//--------------------------------------------------------------------------------------------------------------<<

export interface IVSCodeAPISimulatorVFSHelpers { //>
	populate: (structure: IFileSystemStructure) => Promise<void>
	populateSync: (structure: IFileSystemStructure) => void
	// Future VFS helpers can be added here
} //<

export interface IVSCodeAPISimulatorService {
	// Namespaces
	readonly workspace: IWorkspaceNamespace
	readonly window: IWindowNamespace
	readonly commands: ICommandsNamespace
	readonly extensions: IExtensionsNamespace
	readonly env: IEnvNamespace

	// Core VSCode Types & Classes (re-exported for convenience)
	readonly Uri: IUriService // Use the correct service interface type
	readonly Position: typeof Position
	readonly Range: typeof Range
	readonly Selection: typeof Selection
	readonly Location: typeof Location
	readonly RelativePattern: typeof RelativePattern
	readonly Diagnostic: typeof Diagnostic
	readonly Disposable: typeof Disposable
	readonly EventEmitter: typeof EventEmitter
	readonly ThemeColor: typeof ThemeColor
	readonly ThemeIcon: typeof ThemeIcon
	readonly TreeItem: typeof TreeItem
	readonly WorkspaceEdit: typeof WorkspaceEdit
	readonly CancellationTokenSource: typeof CancellationTokenSource
	readonly TextEdit: typeof TextEdit
	readonly FileSystemError: typeof FileSystemError

	// Core VSCode Enums (re-exported for convenience)
	readonly FileType: typeof FileType
	readonly DiagnosticSeverity: typeof DiagnosticSeverity
	readonly QuickPickItemKind: typeof QuickPickItemKind
	readonly ViewColumn: typeof ViewColumn
	readonly StatusBarAlignment: typeof StatusBarAlignment
	readonly TreeItemCollapsibleState: typeof TreeItemCollapsibleState
	readonly UIKind: typeof UIKind
	readonly EndOfLine: typeof EndOfLine
	readonly LogLevel: typeof LogLevel // Expose LogLevel enum itself if needed by consumers
	readonly TextEditorRevealType: typeof TextEditorRevealType // ADDED
	readonly ExtensionKind: typeof ExtensionKind // ADDED
	readonly ConfigurationTarget: typeof ConfigurationTarget // ADDED

	// Version
	readonly version: string

	// Internal Modules (for advanced test control and verification)
	readonly _workspaceModule: IWorkspaceModule
	readonly _windowModule: IWindowModule
	readonly _commandsModule: ICommandsModule
	readonly _extensionsModule: IExtensionsModule
	readonly _envModule: IEnvModule
	readonly _fileSystemModule: IFileSystemModule

	// Public Path Service Accessor (for test helpers)
	readonly path: IMockNodePathService
	readonly nodePathService: IMockNodePathService
	readonly nodeFsService: INodeFsService
	readonly vfs: IVSCodeAPISimulatorVFSHelpers // New property

	reset: () => Promise<void>
	setLogLevel: (level: LogLevel | string) => void // New method signature
}
