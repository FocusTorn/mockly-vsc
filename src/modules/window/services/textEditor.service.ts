// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { IWorkspaceModule } from '../../workspace/_interfaces/IWorkspaceModule.ts'
import type { ITextDocumentService } from '../../workspace/_interfaces/ITextDocumentService.ts' // Corrected import

//= IMPLEMENTATION TYPES ======================================================================================
import type { ITextEditorService } from '../_interfaces/ITextEditorService.ts'
import type { TextDocument } from '../../workspace/implementations/textDocument.ts'

//= IMPLEMENTATIONS ===========================================================================================
import { TextEditor } from '../implementations/textEditor.ts'
// import { TextDocumentService } from '../../workspace/services/textDocument.service.ts' // Removed direct import of implementation

//= MISC ======================================================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'
import { Selection } from '../../../_vscCore/vscClasses.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Service responsible for managing the state of active and visible text editors
 * within the mock environment.
 */
@injectable()
@singleton()
export class TextEditorService implements ITextEditorService {

    private _activeTextEditor: TextEditor | undefined = undefined
    private _visibleTextEditors: TextEditor[] = []

    /**
     * Constructs a new TextEditorService.
     * @param utils Core utility service for logging and errors.
     * @param eventBus Service for firing VS Code events.
     * @param workspaceModule The workspace module for accessing documents.
     * @param docService Service for managing text document state.
     */
    constructor(
        @inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
        @inject('IEventBusService') private eventBus: IEventBusService,
        @inject('IWorkspaceModule') private workspaceModule: IWorkspaceModule,
        @inject('ITextDocumentService') private docService: ITextDocumentService,
    ) { }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Getters                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /** @inheritdoc */
    get activeTextEditor(): TextEditor | undefined { return this._activeTextEditor }

    /** @inheritdoc */
    get visibleTextEditors(): readonly TextEditor[] { return this._visibleTextEditors }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /** @inheritdoc */
    setActiveTextEditor(editor: vt.TextEditor | undefined): void { //>
        this.utils.log( //> Debug: TextEditorService.setActiveTextEditor called
            LogLevel.Debug,
            `[CONTROL] TextEditorService.setActiveTextEditor called externally for: ${editor?.document?.uri.toString() ?? 'undefined'}`,
        ) //<

        if (editor === undefined) {
            this._setActiveTextEditor(undefined)
            return
        }

        // Validate that the passed editor is one of our MockTextEditor instances.
        // This prevents setting arbitrary objects as the active editor.
        if (editor instanceof TextEditor) {
            this._setActiveTextEditor(editor)
        }
        else {
            // If it's not our specific instance type, log an error.
            // Check if editor is defined before accessing properties, and use optional chaining.
            const uriString = editor ? editor.document?.uri.toString() ?? 'unknown URI' : 'undefined editor'

            this.utils.error( //> instance not created by this mock
                `[CONTROL] TextEditorService.setActiveTextEditor called with an editor instance not created by this mock environment: ${uriString}`,
            ) //<

            // Optionally, throw an error to fail the test explicitly:
            // throw new Error("setActiveTextEditor called with an invalid editor instance type.");

        }
    } //<

    /** @inheritdoc */
    setVisibleTextEditors(editors: vt.TextEditor[]): void { //>
        this.utils.log( //> Debug: TextEditorService.setVisibleTextEditors called
            LogLevel.Debug,
            `[CONTROL] TextEditorService.setVisibleTextEditors called externally with ${editors.length} editors.`,
        ) //<

        const mockEditors: TextEditor[] = []
        let allValid = true

        // Validate that all passed editors are our MockTextEditor instances.
        for (const editor of editors) {
            if (editor instanceof TextEditor) {
                mockEditors.push(editor)
            }
            else {
                // If it's not our specific instance type, log an error.
                // Safely access document property using optional chaining.
                const uriString = editor.document?.uri.toString() ?? 'unknown URI'

                this.utils.error( //> instance not created by this mock
                    `[CONTROL] TextEditorService.setVisibleTextEditors called with an editor instance not created by this mock environment: ${uriString}`,
                ) //<

                allValid = false
                // Optionally break early
                // break;
            }
        }

        if (allValid) {
            this._setVisibleTextEditors(mockEditors)
        }
        else {
            this.utils.error( //> invalid editor instances
                '[CONTROL] TextEditorService.setVisibleTextEditors failed due to invalid editor instances.',
            ) //<

            // Optionally, throw an error:
            // throw new Error("setVisibleTextEditors called with invalid editor instance types.");
        }
    } //<

    /** @inheritdoc */
    async showTextDocument( //>
        document: TextDocument,
        options?: vt.TextDocumentShowOptions,
    ): Promise<TextEditor> {

        this.utils.log(LogLevel.Info, `TextEditorService.showTextDocument called for ${document.uri.toString()}`)

        if (document.isClosed) {
            throw this.utils.createError(`Cannot show closed document: ${document.uri.toString()}`)
        }

        // Extract final options
        const viewColumn = options?.viewColumn
        const preserveFocus = options?.preserveFocus
        const selection = options?.selection

        const _preview = options?.preview // TODO: Handle preview flag

        // Find existing editor for this document or create a new one
        let editor = this._visibleTextEditors.find(e => e.document.uri.toString() === document.uri.toString())

        if (!editor) {
            editor = new TextEditor(document, viewColumn, this.utils, this.eventBus)
            this._setVisibleTextEditors([...this._visibleTextEditors, editor])
        }
        else if (viewColumn !== undefined && editor.viewColumn !== viewColumn) {
            editor._updateViewColumn(viewColumn)
            this.utils.log(LogLevel.Debug, `Moved editor ${editor.document.uri.toString()} to view column ${viewColumn}`)
        }

        if (selection) {
            const validSelection = document.validateRange(selection)
            editor._updateSelection(new Selection(validSelection.start, validSelection.end))
        }

        if (!preserveFocus) {
            this._setActiveTextEditor(editor)
        }

        // Since MockTextEditor implements vscode.TextEditor, and Promise implements Thenable,
        // returning the MockTextEditor satisfies the Promise<vscode.TextEditor> return type.
        return editor
    } //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /** @inheritdoc */
    _reset(): void { //>
        this.utils.log(LogLevel.Debug, 'Resetting TextEditorService state...')

        this._visibleTextEditors.forEach((editor) => {

            this.utils.log( //> Trace: Disposing editor for
                LogLevel.Trace,
                `TextEditorService: Disposing editor for ${editor.document.uri.toString()} during reset.`,
            ) //<

            editor.dispose()
        })

        this.utils.log( //> Debug: Visible editors disposed
            LogLevel.Debug,
            'TextEditorService._reset: Visible editors disposed. Clearing active editor and visible editors array...',
        ) //<

        this._activeTextEditor = undefined
        this._visibleTextEditors = []
        this.utils.log(LogLevel.Debug, 'TextEditorService._reset: Reset complete.')
    } //<

    /**
     * Sets the active text editor internally and fires the corresponding event.
     * @param editor - The editor to set as active, or undefined if no editor is active.
     */
    _setActiveTextEditor(editor: TextEditor | undefined): void { //>
        this.utils.log( //> Debug: _setActiveTextEditor called
            LogLevel.Debug,
            `TextEditorService: _setActiveTextEditor called. Current active: ${this._activeTextEditor?.document?.uri.toString() ?? 'undefined'}, New active: ${editor?.document?.uri.toString() ?? 'undefined'}`,
        ) //<

        if (this._activeTextEditor === editor) {
            this.utils.log(LogLevel.Trace, 'TextEditorService: _setActiveTextEditor - No change.')
            return
        }
        this.utils.log( //> Debug: Setting active editor
            LogLevel.Debug,
            `TextEditorService: Setting active editor: ${editor?.document.uri.toString() ?? 'undefined'}`,
        ) //<

        this._activeTextEditor = editor

        this.utils.log( //> Trace: After setting, this._activeTextEditor is
            LogLevel.Trace,
            `TextEditorService: _setActiveTextEditor - After setting, this._activeTextEditor is: ${this._activeTextEditor?.document?.uri.toString() ?? 'undefined'}`,
        ) //<

        // Ensure active editor is visible
        if (editor && !this._visibleTextEditors.includes(editor)) {
            this._setVisibleTextEditors([...this._visibleTextEditors, editor]) // Use internal setter
        }

        this.eventBus.fireOnDidChangeActiveTextEditor(editor)
    } //<

    /**
     * Sets the list of visible text editors internally and fires the corresponding event.
     * Disposes of editors that are no longer visible.
     * @param editors - The array of editors to set as visible.
     */
    _setVisibleTextEditors(editors: TextEditor[]): void { //>
        const currentUris = this._visibleTextEditors.map(e => e.document.uri.toString()).sort()
        const newUris = editors.map(e => e.document.uri.toString()).sort()
        const changed = currentUris.length !== newUris.length || currentUris.some((uri, i) => uri !== newUris[i])

        if (!changed) { return }

        this.utils.log( //> Debug: Setting visible editors
            LogLevel.Debug,
            `TextEditorService: Setting visible editors: ${editors.map(e => e.document.uri.toString()).join(', ')}`,
        ) //<

        const editorsToRemove = this._visibleTextEditors.filter(editor => !editors.includes(editor))
        editorsToRemove.forEach((editor) => {

            this.utils.log( //> Trace: Disposing editor for
                LogLevel.Trace,
                `TextEditorService: Disposing editor for ${editor.document.uri.toString()} as it's no longer visible.`,
            ) //<

            editor.dispose()

        })

        this._visibleTextEditors = [...editors]

        if (this._activeTextEditor && !this._visibleTextEditors.includes(this._activeTextEditor)) {
            this._setActiveTextEditor(undefined)
        }

        this.eventBus.fireOnDidChangeVisibleTextEditors(editors)
    } //<
}
