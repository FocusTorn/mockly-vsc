// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'
import { Position, Range, Selection } from '../../../_vscCore/vscClasses.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../../workspace/implementations/textDocument.ts'

//--------------------------------------------------------------------------------------------------------------<<

export class TextEditor implements vt.TextEditor, vt.Disposable {
    readonly document: TextDocument
    selection: vt.Selection
    selections: readonly vt.Selection[]
    options: vt.TextEditorOptions
    viewColumn: vt.ViewColumn | undefined
    visibleRanges: readonly vt.Range[]
    private _content!: string
    private _isClosed: boolean = false
    private _isDirty: boolean = false
    private _lines: string[] = []
    private _linesInitialized: boolean = false
    private _version: number = 1
    private utils?: ICoreUtilitiesService
    private eventBus?: IEventBusService

    // TODO Review the Edit Change Event: The edit method's contentChanges in the fired onDidChangeTextDocument event provides a simplified change object covering the entire document. This is not how a real VS Code TextDocumentChangeEvent would report changes, which details specific ranges and text insertions/deletions. This simplification might limit tests that rely on inspecting precise change details.
    
    constructor(
        document: TextDocument,
        viewColumn?: vt.ViewColumn,
        utils?: ICoreUtilitiesService,
        eventBus?: IEventBusService,
    ) {
        this.document = document
        this.viewColumn = viewColumn
        this.selection = new Selection(0, 0, 0, 0)
        this.selections = [this.selection]
        this.options = { tabSize: 4, insertSpaces: true }
        this.utils = utils
        this.eventBus = eventBus

        const lastLine = Math.max(0, document.lineCount - 1)
        const lastChar = document.lineCount > 0 ? document.lineAt(lastLine).text.length : 0
        this.visibleRanges = [new Range(0, 0, lastLine, lastChar)]
    }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    dispose(): void { //>
        this.utils?.log(LogLevel.Debug, `MockTextEditor.dispose() called for ${this.document?.uri.toString() ?? 'unknown document'}`); // Safely log document URI

        (this.document as any) = undefined;
        (this.selection as any) = undefined;
        (this.selections as any) = undefined;
        (this.options as any) = undefined;
        (this.viewColumn as any) = undefined;
        (this.visibleRanges as any) = undefined

        this.utils?.log(LogLevel.Trace, `MockTextEditor.dispose() complete.`) // ADD LOGGING
    } //<

    edit( //>
        callback: (editBuilder: vt.TextEditorEdit) => void,
        _options?: { undoStopBefore: boolean, undoStopAfter: boolean },
    ): Thenable<boolean> {
        this.utils?.log(LogLevel.Debug, `MockTextEditor.edit called for ${this.document.uri.toString()}`)

        const edits: { range: vt.Range, text: string }[] = []
        const builder: vt.TextEditorEdit = {
            replace: (location: vt.Position | vt.Range | vt.Selection, value: string) => { 
                const range = location instanceof Position
                    ? new Range(location, location)
                    : location
                edits.push({ range: this.document.validateRange(range as vt.Range), text: value })
            }, 
            insert: (location: vt.Position, value: string) => { 
                const validatedPos = this.document.validatePosition(location)
                edits.push({ range: new Range(validatedPos, validatedPos), text: value })
            }, 
            delete: (location: vt.Range | vt.Selection) => { 
                edits.push({ range: this.document.validateRange(location as vt.Range), text: '' })
            }, 
            setEndOfLine: (eol: vt.EndOfLine) => { 
                this.utils?.log(LogLevel.Warning, `MockTextEditor.edit: setEndOfLine(${eol}) not implemented.`)
            }, 
        }

        try {
            callback(builder)

            edits.sort((a, b) => { 
                const startA = a.range.start
                const startB = b.range.start
                return startB.line - startA.line || startB.character - startA.character
            }) 

            let currentContent = this.document.getText() // Get initial content
            const oldContentForEvent = currentContent // Store for event later

            for (const edit of edits) {
                if (!edit.range.start || !edit.range.end) {
                    this.utils?.warn(`Skipping invalid edit range.`)
                    continue
                }

                const startOffset = this.document.offsetAt(edit.range.start)
                let endOffset = this.document.offsetAt(edit.range.end)
                if (startOffset > endOffset) {
                    this.utils?.warn(`Skipping invalid range: startOffset (${startOffset}) is after endOffset (${endOffset}).`)
                    continue
                }
                endOffset = Math.max(startOffset, endOffset)
                currentContent = currentContent.slice(0, startOffset) + edit.text + currentContent.slice(endOffset)
            }

            // --- FIX: Use updatedContent (which is 'currentContent' here after loop) ---
            this.document._updateContent(currentContent) 
            // --- END FIX ---

            // Fire TextDocumentChangeEvent (should ideally contain detailed changes)
            const finalLineCount = this.document.lineCount
            const lastLineIndex = Math.max(0, finalLineCount - 1)
            const lastCharIndex = finalLineCount > 0 ? this.document.lineAt(lastLineIndex).text.length : 0
            const fullRangeAfterEdit = new Range(0, 0, lastLineIndex, lastCharIndex)

            this.eventBus?.fireOnDidChangeTextDocument({
                document: this.document,
                contentChanges: [{
                    range: fullRangeAfterEdit, 
                    rangeOffset: 0, 
                    rangeLength: oldContentForEvent.length, // Length of the content *before* this whole edit operation
                    text: this.document.getText(), // Current text of the whole document
                }],
                reason: undefined, 
            })

            return Promise.resolve(true)
        }
        catch (e) { //>
            this.utils?.error(`Error during MockTextEditor.edit callback:`, e)
            return Promise.resolve(false)
        } //<
    } //<
    
    hide(): void { //>
        this.utils?.log(LogLevel.Trace, `MockTextEditor.hide called for ${this.document.uri.toString()}`)
        // This might trigger window state changes (setVisible) in a real scenario
    } //<

    insertSnippet( //>
        snippet: vt.SnippetString,
        location?: vt.Position | vt.Range | readonly vt.Position[] | readonly vt.Range[],
        _options?: { undoStopBefore: boolean, undoStopAfter: boolean },
    ): Thenable<boolean> {
        this.utils?.log(LogLevel.Warning, 'MockTextEditor.insertSnippet not implemented')
        let insertPos: vt.Position | undefined
        if (!location) {
            insertPos = this.selection.active
        }
        else if (location instanceof Position) {
            insertPos = location
        }
        else if (location instanceof Range) {
            insertPos = location.start
        }
        else if (Array.isArray(location) && location.length > 0) {
            const firstLoc = location[0]
            insertPos = firstLoc instanceof Position ? firstLoc : firstLoc.start
        }

        if (insertPos) {
            return this.edit(builder => builder.insert(insertPos!, snippet.value))
        }
        return Promise.resolve(false)
    } //<

    revealRange( //>
        range: vt.Range,
        revealType?: vt.TextEditorRevealType,
    ): void {
        this.utils?.log(LogLevel.Trace, `MockTextEditor.revealRange called for range ${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}, type: ${revealType}`)
    } //<

    setDecorations( //>
        decorationType: vt.TextEditorDecorationType,
        rangesOrOptions: readonly vt.Range[] | readonly vt.DecorationOptions[],
    ): void {
        const count = rangesOrOptions.length
        this.utils?.log(LogLevel.Trace, `MockTextEditor.setDecorations called for type ${decorationType.key || '(unknown)'} with ${count} ranges/options.`)

        // Store decorations if needed for testing verification
        // (this as any)._decorations = (this as any)._decorations || {};
        // (this as any)._decorations[decorationType.key] = rangesOrOptions;
    } //<

    show(column?: vt.ViewColumn): void { //>
        this.utils?.log(LogLevel.Trace, `MockTextEditor.show called for ${this.document.uri.toString()}, column: ${column}`)
        // This might trigger window state changes (setVisible, setActive) in a real scenario
    } //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    _updateOptions(newOptions: vt.TextEditorOptions): void { //>
        const oldOptions = this.options
        if (JSON.stringify(oldOptions) !== JSON.stringify(newOptions)) {
            this.options = { ...this.options, ...newOptions }
            this.eventBus?.fireOnDidChangeTextEditorOptions({
                textEditor: this,
                options: this.options,
            })
        }
    } //<

    _updateSelection(newSelection: vt.Selection): void { //>
        const oldSelection = this.selection
        if (!oldSelection.isEqual(newSelection)) {
            this.selection = newSelection
            this.selections = [newSelection]
            this.eventBus?.fireOnDidChangeTextEditorSelection({
                textEditor: this,
                selections: this.selections,
                kind: undefined, // TODO: Determine selection kind if possible
            })
        }
    } //<

    _updateViewColumn(newColumn?: vt.ViewColumn): void { //>
        if (this.viewColumn !== newColumn) {
            this.viewColumn = newColumn

            if (newColumn !== undefined) {
                this.eventBus?.fireOnDidChangeTextEditorViewColumn({
                    textEditor: this,
                    viewColumn: newColumn,
                })
            }
        }
    } //<

}
