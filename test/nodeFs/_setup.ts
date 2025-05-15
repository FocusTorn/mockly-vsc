// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { beforeEach, afterEach, vi } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { INodeFsService } from '../../src/modules/nodeFs/_interfaces/INodeFsService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IFileSystemStateService } from '../../src/modules/fileSystem/_interfaces/IFileSystemStateService'
import type { IUriService } from '../../src/modules/fileSystem/_interfaces/IUriService'

//--------------------------------------------------------------------------------------------------------------<<

export interface NodeFsTestSetup { //>
	nodeFsService: INodeFsService
	vfsStateService: IFileSystemStateService // For direct VFS manipulation and verification
	uriService: IUriService // For creating URIs
	utilsService: ICoreUtilitiesService
	simulator: IVSCodeAPISimulatorService
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
	const utilsLogSpy = vi.spyOn(utilsService, 'log').mockImplementation((level, message, ...args) => {
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
 * Sets up the common environment for NodeFsService tests.
 * Must be called *within* a `describe` block.
 * @returns An object containing resolved services.
 */
export function setupNodeFsTests(): NodeFsTestSetup { //>
	const testContext: Partial<NodeFsTestSetup> = {}

	beforeEach(async () => {
		// Clear instances first to ensure fresh resolution
		if (testContext.simulator) { // If simulator exists from a previous test run in the same describe block
			const oldUtils = container.isRegistered('ICoreUtilitiesService') ? container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService') : null
			oldUtils?.setLogLevel(LogLevel.Off) // Silence utils of the old simulator instance
			await testContext.simulator.reset()
		}
		container.clearInstances()

		// Resolve CoreUtilitiesService first and set its log level to Off
		// This ensures that any subsequent resolutions (like the simulator and its modules)
		// get a CoreUtilitiesService that is already silenced.
		const utils = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
		utils.setLogLevel(LogLevel.Off)

		// Resolve other services
		testContext.simulator = container.resolve<IVSCodeAPISimulatorService>('IVSCodeAPISimulatorService')
		testContext.nodeFsService = container.resolve<INodeFsService>('INodeFsService')
		testContext.vfsStateService = container.resolve<IFileSystemStateService>('IFileSystemStateService')
		testContext.uriService = container.resolve<IUriService>('IUriService')
		testContext.utilsService = utils // Assign the already configured utils instance
		testContext.container = container

		// Reset the simulator. Its internal CoreUtilitiesService will now be the one
		// that had its log level set to Off.
		await testContext.simulator.reset()

		// Now, set the desired log level for the test itself on the shared utilsService instance
		testContext.utilsService.setLogLevel(LogLevel.Warning)
	})

	afterEach(async () => {
		// Ensure utilsService is available and set to Off before final reset
		if (container.isRegistered('ICoreUtilitiesService')) {
			const currentUtilsService = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService')
			currentUtilsService.setLogLevel(LogLevel.Off)
		}

		if (testContext.simulator) {
			await testContext.simulator.reset()
		}
		container.clearInstances()
	})

	return testContext as NodeFsTestSetup
} //<