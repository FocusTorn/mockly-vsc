// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule'
import type { TextDocument } from '../../src/modules/workspace/implementations/textDocument'
import type { TextEditor } from '../../src/modules/window/implementations/textEditor'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('TextEditor', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let windowModule: IWindowModule
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		windowModule = setup.windowModule
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Properties: activeTextEditor and visibleTextEditors', () => { //>
		// SETUP -------------------------------------->>

		let fileUri1: any, fileUri2: any
		let doc1: TextDocument, doc2: TextDocument

		beforeEach(async () => { //>
			fileUri1 = simulator.Uri.file('/window/file1.txt')
			fileUri2 = simulator.Uri.file('/window/file2.js')
			await simulator.workspace.fs.writeFile(fileUri1, new TextEncoder().encode('content 1'))
			await simulator.workspace.fs.writeFile(fileUri2, new TextEncoder().encode('content 2'))
			doc1 = await simulator.workspace.openTextDocument(fileUri1) as TextDocument
			doc2 = await simulator.workspace.openTextDocument(fileUri2) as TextDocument

			// Initial state check (after global reset)
			expect(simulator.window.activeTextEditor).toBeUndefined()
			expect(simulator.window.visibleTextEditors).toEqual([])
		}) //<

		//----------------------------------------------------------------<<

		it('should update activeTextEditor and visibleTextEditors when showing a document', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1)

			expect(simulator.window.activeTextEditor).toBe(editor1)
			expect(simulator.window.visibleTextEditors.length).toBe(1)
			expect(simulator.window.visibleTextEditors).toContain(editor1)
			expect(editor1.document).toBe(doc1)

			const editor2 = await simulator.window.showTextDocument(doc2)

			expect(simulator.window.activeTextEditor).toBe(editor2)
			expect(simulator.window.visibleTextEditors.length).toBe(2)
			expect(simulator.window.visibleTextEditors).toContain(editor1)
			expect(simulator.window.visibleTextEditors).toContain(editor2)
			expect(editor2.document).toBe(doc2)
		}) //<
		it('should update activeTextEditor when showing a document with preserveFocus: true', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1)
			expect(simulator.window.activeTextEditor).toBe(editor1)

			const editor2 = await simulator.window.showTextDocument(doc2, { preserveFocus: true })

			expect(simulator.window.activeTextEditor).toBe(editor1) // Active editor should not change
			expect(simulator.window.visibleTextEditors.length).toBe(2)
			expect(simulator.window.visibleTextEditors).toContain(editor1)
			expect(simulator.window.visibleTextEditors).toContain(editor2)
		}) //<
		it('should dispose all visible editors during simulator reset', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1) as TextEditor
			const editor2 = await simulator.window.showTextDocument(doc2) as TextEditor
			const editor1DisposeSpy = vi.spyOn(editor1, 'dispose')
			const editor2DisposeSpy = vi.spyOn(editor2, 'dispose')

			await simulator.reset() // Reset is handled by setup.afterEach

			expect(editor1DisposeSpy).toHaveBeenCalledOnce()
			expect(editor2DisposeSpy).toHaveBeenCalledOnce()

			editor1DisposeSpy.mockRestore()
			editor2DisposeSpy.mockRestore()
		}) //<

		it('should update activeTextEditor and visibleTextEditors when using internal service methods', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1!) as TextEditor
			const editor2 = await simulator.window.showTextDocument(doc2!) as TextEditor
			expect(simulator.window.activeTextEditor).toBe(editor2) // Last shown is active

			windowModule._textEditorService.setActiveTextEditor(editor1)
			expect(simulator.window.activeTextEditor).toBe(editor1)

			windowModule._textEditorService.setVisibleTextEditors([editor1])
			expect(simulator.window.visibleTextEditors.length).toBe(1)
			expect(simulator.window.visibleTextEditors).toContain(editor1)
			// If active editor (editor1) is in the new visible list, it remains active.
			expect(simulator.window.activeTextEditor).toBe(editor1)
		}) //<

		it('should set activeTextEditor to undefined if the active editor is removed from visible editors', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1) as TextEditor
			const editor2 = await simulator.window.showTextDocument(doc2) as TextEditor // editor2 is now active
			expect(simulator.window.activeTextEditor).toBe(editor2)
			expect(simulator.window.visibleTextEditors.length).toBe(2)

			// Remove editor2 (the active one) from visible list
			windowModule._textEditorService.setVisibleTextEditors([editor1])

			expect(simulator.window.visibleTextEditors.length).toBe(1)
			expect(simulator.window.visibleTextEditors).toContain(editor1)
			expect(simulator.window.activeTextEditor).toBeUndefined() // Active should become undefined

			windowModule._textEditorService.setVisibleTextEditors([])
			expect(simulator.window.visibleTextEditors).toEqual([])
			expect(simulator.window.activeTextEditor).toBeUndefined()
		}) //<
		it('should dispose of editors when they are removed from visibleTextEditors', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1) as TextEditor
			const editor2 = await simulator.window.showTextDocument(doc2) as TextEditor
			const editor1DisposeSpy = vi.spyOn(editor1, 'dispose')
			const editor2DisposeSpy = vi.spyOn(editor2, 'dispose')

			windowModule._textEditorService.setVisibleTextEditors([editor1]) // editor2 removed

			expect(editor1DisposeSpy).not.toHaveBeenCalled()
			expect(editor2DisposeSpy).toHaveBeenCalledOnce() // editor2 should be disposed
			expect(simulator.window.activeTextEditor).toBeUndefined() // Active was editor2

			windowModule._textEditorService.setVisibleTextEditors([]) // editor1 removed

			expect(editor1DisposeSpy).toHaveBeenCalledOnce() // editor1 should be disposed
			expect(editor2DisposeSpy).toHaveBeenCalledOnce() // editor2 already disposed
			expect(simulator.window.activeTextEditor).toBeUndefined()

			editor1DisposeSpy.mockRestore()
			editor2DisposeSpy.mockRestore()
		}) //<
		it('should not dispose of editors when they are still visible', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1) as TextEditor
			const editor2 = await simulator.window.showTextDocument(doc2) as TextEditor
			const editor1DisposeSpy = vi.spyOn(editor1, 'dispose')
			const editor2DisposeSpy = vi.spyOn(editor2, 'dispose')

			windowModule._textEditorService.setVisibleTextEditors([editor1, editor2]) // No change

			expect(editor1DisposeSpy).not.toHaveBeenCalled()
			expect(editor2DisposeSpy).not.toHaveBeenCalled()

			editor1DisposeSpy.mockRestore()
			editor2DisposeSpy.mockRestore()
		}) //<
	}) //<

	describe('Methods: showTextDocument', () => { //>
		// SETUP --------------------->>

		let fileUri1: any, fileUri2: any
		let doc1: TextDocument, doc2: TextDocument

		beforeEach(async () => { //>
			fileUri1 = simulator.Uri.file('/window/show/file1.txt')
			fileUri2 = simulator.Uri.file('/window/show/file2.js')
			await simulator.workspace.fs.writeFile(fileUri1, new TextEncoder().encode('content 1'))
			await simulator.workspace.fs.writeFile(fileUri2, new TextEncoder().encode('content 2'))
			doc1 = await simulator.workspace.openTextDocument(fileUri1) as TextDocument
			doc2 = await simulator.workspace.openTextDocument(fileUri2) as TextDocument

			// Initial state check
			expect(simulator.window.activeTextEditor).toBeUndefined()
			expect(simulator.window.visibleTextEditors).toEqual([])
		}) //<

		//--------------------------------------------------------------------<<

		it('should open and show a document using a Uri', async () => { //>
			const editor = await simulator.window.showTextDocument(fileUri1)

			expect(editor).toBeDefined()
			expect(editor.document.uri.toString()).toBe(fileUri1.toString())
			expect(simulator.window.activeTextEditor).toBe(editor)
			expect(simulator.window.visibleTextEditors).toContain(editor)
		}) //<
		it('should open and show a document using a TextDocument object', async () => { //>
			const editor = await simulator.window.showTextDocument(doc2)

			expect(editor).toBeDefined()
			expect(editor.document).toBe(doc2)
			expect(simulator.window.activeTextEditor).toBe(editor)
			expect(simulator.window.visibleTextEditors).toContain(editor)
		}) //<
		it('should show an existing editor if the document is already visible', async () => { //>
			const editor1 = await simulator.window.showTextDocument(doc1)
			expect(simulator.window.visibleTextEditors).toContain(editor1)

			const editor2 = await simulator.window.showTextDocument(doc1) // Show same doc again

			expect(editor2).toBe(editor1) // Should be the same editor instance
			expect(simulator.window.activeTextEditor).toBe(editor1)
			expect(simulator.window.visibleTextEditors.length).toBe(1)
		}) //<
		it('should show a document in a specified ViewColumn (number overload)', async () => { //>
			const editor = await simulator.window.showTextDocument(doc1, simulator.ViewColumn.Two)

			expect(editor).toBeDefined()
			expect(editor.viewColumn).toBe(simulator.ViewColumn.Two)
			expect(simulator.window.activeTextEditor).toBe(editor)
			expect(simulator.window.visibleTextEditors).toContain(editor)
		}) //<
		it('should show a document in a specified ViewColumn (options overload)', async () => { //>
			const editor = await simulator.window.showTextDocument(doc2, { viewColumn: simulator.ViewColumn.Three })

			expect(editor).toBeDefined()
			expect(editor.viewColumn).toBe(simulator.ViewColumn.Three)
			expect(simulator.window.activeTextEditor).toBe(editor)
			expect(simulator.window.visibleTextEditors).toContain(editor)
		}) //<
		it('should show a document beside the active editor (ViewColumn.Beside)', async () => { //>
			await simulator.window.showTextDocument(doc1!, simulator.ViewColumn.One)
			expect(simulator.window.activeTextEditor?.document).toBe(doc1)

			const editor2 = await simulator.window.showTextDocument(doc2!, simulator.ViewColumn.Beside)

			expect(editor2).toBeDefined()
			expect(editor2.viewColumn).toBe(simulator.ViewColumn.Beside) // Mock behavior might simplify this
			expect(simulator.window.activeTextEditor).toBe(editor2)
			expect(simulator.window.visibleTextEditors.length).toBe(2)
		}) //<
		it('should apply the selection option when showing a document', async () => { //>
			const selectionRange = new simulator.Range(0, 8, 0, 15) // Assuming "content 1" is "content 1"
			const fileUri = simulator.Uri.file('/window/show/select.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Initial content for selection'))
			const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument

			const editor = await simulator.window.showTextDocument(doc, { selection: selectionRange })

			expect(editor).toBeDefined()
			expect(editor.document).toBe(doc)
			expect(editor.selection.isEqual(new simulator.Selection(selectionRange.start, selectionRange.end))).toBe(true)
		}) //<
	}) //<

})