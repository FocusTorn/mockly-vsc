// ESLint & Imports --------->>

/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unused-imports/no-unused-imports */

import type * as vt from 'vscode'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel, EndOfLine } from '../../../_vscCore/vscEnums.ts'
import { Position, Range } from '../../../_vscCore/vscClasses.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'

//--------------------------------------------------------------------------------------------------------------<<

export class TextDocument implements vt.TextDocument { //>

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  PROPERTIES                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private _content!: string
	private _version: number = 1
	private _isClosed: boolean = false
	private _isDirty: boolean = false
	private _lines: string[] = []

	readonly uri: vt.Uri
	fileName: string
	isUntitled: boolean
	languageId: string
	readonly eol: vt.EndOfLine = EndOfLine.LF
	readonly encoding: string = 'utf8' // ADDED
	private _linesInitialized: boolean = false

	constructor( //>
		uri: vt.Uri,
		initialContent: string,
		languageId: string = 'plaintext',
		private utils: ICoreUtilitiesService,
		private eventBus?: IEventBusService,
		// encoding: string = 'utf8' // Optional: if encoding can be set at construction
	) {
		this.uri = uri
		this.fileName = uri.fsPath
		this.isUntitled = uri.scheme === 'untitled'
		this.languageId = languageId
		// this.encoding = encoding; // If passed in constructor
		this._updateContentInternal(initialContent, false)
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  GET / SET                                                                                       │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get version(): number { return this._version }
	get isDirty(): boolean { return this._isDirty }
	get isClosed(): boolean { return this._isClosed }
	get lineCount(): number { //>
		if (!this._linesInitialized) {
			this._initializeLines()
		
		}
		return this._lines.length
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  METHODS                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	getText( //>
		range?: vt.Range,
	): string {
		if (!this._linesInitialized && !range) {
			return this._content
		
		}
		if (!this._linesInitialized) {
			this._initializeLines()
		
		}

		if (!range) {
			return this._content
		
		}
		range = this.validateRange(range)

		const startLine = range.start.line
		const endLine = range.end.line
		const startChar = range.start.character
		const endChar = range.end.character

		if (startLine === endLine) {
			if (startLine >= this.lineCount) {
				return ''
			
			}
			return this._lines[startLine].substring(startChar, endChar)
		
		}

		else {
			let text = ''
			if (startLine >= this.lineCount)
				return ''

			text += this._lines[startLine].substring(startChar) + (this.eol === EndOfLine.CRLF ? '\r\n' : '\n')

			for (let i = startLine + 1; i < endLine; i++) {
				text += this._lines[i] + (this.eol === EndOfLine.CRLF ? '\r\n' : '\n')
			
			}

			text += this._lines[endLine].substring(0, endChar)

			return text
		
		}
	
	} //<

	lineAt( //>
		lineOrPosition: number | vt.Position,
	): vt.TextLine {
		if (!this._linesInitialized) {
			this._initializeLines()
		
		}

		const line = typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line

		if (line < 0 || line >= this.lineCount) {
			throw this.utils.createError(`Illegal value for line number: ${line}`)
		
		}

		const text = this._lines[line]
		const range = new Range(line, 0, line, text.length)

		const rangeIncludingLineBreak = (line < this.lineCount - 1)
			? new Range(line, 0, line + 1, 0)
			: range

		return {
			lineNumber: line,
			text,
			range,
			rangeIncludingLineBreak,
			firstNonWhitespaceCharacterIndex: text.search(/\S|$/),
			isEmptyOrWhitespace: text.trim().length === 0,
		}
	
	} //<

	offsetAt( //>
		position: vt.Position,
	): number {
		position = this.validatePosition(position)
		let offset = 0
		for (let i = 0; i < position.line; i++) {
			offset += this._lines[i].length + (this.eol === EndOfLine.CRLF ? 2 : 1)
		
		}
		offset += position.character
		return offset
	
	} //<

	positionAt( //>
		offset: number,
	): vt.Position {
		if (offset < 0) { offset = 0 }

		let currentOffset = 0

		for (let line = 0; line < this.lineCount; line++) {
			const lineLength = this._lines[line].length
			const lineLengthWithEOL = lineLength + (this.eol === EndOfLine.CRLF ? 2 : 1)

			if (offset <= currentOffset + lineLength) {
				return new Position(line, offset - currentOffset)
			
			}

			if (line === this.lineCount - 1 && offset > currentOffset + lineLength) {
				return new Position(line, lineLength)
			
			}

			currentOffset += lineLengthWithEOL
		
		}

		const lastLineIndex = Math.max(0, this.lineCount - 1)
		const lastLineLength = this._lines[lastLineIndex]?.length ?? 0
		return new Position(lastLineIndex, lastLineLength)
	
	} //<

	validateRange( //>
		range: vt.Range,
	): vt.Range {
		if (!range?.start || !range?.end) {
			return new Range(new Position(0, 0), new Position(0, 0))
		
		}

		const start = this.validatePosition(range.start)
		const end = this.validatePosition(range.end)

		if (range.start.isAfter(range.end)) {
			return new Range(end, start)
		
		}
		else {
			return new Range(start, end)
		
		}
	
	} //<

	validatePosition( //>
		position: vt.Position,
	): vt.Position {
		let line = position.line
		let character = position.character

		if (line < 0) {
			line = 0
			character = 0
		
		}
		else if (line >= this.lineCount) {
			line = Math.max(0, this.lineCount - 1)
			character = this._lines[line]?.length ?? 0
		
		}
		else {
			const maxCharacter = this._lines[line]?.length ?? 0
			if (character < 0) {
				character = 0
			
			}
			else if (character > maxCharacter) {
				character = maxCharacter
			
			}
		
		}

		if (this.lineCount === 0) {
			line = 0
			character = 0
		
		}

		if (position.line === line && position.character === character) {
			return position
		
		}

		return new Position(line, character)
	
	} //<

	getWordRangeAtPosition( //>
		position: vt.Position,
		regex?: RegExp,
	): vt.Range | undefined {
		position = this.validatePosition(position)
		const lineText = this.lineAt(position.line).text
		const wordRegex = regex ?? /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g

		let match: RegExpExecArray | null

		// eslint-disable-next-line no-cond-assign
		while ((match = wordRegex.exec(lineText)) !== null) {
			const startIndex = match.index
			const endIndex = startIndex + match[0].length
			if (position.character >= startIndex && position.character <= endIndex) {
				return new Range(position.line, startIndex, position.line, endIndex)
			
			}
		
		}
		return undefined
	
	} //<

	save( //>
	): Thenable<boolean> {
		if (!this.isUntitled) {
			this._markSaved()
			this.eventBus?.fireOnDidSaveTextDocument(this)
		
		}
		this._markSaved()
		return Promise.resolve(true)
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  INTERNALS                                                                                       │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private _initializeLines(): void { //>
		this._linesInitialized = true
		if (this._content) {
			const firstLF = this._content.indexOf('\n')
			const firstCRLF = this._content.indexOf('\r\n')
			if (firstCRLF !== -1 && (firstLF === -1 || firstCRLF < firstLF)) {
				this._lines = this._content.split('\r\n')
			
			}
			else {
				this._lines = this._content.split('\n')
			
			}
		
		}
		else {
			this._lines = []
		
		}
	
	} //<

	private _updateContentInternal(newContent: string, markDirty: boolean): void { //>
		this._content = newContent
		const firstLF = this._content.indexOf('\n')
		const firstCRLF = this._content.indexOf('\r\n')
		if (firstCRLF !== -1 && (firstLF === -1 || firstCRLF < firstLF)) {
			this._lines = this._content.split('\r\n')
		
		}
		else {
			this._lines = this._content.split('\n')
		
		}
		if (markDirty) {
			this._isDirty = true
		
		}
	
	} //<
    
	_close(): void { this._isClosed = true }

	_markSaved(): void { this._isDirty = false }

	_reOpen(content: string, languageId?: string): void { //>
		this.utils.log(LogLevel.Debug, `Re-opening document: ${this.uri.toString()}`)
		this._isClosed = false
		this._isDirty = false // Typically, re-opening from disk means it's not dirty initially
		this._updateContentInternal(content, false) // Update content without marking dirty
		if (languageId) {
			this.languageId = languageId
		
		}
		this._version++ // Increment version on re-open
	
	} //<
    
	_setContentAfterSave(savedContent: string): void { //>
		this._updateContentInternal(savedContent, false)
		this._isDirty = false
		this._version++
		this.utils.log(LogLevel.Trace, `Document ${this.uri.toString()} content updated internally after save. New version: ${this._version}`)
	
	} //<

	_setLanguageId(languageId: string): void { //>
		if (this.languageId !== languageId) {
			this.languageId = languageId
			// TODO: Consider if a language change event should be fired.
			// This is not standard in VS Code's public API for TextDocument,
			// but might be useful for mock observation.
			this.utils.log(LogLevel.Debug, `Language ID for ${this.uri.toString()} changed to ${languageId}`)
		
		}
	
	} //<

	_updateContent(newContent: string): void { //>
		this.utils.log(LogLevel.Debug, `_updateContent called for ${this.uri.toString()}`)
		this._updateContentInternal(newContent, true)
		this._version++
	
	} //<

}
