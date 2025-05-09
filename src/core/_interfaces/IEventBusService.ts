// ESLint & Imports --------->>

import type { LogLevel } from '../../_vscCore/vscEnums.ts'
import type * as vscode from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

export type LogFunction = (level: LogLevel, message: string) => void

/**
 * Manages and provides access to the EventEmitter instances used
 * throughout the mock VS Code API simulation.
 */
export interface IEventBusService {

    // Workspace Events ------------------------------------------------------->>

    getOnDidChangeWorkspaceFoldersEvent: () => vscode.Event<vscode.WorkspaceFoldersChangeEvent>
    fireOnDidChangeWorkspaceFolders: (e: vscode.WorkspaceFoldersChangeEvent) => void

    getOnDidOpenTextDocumentEvent: () => vscode.Event<vscode.TextDocument>
    fireOnDidOpenTextDocument: (doc: vscode.TextDocument) => void

    getOnDidCloseTextDocumentEvent: () => vscode.Event<vscode.TextDocument>
    fireOnDidCloseTextDocument: (doc: vscode.TextDocument) => void

    getOnDidSaveTextDocumentEvent: () => vscode.Event<vscode.TextDocument>
    fireOnDidSaveTextDocument: (doc: vscode.TextDocument) => void

    // TODO: Define TextDocumentWillSaveEvent if needed, or use vscode.TextDocumentWillSaveEvent
    getOnWillSaveTextDocumentEvent: () => vscode.Event<vscode.TextDocumentWillSaveEvent>
    fireOnWillSaveTextDocument: (e: vscode.TextDocumentWillSaveEvent) => void

    getOnDidChangeTextDocumentEvent: () => vscode.Event<vscode.TextDocumentChangeEvent>
    fireOnDidChangeTextDocument: (e: vscode.TextDocumentChangeEvent) => void

    getOnDidCreateFilesEvent: () => vscode.Event<vscode.FileCreateEvent>
    fireOnDidCreateFiles: (e: vscode.FileCreateEvent) => void

    getOnDidDeleteFilesEvent: () => vscode.Event<vscode.FileDeleteEvent>
    fireOnDidDeleteFiles: (e: vscode.FileDeleteEvent) => void

    getOnDidRenameFilesEvent: () => vscode.Event<vscode.FileRenameEvent>
    fireOnDidRenameFiles: (e: vscode.FileRenameEvent) => void

    getOnWillCreateFilesEvent: () => vscode.Event<vscode.FileWillCreateEvent>
    fireOnWillCreateFiles: (e: vscode.FileWillCreateEvent) => void

    getOnWillDeleteFilesEvent: () => vscode.Event<vscode.FileWillDeleteEvent>
    fireOnWillDeleteFiles: (e: vscode.FileWillDeleteEvent) => void

    getOnWillRenameFilesEvent: () => vscode.Event<vscode.FileWillRenameEvent>
    fireOnWillRenameFiles: (e: vscode.FileWillRenameEvent) => void

    getOnDidChangeConfigurationEvent: () => vscode.Event<vscode.ConfigurationChangeEvent>
    fireOnDidChangeConfiguration: (e: vscode.ConfigurationChangeEvent) => void

    //--------------------------------------------------------------------------------------------<<
    // Window Events ---------------------------------------------------------->>

    getOnDidChangeActiveTextEditorEvent: () => vscode.Event<vscode.TextEditor | undefined>
    fireOnDidChangeActiveTextEditor: (editor: vscode.TextEditor | undefined) => void

    getOnDidChangeVisibleTextEditorsEvent: () => vscode.Event<readonly vscode.TextEditor[]>
    fireOnDidChangeVisibleTextEditors: (editors: readonly vscode.TextEditor[]) => void

    getOnDidChangeTextEditorSelectionEvent: () => vscode.Event<vscode.TextEditorSelectionChangeEvent>
    fireOnDidChangeTextEditorSelection: (e: vscode.TextEditorSelectionChangeEvent) => void

    getOnDidChangeTextEditorVisibleRangesEvent: () => vscode.Event<vscode.TextEditorVisibleRangesChangeEvent>
    fireOnDidChangeTextEditorVisibleRanges: (e: vscode.TextEditorVisibleRangesChangeEvent) => void

    getOnDidChangeTextEditorOptionsEvent: () => vscode.Event<vscode.TextEditorOptionsChangeEvent>
    fireOnDidChangeTextEditorOptions: (e: vscode.TextEditorOptionsChangeEvent) => void

    getOnDidChangeTextEditorViewColumnEvent: () => vscode.Event<vscode.TextEditorViewColumnChangeEvent>
    fireOnDidChangeTextEditorViewColumn: (e: vscode.TextEditorViewColumnChangeEvent) => void

    getOnDidChangeWindowStateEvent: () => vscode.Event<vscode.WindowState>
    fireOnDidChangeWindowState: (e: vscode.WindowState) => void

    getOnDidOpenTerminalEvent: () => vscode.Event<vscode.Terminal>
    fireOnDidOpenTerminal: (terminal: vscode.Terminal) => void

    getOnDidCloseTerminalEvent: () => vscode.Event<vscode.Terminal>
    fireOnDidCloseTerminal: (terminal: vscode.Terminal) => void

    getOnDidChangeActiveTerminalEvent: () => vscode.Event<vscode.Terminal | undefined>
    fireOnDidChangeActiveTerminal: (terminal: vscode.Terminal | undefined) => void

    //--------------------------------------------------------------------------------------------<<
    // Env Events ------------------------------------------------------------->>

    getOnDidChangeLogLevelEvent: () => vscode.Event<vscode.LogLevel>
    fireOnDidChangeLogLevel: (level: vscode.LogLevel) => void

    //--------------------------------------------------------------------------------------------<<
    // Extensions Events ------------------------------------------------------>>

    getOnDidChangeExtensionsEvent: () => vscode.Event<void>
    fireOnDidChangeExtensions: () => void

    //--------------------------------------------------------------------------------------------<<
    
    /**
     * Resets all event emitters, clearing listeners.
     * Should be called during test teardown or simulator reset.
     */
    reset: () => void

}

