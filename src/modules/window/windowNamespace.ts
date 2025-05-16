// ESLint & Imports --------->>

//= TSYRINGE ==================================================================================================
import { inject, injectable } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel, StatusBarAlignment } from '../../_vscCore/vscEnums.ts'
import { Disposable } from '../../_vscCore/vscClasses.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../core/_interfaces/IEventBusService.ts'
import type { ITextEditorService } from './_interfaces/ITextEditorService.ts'
import type { IUserInteractionService } from './_interfaces/IUserInteractionService.ts'
import type { ITerminalService } from './_interfaces/ITerminalService.ts'
import type { IOutputChannelService } from './_interfaces/IOutputChannelService.ts'
import type { IWorkspaceModule } from '../workspace/_interfaces/IWorkspaceModule.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../workspace/implementations/textDocument.ts'
import type { IWindowNamespace } from './_interfaces/IWindowNamespace.ts'

//= MISC ======================================================================================================
import { URI as Uri } from 'vscode-uri'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
export class WindowNamespace implements IWindowNamespace {

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		// Correct the injection token and type hint
		@inject('IWorkspaceModule') private workspaceModule: IWorkspaceModule,
		@inject('ITextEditorService') private textEditorService: ITextEditorService,
		@inject('IUserInteractionService') private userInteractionService: IUserInteractionService,
		@inject('ITerminalService') private terminalService: ITerminalService,
		@inject('IOutputChannelService') private outputChannelService: IOutputChannelService,
	) {
		this.utils.log(LogLevel.Debug, 'WindowNamespace initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get activeTerminal(): vt.Terminal | undefined { return this.terminalService.activeTerminal }

	get activeTextEditor(): vt.TextEditor | undefined { return this.textEditorService.activeTextEditor }

	get onDidChangeActiveTerminal() { return this.eventBus.getOnDidChangeActiveTerminalEvent() }

	get onDidChangeActiveTextEditor() { return this.eventBus.getOnDidChangeActiveTextEditorEvent() }

	get onDidChangeTextEditorOptions() { return this.eventBus.getOnDidChangeTextEditorOptionsEvent() }

	get onDidChangeTextEditorSelection() { return this.eventBus.getOnDidChangeTextEditorSelectionEvent() }

	get onDidChangeTextEditorViewColumn() { return this.eventBus.getOnDidChangeTextEditorViewColumnEvent() }

	get onDidChangeTextEditorVisibleRanges() { return this.eventBus.getOnDidChangeTextEditorVisibleRangesEvent() }

	get onDidChangeWindowState() { return this.eventBus.getOnDidChangeWindowStateEvent() }

	get onDidChangeVisibleTextEditors() { return this.eventBus.getOnDidChangeVisibleTextEditorsEvent() }

	get onDidCloseTerminal() { return this.eventBus.getOnDidCloseTerminalEvent() }

	get onDidOpenTerminal() { return this.eventBus.getOnDidOpenTerminalEvent() }

	get terminals(): readonly vt.Terminal[] { return this.terminalService.terminals }

	get visibleTextEditors(): readonly vt.TextEditor[] { return this.textEditorService.visibleTextEditors }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	createOutputChannel( //>
		name: string, languageId?: string
	): vt.OutputChannel
	createOutputChannel(
		name: string, options: { log: true }
	): vt.LogOutputChannel
	createOutputChannel(
		name: string,
		optionsOrLanguageId?: string | { log: true },
	): vt.OutputChannel | vt.LogOutputChannel {
		// Cast needed due to overloads
		return this.outputChannelService.createOutputChannel(name, optionsOrLanguageId as any)
	
	} //<

	createStatusBarItem( //>
		idOrAlignment?: string | vt.StatusBarAlignment,
		alignmentOrPriority?: vt.StatusBarAlignment | number,
		priority?: number,
	): vt.StatusBarItem {
		let id: string | undefined
		let alignment: vt.StatusBarAlignment = StatusBarAlignment.Left // Refactored VSCode value
		let finalPriority: number | undefined

		if (typeof idOrAlignment === 'string') {
			// Overload 2: createStatusBarItem(id: string, alignment?: StatusBarAlignment, priority?: number)
			id = idOrAlignment

			// Now determine alignment and priority based on the next arguments
			if (typeof alignmentOrPriority === 'number') {
				// Second argument is a number. Could be alignment or priority.
				if (typeof priority === 'number') {
					// Three arguments: id, alignment, priority
					alignment = alignmentOrPriority as vt.StatusBarAlignment // Second arg is alignment
					finalPriority = priority // Third arg is priority
				
				}
				else {
					// Two arguments: id, priority
					finalPriority = alignmentOrPriority // Second arg is priority
					// alignment remains default Left
				
				}
			
			}
			else if (alignmentOrPriority !== undefined) {
				// Second argument is StatusBarAlignment (or undefined).
				// Two arguments: id, alignment (priority is undefined)
				alignment = alignmentOrPriority // Second arg is alignment
				finalPriority = priority // Third arg (if any) is priority, otherwise undefined
			
			}
			else {
				// Only one argument: id (alignment and priority are default/undefined)
				// alignment remains default Left
				finalPriority = priority // Third arg (if any) is priority, otherwise undefined
			
			}

		}
		else if (typeof idOrAlignment === 'number') {
			// Overload 1: createStatusBarItem(alignment?: StatusBarAlignment, priority?: number)
			alignment = idOrAlignment // First arg is alignment
			finalPriority = alignmentOrPriority as number | undefined // Second arg is priority
			// id remains undefined
		
		}

		this.utils.log(
			LogLevel.Debug,
			`[UI MOCK] Creating StatusBarItem (ID: ${id}, Align: ${alignment}, Prio: ${finalPriority})`,
		)

		const item: vt.StatusBarItem = { //>
			id: id ?? `mock-statusbar-${Math.random().toString(36).substring(2, 9)}`,
			alignment,
			priority: finalPriority,
			text: '',
			tooltip: undefined,
			color: undefined,
			backgroundColor: undefined,
			command: undefined,
			name: undefined,
			accessibilityInformation: undefined,
			show: () => { this.utils.log(LogLevel.Trace, `[UI MOCK] StatusBarItem ${item.id}.show()`) },
			hide: () => { this.utils.log(LogLevel.Trace, `[UI MOCK] StatusBarItem ${item.id}.hide()`) },
			dispose: () => { this.utils.log(LogLevel.Debug, `[UI MOCK] StatusBarItem ${item.id}.dispose()`) },
		} //<

		return item
	
	} //<

	createTerminal( //>
		name?: string,
		shellPath?: string,
		shellArgs?: string | readonly string[]
	): vt.Terminal
	createTerminal(
		options: vt.TerminalOptions
	): vt.Terminal
	createTerminal(
		options: vt.ExtensionTerminalOptions
	): vt.Terminal
	createTerminal(
		nameOrOptions?: string | vt.TerminalOptions | vt.ExtensionTerminalOptions,
		shellPath?: string,
		shellArgs?: string[] | string,
	): vt.Terminal {
		// Cast needed due to overloads
		return this.terminalService.createTerminal(nameOrOptions as any, shellPath, shellArgs)
	
	} //<

	registerTreeDataProvider( //>
		viewId: string,
		_treeDataProvider: vt.TreeDataProvider<any>,
	): vt.Disposable {
		this.utils.log(LogLevel.Info, `[UI MOCK] registerTreeDataProvider called for view: ${viewId}`)

		return new Disposable(() => {
			this.utils.log(LogLevel.Debug, `[UI MOCK] Disposing TreeDataProvider for view: ${viewId}`)
		
		})
	
	} //<

	showErrorMessage( //>
		message: string,
		...args: any[]
	): Thenable<any | undefined> {
		return this.userInteractionService.showErrorMessage(message, ...args)
	
	} //<

	showInformationMessage( //>
		message: string,
		...args: any[]
	): Thenable<any | undefined> {
		return this.userInteractionService.showInformationMessage(message, ...args)
	
	} //<

	showInputBox( //>
		options?: vt.InputBoxOptions,
		token?: vt.CancellationToken,
	): Thenable<string | undefined> {
		return this.userInteractionService.showInputBox(options, token)
	
	} //<

	showQuickPick( //>
		items: readonly string[] | Thenable<readonly string[]>,
		options?: vt.QuickPickOptions,
		token?: vt.CancellationToken
	): Thenable<string | undefined>
	showQuickPick<T extends vt.QuickPickItem>(
		items: readonly T[] | Thenable<readonly T[]>,
		options?: vt.QuickPickOptions,
		token?: vt.CancellationToken
	): Thenable<T | undefined>
	showQuickPick(
		items: any,
		options?: vt.QuickPickOptions,
		token?: vt.CancellationToken,
	): Thenable<any | undefined> {
		return this.userInteractionService.showQuickPick(items, options, token)
	
	} //<

	showTextDocument( //>
		document: vt.TextDocument,
		column?: vt.ViewColumn, preserveFocus?: boolean
	): Promise<vt.TextEditor>
	async showTextDocument(
		document: vt.TextDocument,
		options?: vt.TextDocumentShowOptions
	): Promise<vt.TextEditor>
	async showTextDocument(
		uri: vt.Uri,
		options?: vt.TextDocumentShowOptions
	): Promise<vt.TextEditor>
	async showTextDocument(
		documentOrUri: vt.TextDocument | Uri,
		optionsOrColumn?: vt.TextDocumentShowOptions | vt.ViewColumn,
		preserveFocusLegacy?: boolean,
	): Promise<vt.TextEditor> {
		this.utils.log(
			LogLevel.Info,
			`window.showTextDocument called for: `
			+ `${documentOrUri instanceof Uri
				? documentOrUri.toString()
				: (documentOrUri as vt.TextDocument).uri.toString()}`,
		)

		let document: TextDocument
		let showOptions: vt.TextDocumentShowOptions | undefined

		if (documentOrUri instanceof Uri) {
			// Overload 3: (uri: Uri, options?: TextDocumentShowOptions)
			if (typeof optionsOrColumn !== 'number') {
				showOptions = optionsOrColumn
			
			}
			try {
				document = await this.workspaceModule.workspace.openTextDocument(documentOrUri) as TextDocument
			
			}
			catch (e) {
				this.utils.error(`showTextDocument failed to open document: ${documentOrUri.toString()}`, e)
				throw e
			
			}
		
		}
		else {
			// Overloads 1 or 2: (document: TextDocument, ...)
			try {
				document = await this.workspaceModule.workspace.openTextDocument(documentOrUri.uri) as TextDocument
			
			}
			catch (e) {
				this.utils.error(`showTextDocument failed to re-open/find document: ${documentOrUri.uri.toString()}`, e)
				throw e
			
			}

			if (typeof optionsOrColumn === 'number') {
				// Overload 1: (document: TextDocument, column?: ViewColumn, preserveFocus?: boolean)
				showOptions = {
					viewColumn: optionsOrColumn,
					preserveFocus: preserveFocusLegacy,
				}
			
			}
			else {
				// Overload 2: (document: TextDocument, options?: TextDocumentShowOptions)
				showOptions = optionsOrColumn
			
			}
		
		}

		if (document.isClosed) {
			throw this.utils.createError(`Cannot show closed document: ${document.uri.toString()}`)
		
		}

		return this.textEditorService.showTextDocument(document, showOptions)
	
	} //<

	showWarningMessage( //>
		message: string,
		...args: any[]
	): Thenable<any | undefined> {
		return this.userInteractionService.showWarningMessage(message, ...args)
	
	} //<

}
