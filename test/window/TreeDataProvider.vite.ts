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

describe('Window/TreeDataProvider', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let utilsService: ICoreUtilitiesService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		utilsService = setup.utilsService
		// Set a default log level for tests if not already handled by setup
		utilsService.setLogLevel(LogLevel.Warning)
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Methods: registerTreeDataProvider', () => { //>
		it('should log a message and return a Disposable', () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			utilsService.setLogLevel(LogLevel.Info) // Ensure info logs are captured

			try {
				// Arrange
				const viewId = 'myTreeView'
				const provider: any = { // Mock provider
					getChildren: async () => [],
					getTreeItem: (_element: any) => ({ label: 'Item' }),
				}

				// Act
				const disposable = simulator.window.registerTreeDataProvider(viewId, provider)

				// Assert
				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Info,
					expect.stringContaining(`[UI MOCK] registerTreeDataProvider called for view: ${viewId}`),
				)
				expect(disposable).toBeDefined()
				expect(typeof disposable.dispose).toBe('function')

				// Cleanup
				disposable.dispose()
			
			}
			finally {
				utilsService.setLogLevel(LogLevel.Warning) // Restore default log level
				localSilence.dispose()
			
			}
		
		}) //<
		it('should log a debug message when disposed', () => { //>
			const localSilence = silenceStd(utilsService)
			const capturedLogs = localSilence.getCapturedUtilsLogs()
			utilsService.setLogLevel(LogLevel.Debug) // Ensure debug logs are captured

			try {
				const viewId = 'disposableTreeView'
				const provider: any = { getChildren: async () => [], getTreeItem: (_e: any) => ({ label: 'Test' }) } // Provide a valid TreeItem
				const disposable = simulator.window.registerTreeDataProvider(viewId, provider)

				capturedLogs.mockClear() // Clear logs from creation

				disposable.dispose()

				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Debug,
					expect.stringContaining(`[UI MOCK] Disposing TreeDataProvider for view: ${viewId}`),
				)
			
			}
			finally {
				utilsService.setLogLevel(LogLevel.Warning) // Restore default log level
				localSilence.dispose()
			
			}
		
		}) //<
	
	}) //<

})
