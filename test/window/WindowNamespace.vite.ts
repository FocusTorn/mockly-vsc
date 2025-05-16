// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { TextDocument } from '../../src/modules/workspace/implementations/textDocument'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule'
import type { ITextEditorService } from '../../src/modules/window/_interfaces/ITextEditorService'
import type { ITerminalService } from '../../src/modules/window/_interfaces/ITerminalService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests } from './_setup'

//---------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('WindowNamespace', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let eventBus: IEventBusService
	let windowModule: IWindowModule
	let textEditorService: ITextEditorService
	let terminalService: ITerminalService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		eventBus = setup.eventBus
		windowModule = setup.windowModule
		textEditorService = windowModule._textEditorService // Access via windowModule
		terminalService = windowModule._terminalService // Access via windowModule
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Internal Sanity Checks', () => { //>
		it('should expose the window namespace on the simulator', () => { //>
			expect(simulator.window).toBeDefined()
		
		}) //<
		it('should have initial state for properties', () => { //>
			expect(simulator.window.activeTextEditor).toBeUndefined()
			expect(simulator.window.visibleTextEditors).toEqual([])
			expect(simulator.window.terminals).toEqual([])
			expect(simulator.window.activeTerminal).toBeUndefined()
		
		}) //<
		it('should expose event emitters as functions', () => { //>
			expect(typeof simulator.window.onDidChangeActiveTextEditor).toBe('function')
			expect(typeof simulator.window.onDidChangeVisibleTextEditors).toBe('function')
			expect(typeof simulator.window.onDidChangeTextEditorSelection).toBe('function')
			expect(typeof simulator.window.onDidChangeTextEditorVisibleRanges).toBe('function')
			expect(typeof simulator.window.onDidChangeTextEditorOptions).toBe('function')
			expect(typeof simulator.window.onDidChangeTextEditorViewColumn).toBe('function')
			expect(typeof simulator.window.onDidChangeWindowState).toBe('function')
			expect(typeof simulator.window.onDidOpenTerminal).toBe('function')
			expect(typeof simulator.window.onDidCloseTerminal).toBe('function')
			expect(typeof simulator.window.onDidChangeActiveTerminal).toBe('function')
		
		}) //<
		it('simulator.reset should call reset on the WindowModule', async () => { //>
			const windowModuleResetSpy = vi.spyOn(windowModule, 'reset')
			await simulator.reset() // Reset is handled by setup.afterEach
			expect(windowModuleResetSpy).toHaveBeenCalledOnce()
			windowModuleResetSpy.mockRestore()
		
		}) //<
		it('simulator.reset should call _reset on internal services', async () => { //>
			const textEditorServiceResetSpy = vi.spyOn(textEditorService, '_reset')
			const terminalServiceResetSpy = vi.spyOn(terminalService, '_reset')

			await simulator.reset() // Reset is handled by setup.afterEach

			expect(textEditorServiceResetSpy).toHaveBeenCalledOnce()
			expect(terminalServiceResetSpy).toHaveBeenCalledOnce()

			textEditorServiceResetSpy.mockRestore()
			terminalServiceResetSpy.mockRestore()
		
		}) //<
	
	}) //<

	describe('Event Firing', () => { //>
		// SETUP ------------------->>
		let fileUri1: any, fileUri2: any
		let doc1: TextDocument, doc2: TextDocument

		beforeEach(async () => { //>
			fileUri1 = simulator.Uri.file('/window/events/file1.txt')
			fileUri2 = simulator.Uri.file('/window/events/file2.js')
			await simulator.workspace.fs.writeFile(fileUri1, new TextEncoder().encode('content 1'))
			await simulator.workspace.fs.writeFile(fileUri2, new TextEncoder().encode('content 2'))
			doc1 = await simulator.workspace.openTextDocument(fileUri1) as TextDocument
			doc2 = await simulator.workspace.openTextDocument(fileUri2) as TextDocument
		
		}) //<

		//--------------------------------------------------------------------<<

		it('onDidChangeActiveTextEditor should fire when active editor changes', async () => { //>
			const onDidChangeActiveTextEditorSpy = vi.fn()
			const sub = eventBus.getOnDidChangeActiveTextEditorEvent()(onDidChangeActiveTextEditorSpy)

			const editor1 = await simulator.window.showTextDocument(doc1)
			expect(onDidChangeActiveTextEditorSpy).toHaveBeenCalledOnce()
			expect(onDidChangeActiveTextEditorSpy.mock.calls[0][0]).toBe(editor1)

			const editor2 = await simulator.window.showTextDocument(doc2)
			expect(onDidChangeActiveTextEditorSpy).toHaveBeenCalledTimes(2)
			expect(onDidChangeActiveTextEditorSpy.mock.calls[1][0]).toBe(editor2)

			windowModule._textEditorService.setActiveTextEditor(undefined) // Use internal service method
			expect(onDidChangeActiveTextEditorSpy).toHaveBeenCalledTimes(3)
			expect(onDidChangeActiveTextEditorSpy).toHaveBeenLastCalledWith(undefined)

			sub.dispose()
		
		}) //<
		it('onDidOpenTerminal should fire when a terminal is created', () => { //>
			const onDidOpenTerminalSpy = vi.fn()
			const sub = eventBus.getOnDidOpenTerminalEvent()(onDidOpenTerminalSpy)

			const terminal1 = simulator.window.createTerminal('Term 1')
			expect(onDidOpenTerminalSpy).toHaveBeenCalledOnce()
			expect(onDidOpenTerminalSpy).toHaveBeenCalledWith(terminal1)

			const terminal2 = simulator.window.createTerminal('Term 2')
			expect(onDidOpenTerminalSpy).toHaveBeenCalledTimes(2)
			expect(onDidOpenTerminalSpy).toHaveBeenLastCalledWith(terminal2)

			sub.dispose()
		
		}) //<
		it('onDidCloseTerminal should fire when a terminal is disposed', () => { //>
			const terminal1 = simulator.window.createTerminal('Term 1')
			const terminal2 = simulator.window.createTerminal('Term 2')
			const onDidCloseTerminalSpy = vi.fn()
			const sub = eventBus.getOnDidCloseTerminalEvent()(onDidCloseTerminalSpy)

			terminal1.dispose()
			expect(onDidCloseTerminalSpy).toHaveBeenCalledOnce()
			expect(onDidCloseTerminalSpy).toHaveBeenCalledWith(terminal1)

			terminal2.dispose()
			expect(onDidCloseTerminalSpy).toHaveBeenCalledTimes(2)
			expect(onDidCloseTerminalSpy).toHaveBeenLastCalledWith(terminal2)

			sub.dispose()
		
		}) //<
		it('onDidChangeActiveTerminal should fire when active terminal changes', () => { //>
			const terminal1 = simulator.window.createTerminal('Term 1') // Becomes active
			const terminal2 = simulator.window.createTerminal('Term 2')
			const onDidChangeActiveTerminalSpy = vi.fn()
			const sub = eventBus.getOnDidChangeActiveTerminalEvent()(onDidChangeActiveTerminalSpy)

			// Active terminal is initially terminal1
			onDidChangeActiveTerminalSpy.mockClear() // Clear initial event from creation

			terminal2.show() // Makes terminal2 active
			expect(onDidChangeActiveTerminalSpy).toHaveBeenCalledOnce()
			expect(onDidChangeActiveTerminalSpy).toHaveBeenCalledWith(terminal2)

			terminal1.show() // Makes terminal1 active
			expect(onDidChangeActiveTerminalSpy).toHaveBeenCalledTimes(2)
			expect(onDidChangeActiveTerminalSpy).toHaveBeenLastCalledWith(terminal1)

			terminal1.hide() // Hiding active terminal makes active undefined
			expect(onDidChangeActiveTerminalSpy).toHaveBeenCalledTimes(3)
			expect(onDidChangeActiveTerminalSpy).toHaveBeenLastCalledWith(undefined)

			sub.dispose()
		
		}) //<
	
	}) //<

})
