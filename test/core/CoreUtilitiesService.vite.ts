// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'
import { FileSystemError } from '../../src/_vscCore/vscFileSystemError'
import { URI as Uri } from 'vscode-uri'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { IMockNodePathService } from '../../src/modules/nodePath/_interfaces/IMockNodePathService'
import type { IUriService } from '../../src/modules/fileSystem/_interfaces/IUriService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupCoreTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupCoreTests()

describe('CoreUtilitiesService', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let utilsService: ICoreUtilitiesService
	let eventBus: IEventBusService
	let pathService: IMockNodePathService
	let uriService: IUriService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		utilsService = setup.utilsService
		eventBus = setup.eventBus
		pathService = setup.pathService
		uriService = setup.uriService
	
	}) //<

	//-----------------------------------------------------------------------------------<<

	describe('formatLogMessage()', () => { //>
		it('should format string messages directly', () => { //>
			// Arrange
			const message = 'This is a test message.'
			// Act
			const formatted = utilsService.formatLogMessage(message)
			// Assert
			expect(formatted).toBe(message)
		
		}) //<

		it('should format Error objects using stack or message', () => { //>
			// Arrange
			const errorWithMessageOnly = new Error('Error with message only') // Renamed for clarity
			const errorWithStack = new Error('Error with stack')
			errorWithStack.stack = 'Error: Error with stack\n    at Test (test.js:1:1)'

			// Act
			const formattedMessage = utilsService.formatLogMessage(errorWithMessageOnly)
			const formattedStack = utilsService.formatLogMessage(errorWithStack)

			// Assert
			// For an error with only a message, Node.js might still generate a stack.
			// We check if the formatted message STARTS WITH the core error message.
			expect(formattedMessage).toMatch(/^Error: Error with message only/)
			expect(formattedStack).toBe(errorWithStack.stack)
		
		}) //<
		
		it('should format plain objects using JSON.stringify', () => { //>
			// Arrange
			const message = { key: 'value', nested: { num: 123 } }
			// Act
			const formatted = utilsService.formatLogMessage(message)
			// Assert
			expect(formatted).toBe(JSON.stringify(message))
		
		}) //<

		it('should handle JSON.stringify errors for circular objects', () => { //>
			// Arrange
			const circularObj: any = { name: 'circular' }
			circularObj.self = circularObj
			// Act
			const formatted = utilsService.formatLogMessage(circularObj)
			// Assert
			expect(formatted).toBe('[Object (serialization failed)]')
		
		}) //<
	
	}) //<

	describe('Logging Methods & Level Control', () => { //>
		let consoleSpies: {
			trace: ReturnType<typeof vi.spyOn>
			debug: ReturnType<typeof vi.spyOn>
			info: ReturnType<typeof vi.spyOn>
			warn: ReturnType<typeof vi.spyOn>
			error: ReturnType<typeof vi.spyOn>
		}

		beforeEach(() => { //>
			// Spy on actual console methods for these specific tests
			consoleSpies = {
				trace: vi.spyOn(console, 'trace').mockImplementation(() => {}),
				debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
				info: vi.spyOn(console, 'info').mockImplementation(() => {}),
				warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
				error: vi.spyOn(console, 'error').mockImplementation(() => {}),
			}
		
		}) //<

		afterEach(() => { //>
			// Restore all console spies
			Object.values(consoleSpies).forEach(spy => spy.mockRestore())
		
		}) //<

		it('should reflect the LogLevel set by test setup (Warning)', () => { //>
			// Assert
			// Note: setupCoreTests sets the LogLevel to Warning for each test.
			// This test verifies that the service reflects that setting.
			expect(utilsService.getLogLevel()).toBe(LogLevel.Warning)
		
		}) //<
        
		it('setLogLevel should update the current log level and getLogLevel should reflect it', () => { //>
			// Act
			utilsService.setLogLevel(LogLevel.Debug)
			// Assert
			expect(utilsService.getLogLevel()).toBe(LogLevel.Debug)

			// Act
			utilsService.setLogLevel(LogLevel.Error)
			// Assert
			expect(utilsService.getLogLevel()).toBe(LogLevel.Error)
		
		}) //<

		it('setLogLevel should fire onDidChangeLogLevel event via EventBusService', () => { //>
			// Arrange
			const eventSpy = vi.fn()
			const sub = eventBus.getOnDidChangeLogLevelEvent()(eventSpy)
			utilsService.setLogLevel(LogLevel.Info) // Initial set to ensure next change fires
			eventSpy.mockClear()

			// Act
			utilsService.setLogLevel(LogLevel.Warning)

			// Assert
			expect(eventSpy).toHaveBeenCalledOnce()
			expect(eventSpy).toHaveBeenCalledWith(LogLevel.Warning)

			// Act: Set to same level, should not fire
			utilsService.setLogLevel(LogLevel.Warning)
			expect(eventSpy).toHaveBeenCalledOnce() // Still once

			sub.dispose()
		
		}) //<

		it('log should call console.trace for LogLevel.Trace when appropriate', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Trace)
			// Act
			utilsService.log(LogLevel.Trace, 'Trace test')
			// Assert
			expect(consoleSpies.trace).toHaveBeenCalledOnce()
			expect(consoleSpies.trace).toHaveBeenCalledWith('[TRACE] Trace test')
		
		}) //<

		it('log should call console.debug for LogLevel.Debug when appropriate', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Debug)
			consoleSpies.debug.mockClear() // Clear spy after setLogLevel

			// Act
			utilsService.log(LogLevel.Debug, 'Debug test')

			// Assert
			expect(consoleSpies.debug).toHaveBeenCalledOnce()
			expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] Debug test')
		
		}) //<
		
		it('log should call console.info for LogLevel.Info when appropriate', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Info)
			// Act
			utilsService.log(LogLevel.Info, 'Info test')
			// Assert
			expect(consoleSpies.info).toHaveBeenCalledOnce()
			expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] Info test')
		
		}) //<

		it('log should call console.warn for LogLevel.Warning when appropriate', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Warning)
			// Act
			utilsService.log(LogLevel.Warning, 'Warning test')
			// Assert
			expect(consoleSpies.warn).toHaveBeenCalledOnce()
			expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] Warning test')
		
		}) //<

		it('log should call console.error for LogLevel.Error when appropriate', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Error)
			// Act
			utilsService.log(LogLevel.Error, 'Error test')
			// Assert
			expect(consoleSpies.error).toHaveBeenCalledOnce()
			expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] Error test')
		
		}) //<

		it('helper methods should call the correct console method via log', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Trace) // Log everything

			// Act
			utilsService.trace('Trace via helper')
			utilsService.debug('Debug via helper')
			utilsService.info('Info via helper')
			utilsService.warn('Warn via helper')
			utilsService.error('Error via helper')

			// Assert
			expect(consoleSpies.trace).toHaveBeenCalledWith('[TRACE] Trace via helper')
			expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] Debug via helper')
			expect(consoleSpies.info).toHaveBeenCalledWith('[INFO] Info via helper')
			expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] Warn via helper')
			expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] Error via helper')
		
		}) //<

		it('should not log messages below the current log level', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Warning) // Log only Warning and Error

			// Act
			utilsService.trace('Should not see trace')
			utilsService.debug('Should not see debug')
			utilsService.info('Should not see info')
			utilsService.warn('Should see warn')
			utilsService.error('Should see error')

			// Assert
			expect(consoleSpies.trace).not.toHaveBeenCalled()
			expect(consoleSpies.debug).not.toHaveBeenCalled()
			expect(consoleSpies.info).not.toHaveBeenCalled()
			expect(consoleSpies.warn).toHaveBeenCalledOnce()
			expect(consoleSpies.error).toHaveBeenCalledOnce()
		
		}) //<

		it('should not log anything if current log level is Off', () => { //>
			// Arrange
			utilsService.setLogLevel(LogLevel.Off)

			// Act
			utilsService.trace('Off trace')
			utilsService.debug('Off debug')
			utilsService.info('Off info')
			utilsService.warn('Off warn')
			utilsService.error('Off error')
			// Also test direct log call
			utilsService.log(LogLevel.Error, 'Direct log when Off')


			// Assert
			expect(consoleSpies.trace).not.toHaveBeenCalled()
			expect(consoleSpies.debug).not.toHaveBeenCalled()
			expect(consoleSpies.info).not.toHaveBeenCalled()
			expect(consoleSpies.warn).not.toHaveBeenCalled()
			expect(consoleSpies.error).not.toHaveBeenCalled()
		
		}) //<
	
	}) //<

	describe('Error Creation Methods', () => { //>
		it('createError should return a standard Error object', () => { //>
			// Arrange
			const message = 'A standard error occurred.'
			// Act
			const error = utilsService.createError(message)
			// Assert
			expect(error).toBeInstanceOf(Error)
			expect(error.message).toBe(message)
			expect((error as any).code).toBeUndefined()
		
		}) //<

		it('createError should include code if provided', () => { //>
			// Arrange
			const message = 'Error with a code.'
			const code = 'ERR_CODE_123'
			// Act
			const error = utilsService.createError(message, code)
			// Assert
			expect(error).toBeInstanceOf(Error)
			expect(error.message).toBe(message)
			expect((error as any).code).toBe(code)
		
		}) //<

		it('createFileSystemError should return a FileSystemError instance for known codes', () => { //>
			// Arrange
			const testUri = uriService.file('/test/path.txt')
			const testPathString = '/test/string/path.txt'

			const knownCodes: (keyof typeof FileSystemError)[] = [
				'FileNotFound',
				'FileExists',
				'FileNotADirectory',
				'FileIsADirectory',
				'NoPermissions',
				'Unavailable',
			]

			// Act & Assert
			for (const code of knownCodes) {
				const errorWithUri = utilsService.createFileSystemError(code, testUri)
				expect(errorWithUri).toBeInstanceOf(FileSystemError)
				expect(errorWithUri.name).toBe('FileSystemError') // Check constructor behavior
				expect((errorWithUri as FileSystemError).code).toBe(code)
				expect((errorWithUri as FileSystemError).uri).toBe(testUri)

				const errorWithPathString = utilsService.createFileSystemError(code, testPathString)
				expect(errorWithPathString).toBeInstanceOf(FileSystemError)
				expect((errorWithPathString as FileSystemError).code).toBe(code)
				expect((errorWithPathString as FileSystemError).uri?.path).toBe(pathService.normalize(testPathString))
			
			}
		
		}) //<

		it('createFileSystemError should use Uri for message if string path is provided and message is not', () => { //>
			// Arrange
			const pathStr = '/test/specific.txt'
			const expectedUri = uriService.file(pathService.normalize(pathStr))
			// Act
			const error = utilsService.createFileSystemError('FileNotFound', pathStr)
			// Assert
			expect(error.message).toBe(`FileNotFound: ${expectedUri.toString()}`)
		
		}) //<

		it('createFileSystemError should use custom message if provided', () => { //>
			// Arrange
			const testUri = uriService.file('/test/custom.txt')
			const customMessage = 'This is a custom file system error message.'
			// Act
			const error = utilsService.createFileSystemError('FileExists', testUri, customMessage)
			// Assert
			expect(error.message).toBe(customMessage) // Custom message should override default
		
		}) //<

		it('createFileSystemError should return a generic Error for unknown codes', () => { //>
			// Arrange
			const unknownCode = 'UNKNOWN_FS_ERROR'
			const testUri = uriService.file('/test/unknown.txt')
			// Act
			const error = utilsService.createFileSystemError(unknownCode, testUri)
			// Assert
			expect(error).toBeInstanceOf(Error)
			expect(error).not.toBeInstanceOf(FileSystemError) // Should be a generic Error
			expect((error as any).code).toBe(unknownCode)
			expect(error.message).toBe(`${unknownCode}: ${testUri.toString()}`)
		
		}) //<

		it('createNotImplementedError should return an Error object', () => { //>
			// Act
			const error = utilsService.createNotImplementedError()
			// Assert
			expect(error).toBeInstanceOf(Error)
			expect(error.name).toBe('NotImplementedError') // As per custom class
			expect(error.message).toBe('Feature not implemented')
		
		}) //<

		it('createNotImplementedError should include featureName in message if provided', () => { //>
			// Arrange
			const featureName = 'MyCoolFeature'
			// Act
			const error = utilsService.createNotImplementedError(featureName)
			// Assert
			expect(error).toBeInstanceOf(Error)
			expect(error.name).toBe('NotImplementedError')
			expect(error.message).toBe(`Feature not implemented: ${featureName}`)
		
		}) //<
	
	}) //<

})
