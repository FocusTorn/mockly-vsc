// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { beforeEach, afterEach, vi } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule'

//--------------------------------------------------------------------------------------------------------------<<

export interface WindowTestSetup { //>
	simulator: IVSCodeAPISimulatorService
	eventBus: IEventBusService
	utilsService: ICoreUtilitiesService
	windowModule: IWindowModule
	consoleWarnSpy: ReturnType<typeof vi.spyOn>
	container: typeof container
} //<

/**
 * Silences standard console output and captures logs from the utility service.
 * @param utilsService - The core utility service instance.
 * @returns An object with a dispose method to restore spies and a method to get captured logs.
 */
export function silenceStd(utilsService: ICoreUtilitiesService) { //>
	// Spy on console methods and mock them to do nothing
	const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation((..._args: any[]) => {})
	const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation((..._args: any[]) => {})
	const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((..._args: any[]) => {})
	const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation((..._args: any[]) => {})
	const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation((..._args: any[]) => {})

	// Create a separate spy to capture utilsService.log calls
	const capturedUtilsLogs = vi.fn()
	// Spy on utilsService.log and REPLACE its implementation
	// The new implementation ONLY calls capturedUtilsLogs and does NOT call the original log logic
	const utilsLogSpy = vi.spyOn(utilsService, 'log').mockImplementation((level, message, ...args) => {
		// Only capture logs at or below the current utilsService log level
		// This mimics the original utilsService.log behavior of respecting the log level
		if (level >= utilsService.getLogLevel()) {
			capturedUtilsLogs(level, message, ...args)
		
		}
	
	})

	return {
		dispose: () => {
			consoleLogSpy.mockRestore()
			consoleWarnSpy.mockRestore()
			consoleErrorSpy.mockRestore()
			consoleInfoSpy.mockRestore()
			consoleDebugSpy.mockRestore()
			utilsLogSpy.mockRestore()
	
		},
		getCapturedUtilsLogs: () => capturedUtilsLogs,
	}

} //<

/**
 * Sets up the common environment for window tests.
 * Must be called *within* a `describe` block.
 * @returns An object containing resolved services and spies.
 */
export function setupWindowTests(): WindowTestSetup { //>
	const testContext: Partial<WindowTestSetup> = {}

	beforeEach(async () => {
		// Ensure log level is Off BEFORE any reset
		let utilsServiceInstance = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		utilsServiceInstance.setLogLevel(LogLevel.Off) // Silence logs during setup and reset

		// Dispose of previous simulator if it exists
		if (testContext.simulator) {
			await testContext.simulator.reset()
		
		}
		container.clearInstances() // Clear singleton instances

		// Re-resolve utilsService after clearing instances
		utilsServiceInstance = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		utilsServiceInstance.setLogLevel(LogLevel.Off) // Ensure log level is still Off

		// Resolve simulator and other services AFTER clearing instances
		testContext.simulator = container.resolve<IVSCodeAPISimulatorService>('IVSCodeAPISimulatorService')
		testContext.eventBus = container.resolve<IEventBusService>('IEventBusService')
		testContext.windowModule = container.resolve<IWindowModule>('IWindowModule') // Resolve WindowModule
		testContext.utilsService = utilsServiceInstance
		testContext.container = container

		// Reset the simulator
		await testContext.simulator.reset()

		// Set the desired default log level for the test itself
		testContext.utilsService.setLogLevel(LogLevel.Warning)

		// Set up a spy on console.warn
		testContext.consoleWarnSpy = vi.spyOn(console, 'warn')
	
	})

	afterEach(async () => {
		testContext.consoleWarnSpy?.mockRestore()

		const currentUtilsService = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		currentUtilsService.setLogLevel(LogLevel.Off)

		await testContext.simulator?.reset()
	
	})

	return testContext as WindowTestSetup

} //<
