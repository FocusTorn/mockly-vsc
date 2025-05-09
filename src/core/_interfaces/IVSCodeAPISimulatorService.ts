// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type { MockFileSystemErrorNamespace, TextEditFactory } from '../../_vscCore/_vscInterfaces.ts'
import type {
	Position as LocalPosition,
	Range as LocalRange,
	Selection as LocalSelection,
	Location as LocalLocation,
	RelativePattern as LocalRelativePattern,
	Diagnostic as LocalDiagnostic,
	Disposable as LocalDisposable,
	EventEmitter as LocalEventEmitter,
	ThemeColor as LocalThemeColor,
	ThemeIcon as LocalThemeIcon,
	TreeItem as LocalTreeItem,
	WorkspaceEdit as LocalWorkspaceEdit,
} from '../../_vscCore/vscClasses.ts'
import type {
	DiagnosticSeverity as LocalDiagnosticSeverity,
	QuickPickItemKind as LocalQuickPickItemKind,
	ViewColumn as LocalViewColumn,
	StatusBarAlignment as LocalStatusBarAlignment,
	TreeItemCollapsibleState as LocalTreeItemCollapsibleState,
	UIKind as LocalUIKind,
	FileType as LocalFileType,
	EndOfLine as LocalEndOfLine,
} from '../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { IWindowModule } from '../../modules/window/_interfaces/IWindowModule.ts'
import type { IWindowNamespace } from '../../modules/window/_interfaces/IWindowNamespace.ts'
import type { ICommandsModule } from '../../modules/commands/_interfaces/ICommandsModule.ts'
import type { ICommandsNamespace } from '../../modules/commands/_interfaces/ICommandsNamespace.ts'
import type { IEnvModule } from '../../modules/env/_interfaces/IEnvModule.ts'
import type { IEnvNamespace } from '../../modules/env/_interfaces/IEnvNamespace.ts'
import type { IExtensionsModule } from '../../modules/extensions/_interfaces/IExtensionsModule.ts'
import type { IExtensionsNamespace } from '../../modules/extensions/_interfaces/IExtensionsNamespace.ts'
import type { IWorkspaceModule } from '../../modules/workspace/_interfaces/IWorkspaceModule.ts'
import type { IWorkspaceNamespace } from '../../modules/workspace/_interfaces/IWorkspaceNamespace.ts'
import type { IFileSystemModule } from '../../modules/fileSystem/_interfaces/IFileSystemModule.ts'
import type { IUriService } from '../../modules/fileSystem/_interfaces/IUriService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Provides the mock implementations for the core VS Code API namespaces
 * like vscode.window, vscode.workspace, vscode.commands, etc.
 * Acts as the main facade for the `mockly.vscode` object, using
 * other services internally to manage state and behavior.
 * Exposes internal modules for testing and state inspection.
 */
export interface IVSCodeAPISimulatorService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public API Namespaces                                                                           │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly workspace: IWorkspaceNamespace
	readonly window: IWindowNamespace
	readonly commands: ICommandsNamespace
	readonly extensions: IExtensionsNamespace
	readonly env: IEnvNamespace

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public API Types, Classes, Enums (sourced from _vscCore or specific modules)                    │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly FileSystemError: MockFileSystemErrorNamespace // From _vscCore via WorkspaceModule or FileSystemModule
	readonly TextEdit: TextEditFactory // From _vscInterfaces via WorkspaceModule or directly
	readonly Uri: IUriService // From FileSystemModule

	readonly FileType: typeof LocalFileType // From _vscCore via WorkspaceModule or FileSystemModule
	readonly CancellationTokenSource: typeof vt.CancellationTokenSource // From _vscCore via WorkspaceModule
	readonly Position: typeof LocalPosition // From _vscCore
	readonly Range: typeof LocalRange // From _vscCore
	readonly Selection: typeof LocalSelection // From _vscCore
	readonly Location: typeof LocalLocation // From _vscCore
	readonly RelativePattern: typeof LocalRelativePattern // From _vscCore
	readonly Diagnostic: typeof LocalDiagnostic // From _vscCore
	readonly Disposable: typeof LocalDisposable // From _vscCore
	readonly EventEmitter: typeof LocalEventEmitter // From _vscCore
	readonly ThemeColor: typeof LocalThemeColor // From _vscCore
	readonly ThemeIcon: typeof LocalThemeIcon // From _vscCore
	readonly TreeItem: typeof LocalTreeItem // From _vscCore
	readonly WorkspaceEdit: typeof LocalWorkspaceEdit // From _vscCore
	readonly DiagnosticSeverity: typeof LocalDiagnosticSeverity // From _vscCore
	readonly QuickPickItemKind: typeof LocalQuickPickItemKind // From _vscCore
	readonly ViewColumn: typeof LocalViewColumn // From _vscCore
	readonly StatusBarAlignment: typeof LocalStatusBarAlignment // From _vscCore
	readonly TreeItemCollapsibleState: typeof LocalTreeItemCollapsibleState // From _vscCore
	readonly UIKind: typeof LocalUIKind // From _vscCore
	readonly EndOfLine: typeof LocalEndOfLine // From _vscCore

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Other Public API Properties                                                                     │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly version: string

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal Module Access (for testing and advanced integration)                                   │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly _commandsModule: ICommandsModule
	readonly _envModule: IEnvModule
	readonly _extensionsModule: IExtensionsModule
	readonly _windowModule: IWindowModule
	readonly _workspaceModule: IWorkspaceModule
	readonly _fileSystemModule: IFileSystemModule // Added

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Resets the state of all mocked VS Code API components.
	 * @returns A promise that resolves when the reset is complete.
	 */
	reset: () => Promise<void>

}