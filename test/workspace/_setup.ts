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
import type { IWorkspaceModule } from '../../src/modules/workspace/_interfaces/IWorkspaceModule'

//--------------------------------------------------------------------------------------------------------------<<

// Define a type for the setup return value
export interface WorkspaceTestSetup {
	simulator: IVSCodeAPISimulatorService
	eventBus: IEventBusService
	utilsService: ICoreUtilitiesService
	workspaceModule: IWorkspaceModule
	windowModule: IWindowModule
	consoleWarnSpy: ReturnType<typeof vi.spyOn>
	container: typeof container // Expose container if needed for resolving specific services in tests
}

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
			// capturedUtilsLogs does not need restoring as it's a new spy each time
		
		},
		// Expose the captured logs spy for assertion in logging tests
		getCapturedUtilsLogs: () => capturedUtilsLogs,
	}

} //<

/**
 * Sets up the common environment for workspace tests.
 * Must be called *within* a `describe` block.
 * @returns An object containing resolved services and spies.
 */
export function setupWorkspaceTests(): WorkspaceTestSetup { //>
	const testContext: Partial<WorkspaceTestSetup> = {}

	beforeEach(async () => {
		// --- FIX: Ensure log level is Off BEFORE any reset ---
		// Resolve utilsService first to control logging during setup/reset
		let utilsServiceInstance = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		utilsServiceInstance.setLogLevel(LogLevel.Off) // Silence logs during setup and reset

		// Dispose of previous simulator if it exists (this will now log at LogLevel.Off)
		if (testContext.simulator) {
			await testContext.simulator.reset()
		
		}
		container.clearInstances() // Clear singleton instances

		// Re-resolve utilsService after clearing instances (should be the same instance)
		utilsServiceInstance = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		utilsServiceInstance.setLogLevel(LogLevel.Off) // Ensure log level is still Off after clearInstances

		// Resolve simulator and other services AFTER clearing instances
		testContext.simulator = container.resolve<IVSCodeAPISimulatorService>('IVSCodeAPISimulatorService')
		testContext.eventBus = container.resolve<IEventBusService>('IEventBusService')
		// Resolve the WorkspaceModule instance
		testContext.workspaceModule = container.resolve<IWorkspaceModule>('IWorkspaceModule')
		// Resolve the WindowModule instance
		testContext.windowModule = container.resolve<IWindowModule>('IWindowModule')
		// Assign the final utilsService instance
		testContext.utilsService = utilsServiceInstance
		// Assign container
		testContext.container = container

		// Reset the simulator (should log at LogLevel.Off)
		await testContext.simulator.reset()

		// Set the desired default log level for the test itself
		testContext.utilsService.setLogLevel(LogLevel.Warning) // Set default log level for tests

		// Set up a spy on console.warn here, active for all tests in this describe block
		testContext.consoleWarnSpy = vi.spyOn(console, 'warn')
	
	})

	afterEach(async () => {
		testContext.consoleWarnSpy?.mockRestore()

		const currentUtilsService = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		currentUtilsService.setLogLevel(LogLevel.Off)

		await testContext.simulator?.reset()
	
	})

	// Return the context object containing the resolved services and spy
	// Cast to WorkspaceTestSetup as beforeEach ensures properties are set
	return testContext as WorkspaceTestSetup

} //<
