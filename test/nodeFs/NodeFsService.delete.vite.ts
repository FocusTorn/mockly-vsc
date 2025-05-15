// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { FileType, LogLevel } from '../../src/_vscCore/vscEnums'
import type { FileSystemError } from '../../src/_vscCore/vscFileSystemError'

//= INJECTED TYPES ============================================================================================
import type { INodeFsService } from '../../src/modules/nodeFs/_interfaces/INodeFsService'
import type { IFileSystemStateService } from '../../src/modules/fileSystem/_interfaces/IFileSystemStateService'
import type { IUriService } from '../../src/modules/fileSystem/_interfaces/IUriService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupNodeFsTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

describe('NodeFsService - Delete Operations', () => {
	// SETUP -->>
	const setup = setupNodeFsTests()
	let nodeFsService: INodeFsService
	let vfsStateService: IFileSystemStateService
	let uriService: IUriService

	beforeEach(async () => {
		nodeFsService = setup.nodeFsService
		vfsStateService = setup.vfsStateService
		uriService = setup.uriService
		await vfsStateService.clear()
		setup.utilsService.setLogLevel(LogLevel.Warning)
	
	})

	//-----------------------------------------------------------------------------------<<

	describe('rmSync()', () => { //>
		// ... other tests ...

		it('should log warning if recursive is true for a file path', async () => { //>
			// Arrange
			const filePath = uriService.file('/file_recursive_warn.txt')
			await vfsStateService.addFile(filePath, { content: 'content' })
			// Default LogLevel.Warning is active
			const stdMocker = silenceStd(setup.utilsService)

			// Act
			nodeFsService.rmSync(filePath, { recursive: true })

			// Assert
			const capturedLogs = stdMocker.getCapturedUtilsLogs()
			const warningLogFound = capturedLogs.mock.calls.some(call =>
				call[0] === LogLevel.Warning
				&& typeof call[1] === 'string'
				&& call[1].includes('\'recursive\' option has no effect when removing a file'),
			)
			expect(warningLogFound).toBe(true)
			expect(await vfsStateService.exists(filePath)).toBe(false)
			stdMocker.dispose()
		
		}) //<

		it('should ignore retryDelay and maxRetries options (mock logs trace)', async () => { //>
			// Arrange
			const filePath = uriService.file('/file_options_ignored_rm.txt')
			await vfsStateService.addFile(filePath, { content: 'content' })
			const originalLevel = setup.utilsService.getLogLevel()
			const stdMocker = silenceStd(setup.utilsService) // MODIFIED: Instantiate silenceStd before setLogLevel
			setup.utilsService.setLogLevel(LogLevel.Trace)


			// Act
			nodeFsService.rmSync(filePath, { retryDelay: 100, maxRetries: 3 })

			// Assert
			const capturedLogs = stdMocker.getCapturedUtilsLogs()
			const retryLogFound = capturedLogs.mock.calls.some(call =>
				call[0] === LogLevel.Trace
				&& typeof call[1] === 'string'
				&& call[1].includes('\'retryDelay\' and \'maxRetries\' options are ignored'),
			)
			expect(retryLogFound).toBe(true)
			expect(await vfsStateService.exists(filePath)).toBe(false)
			stdMocker.dispose()
			setup.utilsService.setLogLevel(originalLevel)
		
		}) //<
	
	}) //<

})
