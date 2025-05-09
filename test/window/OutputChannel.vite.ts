// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IOutputChannelService } from '../../src/modules/window/_interfaces/IOutputChannelService'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('OutputChannel', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let utilsService: ICoreUtilitiesService
	let windowModule: IWindowModule
	let outputChannelService: IOutputChannelService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		utilsService = setup.utilsService
		windowModule = setup.windowModule
		outputChannelService = windowModule._outputChannelService // Access via windowModule
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Methods: createOutputChannel', () => { //>
		// SETUP ------------>>

		let consoleLogSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => { //>
			consoleLogSpy = vi.spyOn(console, 'log')
			consoleLogSpy.mockImplementation(() => {})
		}) //<

		afterEach(() => { //>
			consoleLogSpy.mockRestore()
		}) //<

		//------------------------------------------------<<

		it('should create a standard output channel with correct properties', () => { //>
			const channel = simulator.window.createOutputChannel('Standard Channel')

			expect(channel).toBeDefined()
			expect(channel.name).toBe('Standard Channel')
			expect(typeof channel.append).toBe('function')
			expect(typeof channel.appendLine).toBe('function')
			expect(typeof channel.clear).toBe('function')
			expect(typeof channel.show).toBe('function')
			expect(typeof channel.hide).toBe('function')
			expect(typeof channel.dispose).toBe('function')
			expect((channel as any).logLevel).toBeUndefined()
			expect((channel as any).trace).toBeUndefined()
		}) //<
		it('should create a log output channel with correct properties', () => { //>
			const logChannel = simulator.window.createOutputChannel('Log Channel', { log: true })

			expect(logChannel).toBeDefined()
			expect(logChannel.name).toBe('Log Channel')
			expect(typeof logChannel.append).toBe('function')
			expect(typeof logChannel.appendLine).toBe('function')
			expect(typeof logChannel.clear).toBe('function')
			expect(typeof logChannel.show).toBe('function')
			expect(typeof logChannel.hide).toBe('function')
			expect(typeof logChannel.dispose).toBe('function')
			expect(logChannel.logLevel).toBeDefined()
			expect(typeof logChannel.onDidChangeLogLevel).toBe('function')
			expect(typeof logChannel.trace).toBe('function')
			expect(typeof logChannel.debug).toBe('function')
			expect(typeof logChannel.info).toBe('function')
			expect(typeof logChannel.warn).toBe('function')
			expect(typeof logChannel.error).toBe('function')
		}) //<
		it('should return the same instance for channels with the same name', () => { //>
			const channel1 = simulator.window.createOutputChannel('Shared Channel')
			const channel2 = simulator.window.createOutputChannel('Shared Channel')
			expect(channel2).toBe(channel1)
		}) //<
		it('should log output for standard channel append and appendLine', () => { //>
			const channel = simulator.window.createOutputChannel('Standard Log Test')

			channel.append('Hello')
			channel.appendLine('World')
			channel.append('Another')
			channel.appendLine('Line')

			expect(consoleLogSpy).toHaveBeenCalledWith('[Output Standard Log Test] Hello')
			expect(consoleLogSpy).toHaveBeenCalledWith('[Output Standard Log Test] World')
			expect(consoleLogSpy).toHaveBeenCalledWith('[Output Standard Log Test] Another')
			expect(consoleLogSpy).toHaveBeenCalledWith('[Output Standard Log Test] Line')
			expect(consoleLogSpy).toHaveBeenCalledTimes(4)
		}) //<
		it('should log output for log channel methods based on log level', () => { //>
			const logChannel = simulator.window.createOutputChannel('Log Log Test', { log: true }) as vt.LogOutputChannel
			// Default log level is Info (3)

			logChannel.trace('Trace message')
			logChannel.debug('Debug message')
			logChannel.info('Info message')
			logChannel.warn('Warning message')
			logChannel.error('Error message')
			logChannel.append('Append message')
			logChannel.appendLine('AppendLine message')

			expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('[LogOutput Log Log Test - TRACE]'))
			expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('[LogOutput Log Log Test - DEBUG]'))
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - INFO] Info message')
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - WARNING] Warning message')
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - ERROR] Error message')
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - INFO] Append message')
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - INFO] AppendLine message')
			expect(consoleLogSpy).toHaveBeenCalledTimes(5)

			;(logChannel as any)._setLogLevel(LogLevel.Trace) // Internal method for testing
			consoleLogSpy.mockClear()

			logChannel.trace('Trace message 2')
			logChannel.debug('Debug message 2')
			logChannel.info('Info message 2')

			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - TRACE] Trace message 2')
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - DEBUG] Debug message 2')
			expect(consoleLogSpy).toHaveBeenCalledWith('[LogOutput Log Log Test - INFO] Info message 2')
			expect(consoleLogSpy).toHaveBeenCalledTimes(3)
		}) //<
		it('should clear output channels on reset', async () => { //>
			simulator.window.createOutputChannel('Channel 1')
			simulator.window.createOutputChannel('Channel 2', { log: true })
			expect((outputChannelService as any)._outputChannels.size).toBe(2)

			await simulator.reset()

			expect((outputChannelService as any)._outputChannels.size).toBe(0)
		}) //<
		it('should log clear, show, and hide calls', () => { //>
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

			const channel = simulator.window.createOutputChannel('Action Log Test')
			const clearSpy = vi.spyOn(channel, 'clear')
			const showSpy = vi.spyOn(channel, 'show')
			const hideSpy = vi.spyOn(channel, 'hide')

			channel.clear()
			channel.show()
			channel.hide()

			expect(clearSpy).toHaveBeenCalled()
			expect(showSpy).toHaveBeenCalled()
			expect(hideSpy).toHaveBeenCalled()

			consoleSpy.mockRestore() // Restore console.log spy
		}) //<
		it('should remove channel from internal map when disposed', () => { //>
			const localSilence = silenceStd(utilsService) // Silence logs for this test
			try {
				const channel = simulator.window.createOutputChannel('Disposable Channel')
				const outputChannelsMap = (outputChannelService as any)._outputChannels
				expect(outputChannelsMap.has('Disposable Channel')).toBe(true)

				channel.dispose()

				expect(outputChannelsMap.has('Disposable Channel')).toBe(false)
				expect((channel as any).logLevel).toBeUndefined() // Check if it's a standard channel
			}
			finally {
				localSilence.dispose()
			}
		}) //<
	}) //<

})