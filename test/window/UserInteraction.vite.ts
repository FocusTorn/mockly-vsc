// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IUserInteractionService } from '../../src/modules/window/_interfaces/IUserInteractionService'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests, silenceStd } from './_setup'

//---------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('Window/UserInteraction', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let utilsService: ICoreUtilitiesService
	let windowModule: IWindowModule
	let userInteractionService: IUserInteractionService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		utilsService = setup.utilsService
		windowModule = setup.windowModule
		userInteractionService = windowModule._userInteractionService // Access via windowModule
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Methods: showInformationMessage and getLastInformationMessage', () => { //>
		it('should store the last information message', async () => { //>
			expect(userInteractionService.getLastInformationMessage()).toBeUndefined()

			await simulator.window.showInformationMessage('First message')
			expect(userInteractionService.getLastInformationMessage()).toBe('First message')

			await simulator.window.showInformationMessage('Second message', 'Item 1', 'Item 2')
			expect(userInteractionService.getLastInformationMessage()).toBe('Second message')

			await simulator.window.showInformationMessage('Third message', { modal: true }, 'Item A')
			expect(userInteractionService.getLastInformationMessage()).toBe('Third message')
		
		}) //<
		it('should clear the last information message on reset', async () => { //>
			await simulator.window.showInformationMessage('Message before reset')
			expect(userInteractionService.getLastInformationMessage()).toBe('Message before reset')

			await simulator.reset() // Reset is handled by setup.afterEach
			expect(userInteractionService.getLastInformationMessage()).toBeUndefined()
		
		}) //<
	
	}) //<

	describe('Methods: showQuickPick', () => { //>
		it('should return undefined by default if no expectation is set', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const result = await simulator.window.showQuickPick(['item1', 'item2'])
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return the expected value when expectQuickPickAndReturn is used', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const expectedItems = ['Option A', 'Option B']
				const returnValue = 'Option B'
				userInteractionService.expectQuickPickAndReturn(expectedItems, returnValue)

				const result = await simulator.window.showQuickPick(expectedItems)
				expect(result).toBe(returnValue)
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return undefined if no quick pick expectation is set', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const result = await simulator.window.showQuickPick(['Option A', 'Option B'])
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should handle multiple queued quick pick responses', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				userInteractionService.expectQuickPickAndReturn(['1', '2'], '1')
				userInteractionService.expectQuickPickAndReturn(['A', 'B'], 'B')

				const result1 = await simulator.window.showQuickPick(['1', '2'])
				expect(result1).toBe('1')

				const result2 = await simulator.window.showQuickPick(['A', 'B'])
				expect(result2).toBe('B')

				const result3 = await simulator.window.showQuickPick(['X', 'Y']) // No expectation for this one
				expect(result3).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should clear queued quick pick responses on reset', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				userInteractionService.expectQuickPickAndReturn([], 1)
				expect((userInteractionService as any)._quickPickQueue.length).toBe(1)

				await simulator.reset() // Reset is handled by setup.afterEach

				expect((userInteractionService as any)._quickPickQueue.length).toBe(0)
				const result = await simulator.window.showQuickPick(['A'])
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
	
	}) //<

	describe('Methods: showInputBox', () => { //>
		it('should return undefined by default if no expectation is set', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const result = await simulator.window.showInputBox({ prompt: 'Enter value' })
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return the expected value when expectInputBoxAndReturn is used', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const returnValue = 'User Input'
				userInteractionService.expectInputBoxAndReturn(returnValue)

				const result = await simulator.window.showInputBox({ prompt: 'Enter value' })
				expect(result).toBe(returnValue)
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return undefined if expectInputBoxAndReturn is used with undefined', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				userInteractionService.expectInputBoxAndReturn(undefined)

				const result = await simulator.window.showInputBox({ prompt: 'Enter value' })
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should handle multiple queued input box responses', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				userInteractionService.expectInputBoxAndReturn('First')
				userInteractionService.expectInputBoxAndReturn('Second')

				const result1 = await simulator.window.showInputBox({ prompt: 'Prompt 1' })
				expect(result1).toBe('First')

				const result2 = await simulator.window.showInputBox({ prompt: 'Prompt 2' })
				expect(result2).toBe('Second')

				const result3 = await simulator.window.showInputBox({ prompt: 'Prompt 3' }) // No expectation
				expect(result3).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should clear queued input box responses on reset', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				userInteractionService.expectInputBoxAndReturn('Input before reset')
				expect((userInteractionService as any)._inputBoxQueue.length).toBe(1)

				await simulator.reset() // Reset is handled by setup.afterEach

				expect((userInteractionService as any)._inputBoxQueue.length).toBe(0)
				const result = await simulator.window.showInputBox({ prompt: 'Prompt after reset' })
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
	
	}) //<

	describe('Methods: showErrorMessage', () => { //>
		it('should log an error message', async () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			utilsService.setLogLevel(LogLevel.Error) // Ensure errors are logged

			try {
				const message = 'Something went wrong!'
				await simulator.window.showErrorMessage(message)

				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Error,
					expect.stringContaining(`[UI MOCK] Error Message: ${message}`),
				)
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return undefined', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const result = await simulator.window.showErrorMessage('Test')
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
	
	}) //<

	describe('Methods: showWarningMessage', () => { //>
		it('should log a warning message', async () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			utilsService.setLogLevel(LogLevel.Warning) // Ensure warnings are logged

			try {
				const message = 'This is a warning!'
				await simulator.window.showWarningMessage(message)

				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Warning,
					expect.stringContaining(`[UI MOCK] Warning Message: ${message}`),
				)
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
		it('should return undefined', async () => { //>
			const localSilence = silenceStd(utilsService)
			try {
				const result = await simulator.window.showWarningMessage('Test')
				expect(result).toBeUndefined()
			
			}
			finally {
				localSilence.dispose()
			
			}
		
		}) //<
	
	}) //<

})
