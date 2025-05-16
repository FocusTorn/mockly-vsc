// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Providers', () => { //>
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let utilsService: ICoreUtilitiesService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => {
		simulator = setup.simulator
		utilsService = setup.utilsService
		utilsService.setLogLevel(LogLevel.Warning)
	
	})

	//----------------------------------------------------------------<<

	describe('register...Provider methods', () => { //>
		it('should registerTextDocumentContentProvider log a warning and return a Disposable', () => { //>
			const localSilence = silenceStd(utilsService) // Silence logs for this test
			const capturedLogs = localSilence.getCapturedUtilsLogs() // Get the spy that captures utilsService.log calls

			try {
				// Arrange
				const scheme = 'mock-scheme'
				const provider: any = { // Mock provider
					provideTextDocumentContent: async (_uri: any) => 'mock content',
				}

				// Act
				const disposable = simulator.workspace.registerTextDocumentContentProvider(scheme, provider)

				// Assert
				// Expect utilsService.log to be called with LogLevel.Warning
				expect(capturedLogs).toHaveBeenCalledOnce()
				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Warning, // Check for Warning level
					expect.stringContaining(`WorkspaceNamespace.registerTextDocumentContentProvider for '${scheme}' not fully implemented.`), // Updated expectation
				)
				expect(disposable).toBeDefined()
				expect(typeof disposable.dispose).toBe('function')

				// Cleanup
				disposable.dispose()
			
			}
			finally {
				localSilence.dispose() // Ensure disposal of all spies
			
			}
		
		}) //<

		it('should registerTaskProvider log a warning and return a Disposable', () => { //>
			const localSilence = silenceStd(utilsService) // Silence logs for this test
			const capturedLogs = localSilence.getCapturedUtilsLogs() // Get the spy that captures utilsService.log calls

			try {
				// Arrange
				const type = 'mockTaskType'
				const provider: any = { // Mock provider
					provideTasks: async () => [],
					resolveTask: async () => undefined,
				}

				// Act
				const disposable = simulator.workspace.registerTaskProvider(type, provider)

				// Assert
				// Expect utilsService.log to be called with LogLevel.Warning
				expect(capturedLogs).toHaveBeenCalledOnce()
				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Warning, // Check for Warning level
					expect.stringContaining(`WorkspaceNamespace.registerTaskProvider for type '${type}' not implemented.`), // Updated expectation
				)
				expect(disposable).toBeDefined()
				expect(typeof disposable.dispose).toBe('function')

				// Cleanup
				disposable.dispose()
			
			}
			finally {
				localSilence.dispose() // Ensure disposal of all spies
			
			}
		
		}) //<

		it('should registerFileSystemProvider log a warning and return a Disposable', () => { //>
			const localSilence = silenceStd(utilsService) // Silence logs for this test
			const capturedLogs = localSilence.getCapturedUtilsLogs() // Get the spy that captures utilsService.log calls

			try {
				// Arrange
				const scheme = 'mock-fs-scheme'
				const provider: any = { // Mock provider
					stat: async () => ({ type: simulator.FileType.Unknown, ctime: 0, mtime: 0, size: 0 }),
					readDirectory: async () => [],
					readFile: async () => new Uint8Array(),
					writeFile: async () => {},
					delete: async () => {},
					rename: async () => {},
					copy: async () => {},
					createDirectory: async () => {},
					watch: () => ({ dispose: () => { /* mock dispose */ } }),
				}

				// Act
				const disposable = simulator.workspace.registerFileSystemProvider(scheme, provider)

				// Assert
				// Expect utilsService.log to be called with LogLevel.Warning
				expect(capturedLogs).toHaveBeenCalledOnce()
				expect(capturedLogs).toHaveBeenCalledWith(
					LogLevel.Warning, // Check for Warning level
					expect.stringContaining(`WorkspaceNamespace.registerFileSystemProvider for scheme '${scheme}' not fully implemented`), // Updated expectation
				)
				expect(disposable).toBeDefined()
				expect(typeof disposable.dispose).toBe('function')

				// Cleanup
				disposable.dispose()
			
			}
			finally {
				localSilence.dispose() // Ensure disposal of all spies
			
			}
		
		}) //<
    
    
	}) //<

})

