// ESLint & Imports --------->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IEventBusService } from '../_interfaces/IEventBusService.ts'

//= CLASSES ===================================================================================================
import { EventEmitter } from '../../_vscCore/vscClasses.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class EventBusService implements IEventBusService {

	//= Workspace Emitters ======================================================
	private _onDidChangeWorkspaceFolders!: EventEmitter<vt.WorkspaceFoldersChangeEvent>
	private _onDidOpenTextDocument!: EventEmitter<vt.TextDocument>
	private _onDidCloseTextDocument!: EventEmitter<vt.TextDocument>
	private _onDidSaveTextDocument!: EventEmitter<vt.TextDocument>
	private _onWillSaveTextDocument!: EventEmitter<vt.TextDocumentWillSaveEvent>
	private _onDidChangeTextDocument!: EventEmitter<vt.TextDocumentChangeEvent>
	private _onDidCreateFiles!: EventEmitter<vt.FileCreateEvent>
	private _onDidDeleteFiles!: EventEmitter<vt.FileDeleteEvent>
	private _onDidRenameFiles!: EventEmitter<vt.FileRenameEvent>
	private _onWillCreateFiles!: EventEmitter<vt.FileWillCreateEvent>
	private _onWillDeleteFiles!: EventEmitter<vt.FileWillDeleteEvent>
	private _onWillRenameFiles!: EventEmitter<vt.FileWillRenameEvent>
	private _onDidChangeConfiguration!: EventEmitter<vt.ConfigurationChangeEvent>

	//= Window Emitters =========================================================
	private _onDidChangeActiveTextEditor!: EventEmitter<vt.TextEditor | undefined>
	private _onDidChangeVisibleTextEditors!: EventEmitter<readonly vt.TextEditor[]>
	private _onDidChangeTextEditorSelection!: EventEmitter<vt.TextEditorSelectionChangeEvent>
	private _onDidChangeTextEditorVisibleRanges!: EventEmitter<vt.TextEditorVisibleRangesChangeEvent>
	private _onDidChangeTextEditorOptions!: EventEmitter<vt.TextEditorOptionsChangeEvent>
	private _onDidChangeTextEditorViewColumn!: EventEmitter<vt.TextEditorViewColumnChangeEvent>
	private _onDidChangeWindowState!: EventEmitter<vt.WindowState>
	private _onDidOpenTerminal!: EventEmitter<vt.Terminal>
	private _onDidCloseTerminal!: EventEmitter<vt.Terminal>
	private _onDidChangeActiveTerminal!: EventEmitter<vt.Terminal | undefined>

	//= Env Emitters ============================================================
	private _onDidChangeLogLevel!: EventEmitter<vt.LogLevel>

	//= Extensions Emitters =====================================================
	private _onDidChangeExtensions!: EventEmitter<void>

	constructor(

	) {
		this.initializeEmitters()
	
	}

	private initializeEmitters(): void { //> Method to initialize/re-initialize emitters
		// Workspace
		this._onDidChangeWorkspaceFolders = new EventEmitter<vt.WorkspaceFoldersChangeEvent>()
		this._onDidOpenTextDocument = new EventEmitter<vt.TextDocument>()
		this._onDidCloseTextDocument = new EventEmitter<vt.TextDocument>()
		this._onDidSaveTextDocument = new EventEmitter<vt.TextDocument>()
		this._onWillSaveTextDocument = new EventEmitter<vt.TextDocumentWillSaveEvent>()
		this._onDidChangeTextDocument = new EventEmitter<vt.TextDocumentChangeEvent>()
		this._onDidCreateFiles = new EventEmitter<vt.FileCreateEvent>()
		this._onDidDeleteFiles = new EventEmitter<vt.FileDeleteEvent>()
		this._onDidRenameFiles = new EventEmitter<vt.FileRenameEvent>()
		this._onWillCreateFiles = new EventEmitter<vt.FileWillCreateEvent>()
		this._onWillDeleteFiles = new EventEmitter<vt.FileWillDeleteEvent>()
		this._onWillRenameFiles = new EventEmitter<vt.FileWillRenameEvent>()
		this._onDidChangeConfiguration = new EventEmitter<vt.ConfigurationChangeEvent>()

		// Window
		this._onDidChangeActiveTextEditor = new EventEmitter<vt.TextEditor | undefined>()
		this._onDidChangeVisibleTextEditors = new EventEmitter<readonly vt.TextEditor[]>()
		this._onDidChangeTextEditorSelection = new EventEmitter<vt.TextEditorSelectionChangeEvent>()
		this._onDidChangeTextEditorVisibleRanges = new EventEmitter<vt.TextEditorVisibleRangesChangeEvent>()
		this._onDidChangeTextEditorOptions = new EventEmitter<vt.TextEditorOptionsChangeEvent>()
		this._onDidChangeTextEditorViewColumn = new EventEmitter<vt.TextEditorViewColumnChangeEvent>()
		this._onDidChangeWindowState = new EventEmitter<vt.WindowState>()
		this._onDidOpenTerminal = new EventEmitter<vt.Terminal>()
		this._onDidCloseTerminal = new EventEmitter<vt.Terminal>()
		this._onDidChangeActiveTerminal = new EventEmitter<vt.Terminal | undefined>()

		// Env
		this._onDidChangeLogLevel = new EventEmitter<vt.LogLevel>()

		// Extensions
		this._onDidChangeExtensions = new EventEmitter<void>()
	
	} //<

	//= Workspace Events ========================================================
	getOnDidChangeWorkspaceFoldersEvent = (): vt.Event<vt.WorkspaceFoldersChangeEvent> => this._onDidChangeWorkspaceFolders.event
	getOnDidOpenTextDocumentEvent = (): vt.Event<vt.TextDocument> => this._onDidOpenTextDocument.event
	getOnDidCloseTextDocumentEvent = (): vt.Event<vt.TextDocument> => this._onDidCloseTextDocument.event
	getOnDidSaveTextDocumentEvent = (): vt.Event<vt.TextDocument> => this._onDidSaveTextDocument.event
	getOnWillSaveTextDocumentEvent = (): vt.Event<vt.TextDocumentWillSaveEvent> => this._onWillSaveTextDocument.event
	getOnDidChangeTextDocumentEvent = (): vt.Event<vt.TextDocumentChangeEvent> => this._onDidChangeTextDocument.event
	getOnDidCreateFilesEvent = (): vt.Event<vt.FileCreateEvent> => this._onDidCreateFiles.event
	getOnDidDeleteFilesEvent = (): vt.Event<vt.FileDeleteEvent> => this._onDidDeleteFiles.event
	getOnDidRenameFilesEvent = (): vt.Event<vt.FileRenameEvent> => this._onDidRenameFiles.event
	getOnWillCreateFilesEvent = (): vt.Event<vt.FileWillCreateEvent> => this._onWillCreateFiles.event
	getOnWillDeleteFilesEvent = (): vt.Event<vt.FileWillDeleteEvent> => this._onWillDeleteFiles.event
	getOnWillRenameFilesEvent = (): vt.Event<vt.FileWillRenameEvent> => this._onWillRenameFiles.event
	getOnDidChangeConfigurationEvent = (): vt.Event<vt.ConfigurationChangeEvent> => this._onDidChangeConfiguration.event

	//= Window Events ===========================================================
	getOnDidChangeActiveTextEditorEvent = (): vt.Event<vt.TextEditor | undefined> => this._onDidChangeActiveTextEditor.event
	getOnDidChangeVisibleTextEditorsEvent = (): vt.Event<readonly vt.TextEditor[]> => this._onDidChangeVisibleTextEditors.event
	getOnDidChangeTextEditorSelectionEvent = (): vt.Event<vt.TextEditorSelectionChangeEvent> => this._onDidChangeTextEditorSelection.event
	getOnDidChangeTextEditorVisibleRangesEvent = (): vt.Event<vt.TextEditorVisibleRangesChangeEvent> => this._onDidChangeTextEditorVisibleRanges.event
	getOnDidChangeTextEditorOptionsEvent = (): vt.Event<vt.TextEditorOptionsChangeEvent> => this._onDidChangeTextEditorOptions.event
	getOnDidChangeTextEditorViewColumnEvent = (): vt.Event<vt.TextEditorViewColumnChangeEvent> => this._onDidChangeTextEditorViewColumn.event
	getOnDidChangeWindowStateEvent = (): vt.Event<vt.WindowState> => this._onDidChangeWindowState.event
	getOnDidOpenTerminalEvent = (): vt.Event<vt.Terminal> => this._onDidOpenTerminal.event
	getOnDidCloseTerminalEvent = (): vt.Event<vt.Terminal> => this._onDidCloseTerminal.event
	getOnDidChangeActiveTerminalEvent = (): vt.Event<vt.Terminal | undefined> => this._onDidChangeActiveTerminal.event

	//= Env Events ==============================================================
	getOnDidChangeLogLevelEvent = (): vt.Event<vt.LogLevel> => this._onDidChangeLogLevel.event

	//= Extensions Events =======================================================
	getOnDidChangeExtensionsEvent = (): vt.Event<void> => this._onDidChangeExtensions.event

	// ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │                                                                                                                    │
	// │                                                FIRE EVENTS                                                         │
	// │                                                                                                                    │
	// └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

	//= Workspace Events ========================================================
	fireOnDidChangeWorkspaceFolders = (e: vt.WorkspaceFoldersChangeEvent): void => this._onDidChangeWorkspaceFolders.fire(e)
	fireOnDidOpenTextDocument = (doc: vt.TextDocument): void => { //>
		this._onDidOpenTextDocument.fire(doc)
	
	} //<
	fireOnDidCloseTextDocument = (doc: vt.TextDocument): void => { //>
		this._onDidCloseTextDocument.fire(doc)
	
	} //<

	fireOnDidSaveTextDocument = (doc: vt.TextDocument): void => this._onDidSaveTextDocument.fire(doc)
	fireOnWillSaveTextDocument = (e: vt.TextDocumentWillSaveEvent): void => this._onWillSaveTextDocument.fire(e)
	fireOnDidChangeTextDocument = (e: vt.TextDocumentChangeEvent): void => this._onDidChangeTextDocument.fire(e)
	fireOnDidCreateFiles = (e: vt.FileCreateEvent): void => this._onDidCreateFiles.fire(e)
	fireOnDidDeleteFiles = (e: vt.FileDeleteEvent): void => this._onDidDeleteFiles.fire(e)
	fireOnDidRenameFiles = (e: vt.FileRenameEvent): void => this._onDidRenameFiles.fire(e)
	fireOnWillCreateFiles = (e: vt.FileWillCreateEvent): void => this._onWillCreateFiles.fire(e)
	fireOnWillDeleteFiles = (e: vt.FileWillDeleteEvent): void => this._onWillDeleteFiles.fire(e)
	fireOnWillRenameFiles = (e: vt.FileWillRenameEvent): void => this._onWillRenameFiles.fire(e)
	fireOnDidChangeConfiguration = (e: vt.ConfigurationChangeEvent): void => this._onDidChangeConfiguration.fire(e)

	//= Window Events ===========================================================
	fireOnDidChangeActiveTextEditor = (editor: vt.TextEditor | undefined): void => this._onDidChangeActiveTextEditor.fire(editor)
	fireOnDidChangeVisibleTextEditors = (editors: readonly vt.TextEditor[]): void => this._onDidChangeVisibleTextEditors.fire(editors)
	fireOnDidChangeTextEditorSelection = (e: vt.TextEditorSelectionChangeEvent): void => this._onDidChangeTextEditorSelection.fire(e)
	fireOnDidChangeTextEditorVisibleRanges = (e: vt.TextEditorVisibleRangesChangeEvent): void => this._onDidChangeTextEditorVisibleRanges.fire(e)
	fireOnDidChangeTextEditorOptions = (e: vt.TextEditorOptionsChangeEvent): void => this._onDidChangeTextEditorOptions.fire(e)
	fireOnDidChangeTextEditorViewColumn = (e: vt.TextEditorViewColumnChangeEvent): void => this._onDidChangeTextEditorViewColumn.fire(e)
	fireOnDidChangeWindowState = (e: vt.WindowState): void => this._onDidChangeWindowState.fire(e)
	fireOnDidOpenTerminal = (terminal: vt.Terminal): void => this._onDidOpenTerminal.fire(terminal)
	fireOnDidCloseTerminal = (terminal: vt.Terminal): void => this._onDidCloseTerminal.fire(terminal)
	fireOnDidChangeActiveTerminal = (terminal: vt.Terminal | undefined): void => this._onDidChangeActiveTerminal.fire(terminal)

	//= Env Events ==============================================================
	fireOnDidChangeLogLevel = (level: vt.LogLevel): void => this._onDidChangeLogLevel.fire(level)

	//= Extensions Events =======================================================
	fireOnDidChangeExtensions = (): void => this._onDidChangeExtensions.fire()

	reset = (): void => { //> Update reset logic
		// Dispose all existing emitters
		this._onDidChangeWorkspaceFolders.dispose()
		this._onDidOpenTextDocument.dispose()
		this._onDidCloseTextDocument.dispose()
		this._onDidSaveTextDocument.dispose()
		this._onWillSaveTextDocument.dispose()
		this._onDidChangeTextDocument.dispose()
		this._onDidCreateFiles.dispose()
		this._onDidDeleteFiles.dispose()
		this._onDidRenameFiles.dispose()
		this._onWillCreateFiles.dispose()
		this._onWillDeleteFiles.dispose()
		this._onWillRenameFiles.dispose()
		this._onDidChangeConfiguration.dispose()

		this._onDidChangeActiveTextEditor.dispose()
		this._onDidChangeVisibleTextEditors.dispose()
		this._onDidChangeTextEditorSelection.dispose()
		this._onDidChangeTextEditorVisibleRanges.dispose()
		this._onDidChangeTextEditorOptions.dispose()
		this._onDidChangeTextEditorViewColumn.dispose()
		this._onDidChangeWindowState.dispose()
		this._onDidOpenTerminal.dispose()
		this._onDidCloseTerminal.dispose()
		this._onDidChangeActiveTerminal.dispose()

		this._onDidChangeLogLevel.dispose()
		this._onDidChangeExtensions.dispose()

		// Re-initialize with new emitters
		this.initializeEmitters()

	} //<

}
