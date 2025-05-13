// ESLint & Imports -->>

//= IMPLEMENTATIONS ===========================================================================================
import { container } from './module_injection.ts'
import type { IVSCodeAPISimulatorService } from './core/_interfaces/IVSCodeAPISimulatorService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * The entry point for the Mockly VS Code API simulator.
 * Resolves the main simulator service from the DI container and exposes
 * the public `mockly` namespace (simulating `vscode`) and a `reset` method for test control.
 */
const simulator = container.resolve<IVSCodeAPISimulatorService>('IVSCodeAPISimulatorService')

// Construct the public 'mockly' object by exposing properties from the simulator
// This object simulates the structure of the real 'vscode' namespace.
const mockly = {
	// Namespaces
	workspace: simulator.workspace,
	window: simulator.window,
	commands: simulator.commands,
	extensions: simulator.extensions,
	env: simulator.env,

	// Top-level types, enums, and classes
	Uri: simulator.Uri, // Now correctly sourced from simulator._fileSystemModule.Uri via simulator.Uri
	FileType: simulator.FileType, // Sourced from simulator._workspaceModule.FileType (which gets it from _vscCore)
	CancellationTokenSource: simulator.CancellationTokenSource, // Sourced from simulator._workspaceModule.CancellationTokenSource (from _vscCore)
	Position: simulator.Position, // From simulator (directly from _vscCore)
	Range: simulator.Range, // From simulator (directly from _vscCore)
	Selection: simulator.Selection, // From simulator (directly from _vscCore)
	Location: simulator.Location, // From simulator (directly from _vscCore)
	RelativePattern: simulator.RelativePattern, // From simulator (directly from _vscCore)
	Diagnostic: simulator.Diagnostic, // From simulator (directly from _vscCore)
	Disposable: simulator.Disposable, // From simulator (directly from _vscCore)
	EventEmitter: simulator.EventEmitter, // From simulator (directly from _vscCore)
	ThemeColor: simulator.ThemeColor, // From simulator (directly from _vscCore)
	ThemeIcon: simulator.ThemeIcon, // From simulator (directly from _vscCore)
	TreeItem: simulator.TreeItem, // From simulator (directly from _vscCore)
	WorkspaceEdit: simulator.WorkspaceEdit, // From simulator (directly from _vscCore)
	DiagnosticSeverity: simulator.DiagnosticSeverity, // From simulator (directly from _vscCore)
	QuickPickItemKind: simulator.QuickPickItemKind, // From simulator (directly from _vscCore)
	ViewColumn: simulator.ViewColumn, // From simulator (directly from _vscCore)
	StatusBarAlignment: simulator.StatusBarAlignment, // From simulator (directly from _vscCore)
	TreeItemCollapsibleState: simulator.TreeItemCollapsibleState, // From simulator (directly from _vscCore)
	UIKind: simulator.UIKind, // From simulator (directly from _vscCore)
	EndOfLine: simulator.EndOfLine, // From simulator (directly from _vscCore)
	TextEdit: simulator.TextEdit, // Sourced from simulator.TextEdit (which gets it from _vscCore)
	FileSystemError: simulator.FileSystemError, // Sourced from simulator._workspaceModule.FileSystemError (from _vscCore)

	// Other top-level properties from the simulator
	version: simulator.version,

	// Node.js like utilities
	node: {
		path: simulator.nodePathService,
		fs: simulator.nodeFsService, // Add the fs service
	},

}

// Export the public mockly object and the simulator instance (for reset and internal access in tests)
export { mockly, simulator as vscodeSimulator }
