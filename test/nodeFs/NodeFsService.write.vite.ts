// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Buffer } from 'node:buffer'

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

describe('NodeFsService - Write Operations', () => {
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
	
	})

	//-----------------------------------------------------------------------------------<<

	describe('writeFileSync()', () => { //>
		// ... other tests ...

		it('should respect encoding option for string data (mock logs warning for non-utf8)', async () => { //>
			// Arrange
			const filePath = uriService.file('/write_encoding.txt')
			const content = 'Test encoding'
			// Default LogLevel.Warning is active from setup
			const stdMocker = silenceStd(setup.utilsService)

			// Act
			nodeFsService.writeFileSync(filePath, content, { encoding: 'latin1' })

			// Assert
			const capturedLogs = stdMocker.getCapturedUtilsLogs()
			const warningLogFound = capturedLogs.mock.calls.some(call =>
				call[0] === LogLevel.Warning
				&& typeof call[1] === 'string'
				&& call[1].includes('Encoding \'latin1\' for string data is not fully supported'),
			)
			expect(warningLogFound).toBe(true)

			const writtenContent = await vfsStateService.readFile(filePath)
			expect(new TextDecoder().decode(writtenContent)).toBe(content)
			stdMocker.dispose()
		
		}) //<

		it('should ignore mode and flag options (mock logs trace)', async () => { //>
			// Arrange
			const filePath = uriService.file('/write_options_ignored.txt')
			const content = 'Options test'
			const originalLevel = setup.utilsService.getLogLevel()
			const stdMocker = silenceStd(setup.utilsService) // MODIFIED: Instantiate silenceStd before setLogLevel
			setup.utilsService.setLogLevel(LogLevel.Trace)


			// Act
			nodeFsService.writeFileSync(filePath, content, { mode: 0o777, flag: 'a' })

			// Assert
			const capturedLogs = stdMocker.getCapturedUtilsLogs()
			const modeLogFound = capturedLogs.mock.calls.some(call =>
				call[0] === LogLevel.Trace
				&& typeof call[1] === 'string'
				&& call[1].includes('\'mode\' option 511 is ignored'),
			)
			const flagLogFound = capturedLogs.mock.calls.some(call =>
				call[0] === LogLevel.Trace
				&& typeof call[1] === 'string'
				&& call[1].includes('\'flag\' option a is ignored'),
			)
			expect(modeLogFound).toBe(true)
			expect(flagLogFound).toBe(true)
			expect(await vfsStateService.exists(filePath)).toBe(true)
			stdMocker.dispose()
			setup.utilsService.setLogLevel(originalLevel)
		
		}) //<
	
	}) //<

	describe('mkdirSync()', () => { //>
		// ... other tests ...

		it('should ignore mode option (mock logs trace)', async () => { //>
			// Arrange
			const dirPath = uriService.file('/mkdir_mode_ignored_at_root')
			const originalLevel = setup.utilsService.getLogLevel()
			const stdMocker = silenceStd(setup.utilsService) // MODIFIED: Instantiate silenceStd before setLogLevel
			setup.utilsService.setLogLevel(LogLevel.Trace)


			// Act
			nodeFsService.mkdirSync(dirPath, { mode: 0o777 })

			// Assert
			const capturedLogs = stdMocker.getCapturedUtilsLogs()
			const modeLogFound = capturedLogs.mock.calls.some(call =>
				call[0] === LogLevel.Trace
				&& typeof call[1] === 'string'
				&& call[1].includes('\'mode\' option 511 is ignored'),
			)
			expect(modeLogFound).toBe(true)
			expect(await vfsStateService.exists(dirPath)).toBe(true)
			const stats = await vfsStateService.stat(dirPath)
			expect(stats.type).toBe(FileType.Directory)
			stdMocker.dispose()
			setup.utilsService.setLogLevel(originalLevel)
		
		}) //<
	
	}) //<

})
