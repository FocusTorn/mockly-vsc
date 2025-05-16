// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('StatusBarItem', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let utilsService: ICoreUtilitiesService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		utilsService = setup.utilsService
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Methods: createStatusBarItem', () => { //>
		// SETUP ------------>>

		beforeEach(() => { //>
			// No specific setup needed beyond the main beforeEach
		}) //<

		//------------------------------------------------<<

		it('should create a status bar item with default properties', () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const item = simulator.window.createStatusBarItem()

				expect(item).toBeDefined()
				expect(item.alignment).toBe(simulator.StatusBarAlignment.Left)
				expect(item.priority).toBeUndefined()
				expect(item.text).toBe('')
				expect(item.tooltip).toBeUndefined()
				expect(item.color).toBeUndefined()
				expect(item.backgroundColor).toBeUndefined()
				expect(item.command).toBeUndefined()
				expect(item.name).toBeUndefined()
				expect(item.accessibilityInformation).toBeUndefined()
				expect(item.id).toBeDefined()
				expect(typeof item.id).toBe('string')
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should create a status bar item with specified properties (alignment, priority)', () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const item = simulator.window.createStatusBarItem(simulator.StatusBarAlignment.Right, 10)

				expect(item.alignment).toBe(simulator.StatusBarAlignment.Right)
				expect(item.priority).toBe(10)
				expect(item.text).toBe('')
				expect(item.id).toBeDefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should create a status bar item with specified properties (id, alignment, priority)', () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const item = simulator.window.createStatusBarItem('my-custom-id', simulator.StatusBarAlignment.Left, 5)

				expect(item.id).toBe('my-custom-id')
				expect(item.alignment).toBe(simulator.StatusBarAlignment.Left)
				expect(item.priority).toBe(5)
				expect(item.text).toBe('')
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should create a status bar item with specified id, priority', () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const item = simulator.window.createStatusBarItem('my-other-id', undefined, 20)

				expect(item.id).toBe('my-other-id')
				expect(item.alignment).toBe(simulator.StatusBarAlignment.Left) // Default alignment
				expect(item.priority).toBe(20)
				expect(item.text).toBe('')
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<

		it('should create a status bar item with default alignment and priority when only id is provided', () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const item = simulator.window.createStatusBarItem('my-item-id-only')

				expect(item).toBeDefined()
				expect(item.id).toBe('my-item-id-only')
				expect(item.alignment).toBe(simulator.StatusBarAlignment.Left)
				expect(item.priority).toBeUndefined()
				expect(typeof item.show).toBe('function')
				expect(typeof item.hide).toBe('function')
				expect(typeof item.dispose).toBe('function')
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return a disposable object', () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const item = simulator.window.createStatusBarItem()
				expect(typeof item.dispose).toBe('function')
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should log when show() is called', () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			const originalLogLevel = utilsService.getLogLevel()
			utilsService.setLogLevel(LogLevel.Trace) // Ensure trace logs are captured

			try {
				const item = simulator.window.createStatusBarItem('log-show')
				capturedLogs.mockClear() // Clear logs from item creation

				item.show()

				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Trace,
					expect.stringContaining('[UI MOCK] StatusBarItem log-show.show()'),
				)
				expect(capturedLogs).toHaveBeenCalledTimes(1)
			
			}
			finally {
				utilsService.setLogLevel(originalLogLevel) // Restore original log level
				localSilence.dispose()
			
			}
		
		}) //<
		it('should log when hide() is called', () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			const originalLogLevel = utilsService.getLogLevel()
			utilsService.setLogLevel(LogLevel.Trace) // Ensure trace logs are captured

			try {
				const item = simulator.window.createStatusBarItem('log-hide')
				capturedLogs.mockClear() // Clear logs from item creation

				item.hide()

				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Trace,
					expect.stringContaining('[UI MOCK] StatusBarItem log-hide.hide()'),
				)
				expect(capturedLogs).toHaveBeenCalledTimes(1)
			
			}
			finally {
				utilsService.setLogLevel(originalLogLevel) // Restore original log level
				localSilence.dispose()
			
			}
		
		}) //<
		it('should log when dispose() is called', () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			const originalLogLevel = utilsService.getLogLevel()
			utilsService.setLogLevel(LogLevel.Debug) // Ensure debug logs are captured

			try {
				const item = simulator.window.createStatusBarItem('log-dispose')
				capturedLogs.mockClear() // Clear logs from item creation

				item.dispose()

				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Debug,
					expect.stringContaining('[UI MOCK] StatusBarItem log-dispose.dispose()'),
				)
				expect(capturedLogs).toHaveBeenCalledTimes(1)
			
			}
			finally {
				utilsService.setLogLevel(originalLogLevel) // Restore original log level
				localSilence.dispose()
			
			}
		
		}) //<
	
	}) //<

})
