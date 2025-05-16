// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../../workspace/implementations/textDocument.ts'
import type { TextEditor } from '../implementations/textEditor.ts'

//--------------------------------------------------------------------------------------------------------------<<

export interface ITextEditorService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly activeTextEditor: TextEditor | undefined

	readonly visibleTextEditors: readonly TextEditor[]

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	setActiveTextEditor: ( //>
		editor?: TextEditor
	) => void //<

	setVisibleTextEditors: ( //>
		editors: TextEditor[]
	) => void //<

	showTextDocument: ( //>
		document: TextDocument,
		options?: vt.TextDocumentShowOptions
	) => Promise<TextEditor> //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	_reset: () => void //> //<

}
