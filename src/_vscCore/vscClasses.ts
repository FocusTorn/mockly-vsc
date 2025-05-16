// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { URI as nUri } from 'vscode-uri'
import type { DiagnosticSeverity, EndOfLine } from './vscEnums.ts'
import { LogLevel, TreeItemCollapsibleState } from './vscEnums.ts'
import type { FileOperation, StoredTextEdit } from './_vscInterfaces.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { ICoreUtilitiesService } from '../core/_interfaces/ICoreUtilitiesService.ts'

//--------------------------------------------------------------------------------------------------------------<<

export class Diagnostic implements vt.Diagnostic { //>

	range: Range
	message: string
	severity: DiagnosticSeverity
	source?: string
	code?: string | number | { value: string | number, target: nUri }
	relatedInformation?: vt.DiagnosticRelatedInformation[]
	tags?: vt.DiagnosticTag[]

	constructor(
		range: Range,
		message: string,
		severity: DiagnosticSeverity,
	) {
		this.range = range
		this.message = message
		this.severity = severity
	
	}

} //<

export class Disposable implements vt.Disposable { //>

	private _callOnDispose: () => any
	private _isDisposed = false

	constructor(
		callOnDispose: () => any,
	) {
		this._callOnDispose = callOnDispose
	
	}

	dispose( //>
	): any {
		if (!this._isDisposed) {
			this._isDisposed = true
			try {
				this._callOnDispose()
			
			}
			catch (e) { //>
				console.error('Error during Disposable dispose:', e)
				// Depending on desired mock behavior, re-throw or just log
			
			} //<
		
		}
	
	} //<

	[Symbol.dispose](): void { //>
		this.dispose()
	
	} //<

	/**
	 * Creates a disposable that will dispose of the given disposables.
	 * @param disposables Disposables to dispose of.
	 * @returns A new disposable that will dispose of the given disposables.
	 */
	static from(disposables: readonly vt.Disposable[]): Disposable { //>
		return new Disposable(() => {
			for (const disposable of disposables) {
				if (disposable && typeof disposable.dispose === 'function') {
					disposable.dispose()
				
				}
			
			}
		
		})
	
	} //<

} //<

export class EventEmitter<T> implements vt.EventEmitter<T> { //>

	private _listeners: Set<{ listener: (e: T) => any, thisArgs?: any }> = new Set()
	private _disposed = false

	get event( //>
	): vt.Event<T> {
		return (listener: (e: T) => any, thisArgs?: any, disposables?: vt.Disposable[]): Disposable => {
			if (this._disposed) {
				console.warn('Attempted to add listener to disposed MockEventEmitter.')
				return new Disposable(() => { })
			
			}

			const entry = { listener, thisArgs }
			this._listeners.add(entry)

			const disposable = new Disposable(() => {
				this._listeners.delete(entry)
			
			})

			if (disposables) { //> Ensure the provided array is mutable if we push to it
				if (Array.isArray(disposables)) {
					disposables.push(disposable)
				
				}
				else {
					console.warn('MockEventEmitter: disposables argument provided but is not an array.')
				
				}
			
			} //<

			return disposable
		
		}
	
	} //<

	fire( //>
		data: T,
	): void {
		if (this._disposed) { console.warn('Attempted to fire disposed MockEventEmitter.'); return }

		const listenersToNotify = Array.from(this._listeners)
		listenersToNotify.forEach(({ listener, thisArgs }) => {
			try {
				listener.call(thisArgs, data)
			
			}
			catch (e) { //>
				console.error('Error in MockEventEmitter listener:', e)
				// In a real scenario, VS Code might handle this differently (e.g., log, disable listener)
			
			} //<
		
		})
	
	} //<

	dispose( //>
	): void {
		if (!this._disposed) {
			this._disposed = true
			this._listeners.clear()
		
		}
	
	} //<

} //<

export class Location implements vt.Location { //>

	readonly uri: nUri
	readonly range: Range

	constructor(uri: nUri, rangeOrPosition: Range | Position) {
		this.uri = uri
		if (rangeOrPosition instanceof Position) {
			this.range = new Range(rangeOrPosition, rangeOrPosition)
		
		}
		else {
			this.range = rangeOrPosition
		
		}
	
	}

} //<

export class Position implements vt.Position { //>

	readonly line: number
	readonly character: number

	constructor(
		line: number,
		character: number,
	) {
		if (line < 0) {
			throw new Error('Illegal argument: line must be non-negative')
		
		}
		if (character < 0) {
			throw new Error('Illegal argument: character must be non-negative')
		
		}
		this.line = line
		this.character = character
	
	}

	isBefore( //>
		other: Position,
	): boolean {
		return this.line < other.line || (this.line === other.line && this.character < other.character)
	
	} //<

	isBeforeOrEqual( //>
		other: Position,
	): boolean {
		return this.line < other.line || (this.line === other.line && this.character <= other.character)
	
	} //<

	isAfter( //>
		other: Position,
	): boolean {
		return this.line > other.line || (this.line === other.line && this.character > other.character)
	
	} //<

	isAfterOrEqual( //>
		other: Position,
	): boolean {
		return this.line > other.line || (this.line === other.line && this.character >= other.character)
	
	} //<

	isEqual( //>
		other: Position,
	): boolean {
		return this.line === other.line && this.character === other.character
	
	} //<

	compareTo(other: Position): number { //>
		if (this.line < other.line) {
			return -1
		
		}
		else if (this.line > other.line) {
			return 1
		
		}

		else { //> Lines are equal, compare characters
			if (this.character < other.character) {
				return -1
			
			}
			else if (this.character > other.character) {
				return 1
			
			}
			else { // Characters are equal
				return 0
			
			}
		
		} //<
	
	} //<

	translate(lineDelta?: number, characterDelta?: number): Position //>
	translate(change: { lineDelta?: number, characterDelta?: number }): Position
	translate(lineDeltaOrChange: number | { lineDelta?: number, characterDelta?: number } | undefined, characterDelta?: number): Position {
		let lineDelta = 0
		let charDelta = 0

		if (typeof lineDeltaOrChange === 'number' || lineDeltaOrChange === undefined) {
			lineDelta = lineDeltaOrChange ?? 0
			charDelta = characterDelta ?? 0
		
		}
		else {
			lineDelta = lineDeltaOrChange.lineDelta ?? 0
			charDelta = lineDeltaOrChange.characterDelta ?? 0
		
		}

		const newLine = this.line + lineDelta
		const newChar = this.character + charDelta

		// Basic validation, real VS Code might throw or clamp differently based on context
		if (newLine < 0 || newChar < 0) {
			// For simplicity, let's clamp to 0,0 instead of throwing immediately
			// throw new Error("Attempt to translate to negative coordinates");
			return new Position(Math.max(0, newLine), Math.max(0, newChar))
		
		}

		return new Position(newLine, newChar)
	
	} //<

	with(line?: number, character?: number): Position //>
	with(change: { line?: number, character?: number }): Position
	with(lineOrChange: number | { line?: number, character?: number } | undefined, character?: number): Position {
		let newLine = this.line
		let newChar = this.character

		if (typeof lineOrChange === 'number' || lineOrChange === undefined) {
			newLine = lineOrChange ?? this.line
			newChar = character ?? this.character
		
		}
		else {
			newLine = lineOrChange.line ?? this.line
			newChar = lineOrChange.character ?? this.character
		
		}

		if (newLine === this.line && newChar === this.character) {
			return this
		
		}
		return new Position(newLine, newChar)
	
	} //<

} //<

export class Range implements vt.Range { //>

	static readonly START_TO_START = 0
	static readonly START_TO_END = 1
	static readonly END_TO_END = 2
	static readonly END_TO_START = 3

	readonly start: Position
	readonly end: Position

	constructor(
		startLine: number | Position,
		startCharacter: number | Position,
		endLine?: number,
		endCharacter?: number,
	) {
		let startPos: Position
		let endPos: Position

		if (startLine instanceof Position && startCharacter instanceof Position) {
			startPos = startLine
			endPos = startCharacter
		
		}
		else if (typeof startLine === 'number' && typeof startCharacter === 'number' && typeof endLine === 'number' && typeof endCharacter === 'number') {
			startPos = new Position(startLine, startCharacter)
			endPos = new Position(endLine, endCharacter)
		
		}
		else {
			throw new TypeError('Invalid Range constructor arguments')
		
		}

		// Ensure start is always before or equal to end
		if (startPos.isAfter(endPos)) {
			this.start = endPos
			this.end = startPos
		
		}
		else {
			this.start = startPos
			this.end = endPos
		
		}
	
	}

	get isEmpty( //>
	): boolean {
		return this.start.isEqual(this.end)
	
	} //<

	get isSingleLine( //>
	): boolean {
		return this.start.line === this.end.line
	
	} //<

	contains( //>
		positionOrRange: Position | Range,
	): boolean {
		if (positionOrRange instanceof Position) {
			return this.start.isBeforeOrEqual(positionOrRange) && this.end.isAfterOrEqual(positionOrRange)
		
		}
		else { // Range
			return this.contains(positionOrRange.start) && this.contains(positionOrRange.end)
		
		}
	
	} //<

	isEqual( //>
		other: Range,
	): boolean {
		return this.start.isEqual(other.start) && this.end.isEqual(other.end)
	
	} //<

	intersection( //>
		other: Range,
	): Range | undefined {
		const start = this.start.isAfter(other.start) ? this.start : other.start
		const end = this.end.isBefore(other.end) ? this.end : other.end

		if (start.isAfter(end)) {
			return undefined // No intersection
		
		}
		return new Range(start, end)
	
	} //<

	union( //>
		other: Range,
	): Range {
		const start = this.start.isBefore(other.start) ? this.start : other.start
		const end = this.end.isAfter(other.end) ? this.end : other.end
		return new Range(start, end)
	
	} //<

	with(start?: Position, end?: Position): Range //>
	with(change: { start?: Position, end?: Position }): Range
	with(startOrChange?: Position | { start?: Position, end?: Position }, end?: Position): Range {
		let newStart = this.start
		let newEnd = this.end

		if (startOrChange instanceof Position || startOrChange === undefined) {
			newStart = startOrChange ?? this.start
			newEnd = end ?? this.end
		
		}
		else {
			newStart = startOrChange.start ?? this.start
			newEnd = startOrChange.end ?? this.end
		
		}

		if (newStart.isEqual(this.start) && newEnd.isEqual(this.end)) {
			return this
		
		}
		return new Range(newStart, newEnd)
	
	} //<

} //<

export class Selection extends Range implements vt.Selection { //>

	readonly anchor: Position
	readonly active: Position

	constructor(
		anchorLine: number | Position,
		anchorCharacter: number | Position,
		activeLine?: number,
		activeCharacter?: number,
	) {
		let anchorPos: Position
		let activePos: Position

		if (anchorLine instanceof Position && anchorCharacter instanceof Position) {
			anchorPos = anchorLine
			activePos = anchorCharacter
		
		}
		else if (typeof anchorLine === 'number' && typeof anchorCharacter === 'number' && typeof activeLine === 'number' && typeof activeCharacter === 'number') {
			anchorPos = new Position(anchorLine, anchorCharacter)
			activePos = new Position(activeLine, activeCharacter)
		
		}
		else {
			throw new TypeError('Invalid Selection constructor arguments')
		
		}

		// The Range constructor handles swapping start/end if active is before anchor
		super(anchorPos, activePos)

		this.anchor = anchorPos
		this.active = activePos
	
	}

	get isReversed(): boolean {
		// In Selection, 'start' and 'end' are sorted, 'anchor' and 'active' are not.
		// isReversed is true if the active position comes before the anchor position.
		return this.active.isBefore(this.anchor)
	
	}

} //<

export class ThemeColor implements vt.ThemeColor { //>

	id: string

	constructor(
		id: string,
	) {
		this.id = id
	
	}

} //<

export class ThemeIcon implements vt.ThemeIcon { //>

	static readonly File = new ThemeIcon('file')
	static readonly Folder = new ThemeIcon('folder')

	readonly id: string
	readonly color?: ThemeColor

	constructor(
		id: string,
		color?: ThemeColor,
	) {
		this.id = id
		this.color = color
	
	}

} //<

export class TreeItem implements vt.TreeItem { //>

	label?: string | vt.TreeItemLabel
	id?: string
	iconPath?: string | nUri | ThemeIcon | { light: nUri, dark: nUri } | undefined
	description?: string | boolean
	resourceUri?: nUri
	tooltip?: string | vt.MarkdownString | undefined
	command?: vt.Command
	collapsibleState?: TreeItemCollapsibleState
	contextValue?: string
	accessibilityInformation?: vt.AccessibilityInformation

	constructor(
		labelOrUri: string | vt.TreeItemLabel | nUri,
		collapsibleState?: TreeItemCollapsibleState,
	) {
		if (labelOrUri instanceof nUri) {
			this.resourceUri = labelOrUri
			// Attempt to derive label from URI path if not provided otherwise
			// This is a simplification; real VS Code might have more complex logic
			if (!this.label) {
				const pathSegments = labelOrUri.path.split('/')
				this.label = pathSegments[pathSegments.length - 1] || labelOrUri.path
			
			}
		
		}
		else {
			this.label = labelOrUri
		
		}
		this.collapsibleState = collapsibleState ?? TreeItemCollapsibleState.None
	
	}

} //<

export class WorkspaceEdit implements vt.WorkspaceEdit { //>

	// Store edits keyed by URI string. Value is an array of our internal StoredTextEdit or FileOperation.
	private _edits = new Map<string, (StoredTextEdit | FileOperation)[]>()
	private _size = 0 // Tracks the total number of operations (text edits + file ops)

	//= File Operations =============================================================================
	createFile( //>
		uri: nUri,
		options?: { overwrite?: boolean, ignoreIfExists?: boolean, content?: Uint8Array },
		metadata?: vt.WorkspaceEditEntryMetadata,
	): void {
		// File operations inherently carry their metadata if provided
		this._addEdit(uri, { kind: 'create', uri, options, metadata } as FileOperation)
	
	} //<
	deleteFile( //>
		uri: nUri,
		options?: { recursive?: boolean, ignoreIfNotExists?: boolean, useTrash?: boolean, maxSize?: number },
		metadata?: vt.WorkspaceEditEntryMetadata,
	): void {
		this._addEdit(uri, { kind: 'delete', uri, options, metadata } as FileOperation)
	
	} //<
	renameFile( //>
		oldUri: nUri,
		newUri: nUri,
		options?: { overwrite?: boolean, ignoreIfExists?: boolean },
		metadata?: vt.WorkspaceEditEntryMetadata,
	): void {
		// Store rename operation under the new URI for simplicity in retrieval,
		// though apply logic will need both old and new.
        
		this._addEdit(newUri, { kind: 'rename', oldUri, newUri, options, metadata } as FileOperation)
    
		// Note: If need to check `has(oldUri)`, this approach might need refinement.
		// Consider adding a marker to the old URI or storing renames differently.
    
	} //<

	//= Text Operations =============================================================================
	replace( //>
		uri: nUri,
		range: Range,
		newText: string,
		metadata?: vt.WorkspaceEditEntryMetadata,
	): void {
		this._addEdit(uri, { range, newText, metadata })
	
	} //<
	insert( //>
		uri: nUri,
		position: Position,
		newText: string,
		metadata?: vt.WorkspaceEditEntryMetadata,
	): void {
		this._addEdit(uri, { range: new Range(position, position), newText, metadata })
	
	} //<
	delete( //>
		uri: nUri,
		range: Range,
		metadata?: vt.WorkspaceEditEntryMetadata,
	): void {
		this._addEdit(uri, { range, newText: '', metadata })
	
	} //<

	//= Other =======================================================================================
	has( //>
		uri: nUri,
	): boolean {
		return this._edits.has(uri.toString())
	
	} //<

	set( //>
		uri: nUri,
		// Adjust signature to be compatible with vt.WorkspaceEdit overloads
		edits: readonly (
		  | vt.TextEdit
		  | vt.SnippetTextEdit
		  | vt.NotebookEdit
          
          // Tuple for Text/Snippet edits with metadata
		  | [vt.TextEdit | vt.SnippetTextEdit, vt.WorkspaceEditEntryMetadata | undefined]
          
          // Tuple for Notebook edits with metadata (as indicated by error message)
		  | [vt.NotebookEdit, vt.WorkspaceEditEntryMetadata | undefined]
		)[] | undefined | null,
	): void {
		const uriString = uri.toString()
		const currentOperations = this._edits.get(uriString) ?? []
		const existingFileOps = currentOperations.filter((op): op is FileOperation => 'kind' in op)
		const existingTextEdits = currentOperations.filter((op): op is StoredTextEdit => !('kind' in op))

		this._size -= existingTextEdits.length

		const newTextEdits: StoredTextEdit[] = []
		// Might need a separate store for NotebookEdits if we were fully implementing them
		// const newNotebookEdits: vt.NotebookEdit[] = [];

		if (edits) {
			for (const editOrTuple of edits) {
				// Type guard to check if it's the NotebookEdit tuple
				if (Array.isArray(editOrTuple) && typeof editOrTuple[0] === 'object' && editOrTuple[0] !== null && 'notebook' in editOrTuple[0] && 'cellEdits' in editOrTuple[0]) {
					const [_notebookEdit, _metadata] = editOrTuple as [vt.NotebookEdit, vt.WorkspaceEditEntryMetadata | undefined]
					// Handle NotebookEdit tuple (currently just warn and skip)
					console.warn(`WorkspaceEdit.set: Skipping NotebookEdit tuple for URI ${uriString} as notebook edits are not fully implemented in this mock:`, editOrTuple)
					// If tracking notebook edits: newNotebookEdits.push({ ...notebookEdit, metadata }); // Need to adapt NotebookEdit structure if metadata is stored
					// Note: We are *not* adding NotebookEdits to the _size count here.
					continue // Skip to next entry
				
				}
				// Type guard to check if it's the TextEdit/SnippetTextEdit tuple
				else if (Array.isArray(editOrTuple) && typeof editOrTuple[0] === 'object' && editOrTuple[0] !== null && 'range' in editOrTuple[0]) {
					const [textEdit, metadata] = editOrTuple as [vt.TextEdit | vt.SnippetTextEdit, vt.WorkspaceEditEntryMetadata | undefined]
					// Store as StoredTextEdit, merging metadata
					newTextEdits.push({ ...(textEdit as vt.TextEdit), metadata })
				
				}
				// Check if it's a plain NotebookEdit
				else if (typeof editOrTuple === 'object' && editOrTuple !== null && 'notebook' in editOrTuple && 'cellEdits' in editOrTuple) {
					const notebookEdit = editOrTuple as vt.NotebookEdit
					// Handle plain NotebookEdit (currently just warn and skip)
					console.warn(`WorkspaceEdit.set: Skipping plain NotebookEdit for URI ${uriString} as notebook edits are not fully implemented in this mock:`, notebookEdit)
					// If tracking notebook edits: newNotebookEdits.push(notebookEdit);
					// Note: We are *not* adding NotebookEdits to the _size count here.
				
				}
				// Check if it's a plain TextEdit or SnippetTextEdit
				else if (typeof editOrTuple === 'object' && editOrTuple !== null && 'range' in editOrTuple && ('newText' in editOrTuple || 'snippet' in editOrTuple)) {
					const textEdit = editOrTuple as vt.TextEdit | vt.SnippetTextEdit
					// Store as StoredTextEdit, metadata is undefined here
					newTextEdits.push({ ...(textEdit as vt.TextEdit), metadata: undefined })
				
				}
				else {
					console.warn(`WorkspaceEdit.set: Skipping invalid or unknown edit entry for URI ${uriString}:`, editOrTuple)
				
				}
			
			}
		
		}

		// Combine existing file operations with the new text edits
		// If implementing NotebookEdits, they would need to be stored/handled separately or alongside
		const newOperations = [...existingFileOps, ...newTextEdits]

		// Update the map and size (only reflects text/file ops currently)
		if (newOperations.length > 0) {
			this._edits.set(uriString, newOperations)
			this._size += newTextEdits.length // Add the count of *new* text edits
		
		}
		else {
			this._edits.delete(uriString)
		
		}
	
	} //<

	get( //>
		uri: nUri,
	): vt.TextEdit[] { // Return type is vt.TextEdit[] as per interface
		const allEdits = this._edits.get(uri.toString()) ?? []
		// Filter out FileOperation, return only StoredTextEdit (which are compatible with vt.TextEdit)
		return allEdits.filter((edit): edit is StoredTextEdit => 'range' in edit && 'newText' in edit)
	
	} //<

	entries( //>
	): [nUri, vt.TextEdit[]][] { // Return type includes vt.TextEdit[]
		const entries: [nUri, vt.TextEdit[]][] = []
		for (const [uriString, allEdits] of this._edits.entries()) {
			// Filter out FileOperation for each entry
			const textEdits = allEdits.filter((edit): edit is StoredTextEdit => 'range' in edit && 'newText' in edit)
			// Only add entry if there are text edits for this URI
			if (textEdits.length > 0) {
				// textEdits are StoredTextEdit[], compatible with vt.TextEdit[]
				entries.push([nUri.parse(uriString), textEdits])
			
			}
		
		}
		return entries
	
	} //<

	get size( //>
	): number {
		return this._size
	
	} //<

	private _addEdit( //> Internal helper to add any operation
		uri: nUri,
		edit: StoredTextEdit | FileOperation,
	): void {
		const uriString = uri.toString()
		const edits = this._edits.get(uriString) ?? []
		edits.push(edit)
		this._edits.set(uriString, edits)
		this._size++ // Increment total operation count
	
	} //<

} //<

export class RelativePattern implements vt.RelativePattern { //>

	baseUri: nUri
	base: string // Keep original base string for potential use
	pattern: string

	constructor(base: vt.WorkspaceFolder | nUri | string, pattern: string) {
		if (typeof base === 'string') {
			// If base is a string, treat it as a base path string.
			// We need to convert it to a Uri. Assuming it's a file path.
			// This might need refinement depending on how string bases are used.
			this.baseUri = nUri.file(base) // Or Uri.parse if it could be other schemes?
			this.base = base // Store the original string base
		
		}
		else if (base instanceof nUri) {
			this.baseUri = base
			this.base = base.fsPath // Or path, depending on normalization needs
		
		}
		else { // WorkspaceFolder
			this.baseUri = base.uri
			this.base = base.uri.fsPath // Or path
		
		}
		this.pattern = pattern
	
	}

} //<

export class TextEdit implements vt.TextEdit { //>

	range: Range
	newText: string

	constructor(range: Range, newText: string) {
		this.range = range
		this.newText = newText
	
	}

	static replace( //>
		range: Range,
		newText: string,
	): TextEdit {
		return new TextEdit(range, newText)
	
	} //<
	static insert( //>
		position: Position,
		newText: string,
	): TextEdit {
		return new TextEdit(new Range(position, position), newText)
	
	} //<
	static delete( //>
		range: Range,
	): TextEdit {
		return new TextEdit(range, '')
	
	} //<
	static setEndOfLine( //> // TODO implement setEndOfLine
		_eol: EndOfLine,
	): TextEdit {
		console.warn('Mock TextEdit.setEndOfLine is not fully implemented and returns a no-op edit.')
		return new TextEdit(new Range(0, 0, 0, 0), '')
	
	} //<

} //<

export class CancellationToken implements vt.CancellationToken { //>

	private _isCancellationRequested = false
	private _onCancellationRequestedEmitter = new EventEmitter<void>()

	get isCancellationRequested(): boolean { //>
		return this._isCancellationRequested
	
	} //<

	get onCancellationRequested(): vt.Event<void> { //> Event payload is void
		return this._onCancellationRequestedEmitter.event
	
	} //<

	_fireCancellation() { //>
		if (!this._isCancellationRequested) {
			this._isCancellationRequested = true
			this._onCancellationRequestedEmitter.fire() // Fire with no payload
		
		}
	
	} //<

	_disposeEmitter() { //>
		this._onCancellationRequestedEmitter.dispose()
	
	} //<

} //<

export class CancellationTokenSource implements vt.CancellationTokenSource { //>

	private _token: CancellationToken | undefined = new CancellationToken()

	get token(): vt.CancellationToken {
		if (!this._token) {
			// If disposed, return a dummy/cancelled token
			// Create a static cancelled token for efficiency? Or just return a new cancelled one.
			const cancelledToken = new CancellationToken()
			cancelledToken._fireCancellation() // Mark as cancelled
			return cancelledToken
		
		}
		return this._token
	
	}

	cancel(): void {
		this.utils?.log(LogLevel.Trace, 'MockCancellationTokenSource.cancel() called.') // Add logging if utils is available
		this._token?._fireCancellation()
	
	}

	dispose(): void {
		this.utils?.log(LogLevel.Trace, 'MockCancellationTokenSource.dispose() called.') // Add logging if utils is available
		if (this._token) {
			this._token._disposeEmitter()
			this._token = undefined
		
		}
	
	}

	// Add utils for logging within the class if needed, passed via constructor?
	// For simplicity, assume logging happens where it's used for now.
	private utils?: ICoreUtilitiesService // Optional utils for logging
	constructor(utils?: ICoreUtilitiesService) {
		this.utils = utils
	
	}

} //<
