// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('Window/Terminal', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let utilsService: ICoreUtilitiesService
	let windowModule: IWindowModule
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		utilsService = setup.utilsService
		windowModule = setup.windowModule
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Properties: terminals and activeTerminal', () => { //>
		it('should add terminals to the list when createTerminal is called', () => { //>
			expect(simulator.window.terminals).toEqual([])
			expect(simulator.window.activeTerminal).toBeUndefined()

			const terminal1 = simulator.window.createTerminal('Term 1')

			expect(terminal1).toBeDefined()
			expect(terminal1.name).toBe('Term 1')
			expect(terminal1.processId).toBeInstanceOf(Promise)
			expect(terminal1.state).toBeDefined()
			expect(terminal1.state.isInteractedWith).toBe(false)
			expect(typeof terminal1.sendText).toBe('function')
			expect(typeof terminal1.show).toBe('function')
			expect(typeof terminal1.hide).toBe('function')
			expect(typeof terminal1.dispose).toBe('function')
			expect(simulator.window.terminals.length).toBe(1)
			expect(simulator.window.terminals).toContain(terminal1)
			expect(simulator.window.activeTerminal).toBe(terminal1)
		
		}) //<
		it('should remove terminals from the list when dispose is called', () => { //>
			const terminal1 = simulator.window.createTerminal('Term 1')
			const terminal2 = simulator.window.createTerminal('Term 2')
			expect(simulator.window.terminals.length).toBe(2)

			terminal1.dispose()

			expect(simulator.window.terminals.length).toBe(1)
			expect(simulator.window.terminals).not.toContain(terminal1)
			expect(simulator.window.terminals).toContain(terminal2)
			expect(simulator.window.activeTerminal).toBe(terminal2) // Active terminal should update

			terminal2.dispose()

			expect(simulator.window.terminals).toEqual([])
			expect(simulator.window.activeTerminal).toBeUndefined()
		
		}) //<
		it('should update activeTerminal when terminal.show() is called', () => { //>
			const terminal1 = simulator.window.createTerminal('Term 1')
			const terminal2 = simulator.window.createTerminal('Term 2')
			expect(simulator.window.activeTerminal).toBe(terminal1) // First created is active

			terminal2.show()
			expect(simulator.window.activeTerminal).toBe(terminal2)

			terminal1.show()
			expect(simulator.window.activeTerminal).toBe(terminal1)
		
		}) //<
		it('should update activeTerminal when terminal.hide() is called on the active terminal', () => { //>
			const terminal1 = simulator.window.createTerminal('Term 1')
			const terminal2 = simulator.window.createTerminal('Term 2')
			terminal2.show() // Make terminal2 active
			expect(simulator.window.activeTerminal).toBe(terminal2)

			terminal2.hide() // Hide active terminal
			expect(simulator.window.activeTerminal).toBeUndefined() // Should become undefined as no other terminal was shown

			terminal1.hide() // Hide the other terminal (already not active)
			expect(simulator.window.activeTerminal).toBeUndefined()
		
		}) //<

		it('should update activeTerminal when using _setActiveTerminal (internal control)', () => { //>
			const terminal1 = simulator.window.createTerminal('Term 1')
			const terminal2 = simulator.window.createTerminal('Term 2')
			expect(simulator.window.activeTerminal).toBe(terminal1)

			windowModule._terminalService._setActiveTerminal(terminal2)
			expect(simulator.window.activeTerminal).toBe(terminal2)

			windowModule._terminalService._setActiveTerminal(undefined)
			expect(simulator.window.activeTerminal).toBeUndefined()
		
		}) //<

		it('should clear all terminals during simulator reset', async () => { //>
			simulator.window.createTerminal('Term 1')
			simulator.window.createTerminal('Term 2')
			expect(simulator.window.terminals.length).toBe(2)
			expect(simulator.window.activeTerminal).toBeDefined()

			await simulator.reset() // Reset is handled by setup.afterEach

			expect(simulator.window.terminals).toEqual([])
			expect(simulator.window.activeTerminal).toBeUndefined()
		
		}) //<
	
	}) //<

	describe('Methods: createTerminal', () => { //>
		// SETUP ----------------->>

		let utilsLogSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => { //>
			utilsLogSpy = vi.spyOn(utilsService, 'log') // Spy on the utilsService from setup
			utilsLogSpy.mockImplementation(() => {}) // Mock implementation to prevent actual logging
		
		}) //<

		afterEach(() => { //>
			utilsLogSpy.mockRestore()
		
		}) //<

		//--------------------------------------------------------------------<<

		it('should create a terminal with a name (overload 1)', () => { //>
			const terminal = simulator.window.createTerminal('Named Terminal')

			expect(terminal).toBeDefined()
			expect(terminal.name).toBe('Named Terminal')
			expect(terminal.processId).toBeInstanceOf(Promise)
			expect(terminal.state).toBeDefined()
			expect(terminal.state.isInteractedWith).toBe(false)
			expect(typeof terminal.sendText).toBe('function')
			expect(typeof terminal.show).toBe('function')
			expect(typeof terminal.hide).toBe('function')
			expect(typeof terminal.dispose).toBe('function')
			expect(simulator.window.terminals).toContain(terminal)
		
		}) //<
		it('should create a terminal with options (overload 2)', () => { //>
			const options: vt.TerminalOptions = {
				name: 'Options Terminal',
				shellPath: '/bin/bash',
				shellArgs: ['-c', 'echo hello'],
				cwd: '/home/user',
				env: { MY_VAR: 'test' },
				hideFromUser: true,
			}

			const terminal = simulator.window.createTerminal(options)

			expect(terminal).toBeDefined()
			expect(terminal.name).toBe('Options Terminal')
			expect(terminal.creationOptions).toEqual(expect.objectContaining({
				name: 'Options Terminal',
				shellPath: '/bin/bash',
				shellArgs: ['-c', 'echo hello'],
				cwd: '/home/user',
				env: { MY_VAR: 'test' },
				hideFromUser: true,
			}))
			expect(simulator.window.terminals).toContain(terminal)
		
		}) //<
		it('should create an extension terminal with options (overload 3)', () => { //>
			const options: vt.ExtensionTerminalOptions = {
				name: 'Extension Terminal',
				pty: { // Mock PTY
					onDidWrite: new simulator.EventEmitter<string>().event,
					onDidClose: new simulator.EventEmitter<number | void>().event,
					open: vi.fn(),
					close: vi.fn(),
					handleInput: vi.fn(),
					setDimensions: vi.fn(),
				} as any, // Cast to any to satisfy the complex PTY type for mocking
				isTransient: true,
			}

			const terminal = simulator.window.createTerminal(options)

			expect(terminal).toBeDefined()
			expect(terminal.name).toBe('Extension Terminal')
			expect(terminal.creationOptions).toEqual(expect.objectContaining({
				name: 'Extension Terminal',
				isTransient: true,
				pty: expect.any(Object),
			}))
			expect(simulator.window.terminals).toContain(terminal)
		
		}) //<
		it('should log when sendText is called', () => { //>
			const terminal = simulator.window.createTerminal('Send Text Test')

			terminal.sendText('echo "hello"')
			terminal.sendText('ls -l', true)

			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Info,
				expect.stringContaining('[Terminal Send Text Test] sendText: echo "hello"'),
			)
			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Info,
				expect.stringContaining('[Terminal Send Text Test] sendText: ls -l\\n'),
			)
		
		}) //<
		it('should log when show is called', () => { //>
			const terminal = simulator.window.createTerminal('Show Test')

			terminal.show()
			terminal.show(true)

			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Info,
				expect.stringContaining('[Terminal Show Test] show(preserveFocus: undefined)'),
			)
			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Info,
				expect.stringContaining('[Terminal Show Test] show(preserveFocus: true)'),
			)
		
		}) //<
		it('should log when hide is called', () => { //>
			const terminal = simulator.window.createTerminal('Hide Test')

			terminal.hide()

			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Info,
				expect.stringContaining('[Terminal Hide Test] hide()'),
			)
		
		}) //<
		it('should log when dispose is called', () => { //>
			const terminal = simulator.window.createTerminal('Dispose Test')

			terminal.dispose()

			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Info,
				expect.stringContaining('[Terminal Dispose Test] dispose()'),
			)
		
		}) //<
		it('should add created terminals to the terminals list', () => { //>
			const term1 = simulator.window.createTerminal('T1')
			const term2 = simulator.window.createTerminal('T2')

			expect(simulator.window.terminals.length).toBe(2)
			expect(simulator.window.terminals).toEqual([term1, term2])
		
		}) //<
		it('should set the first created terminal as active', () => { //>
			const term1 = simulator.window.createTerminal('T1')
			simulator.window.createTerminal('T2') // Second terminal

			expect(simulator.window.activeTerminal).toBe(term1)
		
		}) //<
		it('should clear terminals on reset', async () => { //>
			simulator.window.createTerminal('T1')
			simulator.window.createTerminal('T2')
			expect(simulator.window.terminals.length).toBe(2)

			await simulator.reset() // Reset is handled by setup.afterEach

			expect(simulator.window.terminals).toEqual([])
			expect(simulator.window.activeTerminal).toBeUndefined()
		
		}) //<
	
	}) //<

})
