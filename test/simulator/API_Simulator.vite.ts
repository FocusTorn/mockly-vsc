// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { posix as nodePosix, win32 as nodeWin32 } from 'node:path' // Corrected import for nodePosix

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'
import { LogLevel } from '../../src/_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService.ts'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService.ts'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService.ts'
import type { IWorkspaceModule } from '../../src/modules/workspace/_interfaces/IWorkspaceModule.ts'
import type { IWindowModule } from '../../src/modules/window/_interfaces/IWindowModule.ts'
import type { ICommandsModule } from '../../src/modules/commands/_interfaces/ICommandsModule.ts'
import type { IEnvModule } from '../../src/modules/env/_interfaces/IEnvModule.ts'
import type { IExtensionsModule } from '../../src/modules/extensions/_interfaces/IExtensionsModule.ts'
import type { TextDocument } from '../../src/modules/workspace/implementations/textDocument.ts'
import type { TextEditor } from '../../src/modules/window/implementations/textEditor.ts'
import type { IWorkspaceNamespace } from '../../src/modules/workspace/_interfaces/IWorkspaceNamespace.ts'
import type { IWindowNamespace } from '../../src/modules/window/_interfaces/IWindowNamespace.ts'
import type { ICommandsNamespace } from '../../src/modules/commands/_interfaces/ICommandsNamespace.ts'
import type { IEnvNamespace } from '../../src/modules/env/_interfaces/IEnvNamespace.ts'
import type { IExtensionsNamespace } from '../../src/modules/extensions/_interfaces/IExtensionsNamespace.ts'
import type { IMockNodePathService } from '../../src/modules/nodePath/_interfaces/IMockNodePathService.ts'

//= IMPLEMENTATIONS ===========================================================================================
import { setupSimulatorTests } from './_setup.ts'
import { mockly } from '../../src/index.ts'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupSimulatorTests()

describe('API Sim', () => {
	// SETUP -->>
	let simulator: IVSCodeAPISimulatorService
	let eventBus: IEventBusService
	// eslint-disable-next-line unused-imports/no-unused-vars
	let utilsService: ICoreUtilitiesService
	let workspaceModule: IWorkspaceModule
	let windowModule: IWindowModule
	let commandsModule: ICommandsModule
	let envModule: IEnvModule
	let extensionsModule: IExtensionsModule
	let nodePathService: IMockNodePathService

	beforeEach(() => {
		simulator = setup.simulator
		eventBus = setup.eventBus
		utilsService = setup.utilsService
		windowModule = setup.windowModule
		workspaceModule = simulator._workspaceModule
		commandsModule = simulator._commandsModule
		envModule = simulator._envModule
		extensionsModule = simulator._extensionsModule
		nodePathService = simulator.path
	
	})

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Initialization & Reset', () => { //>
		it('should initialize without errors', () => { //>
			expect(simulator).toBeDefined()
			expect(simulator.workspace).toBeDefined()
			expect(simulator.window).toBeDefined()
			expect(simulator.commands).toBeDefined()
			expect(simulator.env).toBeDefined()
			expect(simulator.Uri).toBeDefined()
			expect(simulator.path).toBeDefined()
		
		}) //<
		
		it('should call reset/clear on dependent services during reset', async () => { //>
			// Arrange: Spy on dependent services' clear/reset methods
			const fileSystemModuleResetSpy = vi.spyOn(simulator._fileSystemModule, 'reset')
			const vfsStateServiceClearSpy = vi.spyOn(simulator._fileSystemModule._fileSystemStateService, 'clear') // Spy on VFSState clear

			const wsSpy = vi.spyOn(workspaceModule._workspaceStateService, 'clearWorkspace')
			const mockTextDocumentServiceSpy = vi.spyOn(workspaceModule._textDocumentService, '_reset')

			const eventBusSpy = vi.spyOn(eventBus, 'reset')
			const windowModuleResetSpy = vi.spyOn(windowModule, 'reset')
			const textEditorServiceSpy = vi.spyOn(windowModule._textEditorService, '_reset')
			const userInteractionServiceSpy = vi.spyOn(windowModule._userInteractionService, '_reset')
			const terminalServiceSpy = vi.spyOn(windowModule._terminalService, '_reset')
			const outputChannelServiceSpy = vi.spyOn(windowModule._outputChannelService, '_clearOutputChannels')

			const commandsModuleResetSpy = vi.spyOn(commandsModule, 'reset')
			const envModuleResetSpy = vi.spyOn(envModule, 'reset')
			const extensionsModuleResetSpy = vi.spyOn(extensionsModule, 'reset')
			const workspaceModuleResetSpy = vi.spyOn(workspaceModule, 'reset')

			// Act
			await simulator.reset()

			// Assert
			expect(workspaceModuleResetSpy).toHaveBeenCalledOnce()
			expect(windowModuleResetSpy).toHaveBeenCalledOnce()
			expect(commandsModuleResetSpy).toHaveBeenCalledOnce()
			expect(envModuleResetSpy).toHaveBeenCalledOnce()
			expect(extensionsModuleResetSpy).toHaveBeenCalledOnce()
			expect(fileSystemModuleResetSpy).toHaveBeenCalledOnce()

			// FileSystemModule's reset should call its internal services' clear
			expect(vfsStateServiceClearSpy).toHaveBeenCalledOnce() // Check if VFSStateService.clear was called

			// WorkspaceModule's reset calls
			expect(wsSpy).toHaveBeenCalledOnce()
			expect(mockTextDocumentServiceSpy).toHaveBeenCalledOnce()

			// WindowModule's reset calls
			expect(textEditorServiceSpy).toHaveBeenCalledOnce()
			expect(userInteractionServiceSpy).toHaveBeenCalledOnce()
			expect(terminalServiceSpy).toHaveBeenCalledOnce()
			expect(outputChannelServiceSpy).toHaveBeenCalledOnce()

			expect(eventBusSpy).toHaveBeenCalledOnce()

			// Cleanup spies
			vfsStateServiceClearSpy.mockRestore()
			wsSpy.mockRestore()
			mockTextDocumentServiceSpy.mockRestore()
			eventBusSpy.mockRestore()
			windowModuleResetSpy.mockRestore()
			textEditorServiceSpy.mockRestore()
			userInteractionServiceSpy.mockRestore()
			terminalServiceSpy.mockRestore()
			outputChannelServiceSpy.mockRestore()
			commandsModuleResetSpy.mockRestore()
			envModuleResetSpy.mockRestore()
			extensionsModuleResetSpy.mockRestore()
			fileSystemModuleResetSpy.mockRestore()
			workspaceModuleResetSpy.mockRestore()
		
		}) //<
	
	}) //<

	describe('Module/Namespace Interactions', () => { //>
		// SETUP -->>
		let workspaceNamespace: IWorkspaceNamespace
		let windowNamespace: IWindowNamespace
		let commandsNamespace: ICommandsNamespace
		let envNamespace: IEnvNamespace
		let extensionsNamespace: IExtensionsNamespace

		beforeEach(() => { //>
			workspaceNamespace = simulator.workspace
			windowNamespace = simulator.window
			commandsNamespace = simulator.commands
			envNamespace = simulator.env
			extensionsNamespace = simulator.extensions
		
		}) //<

		//-----------------------------------------------------------------------------------<<

		it('simulator.workspace should delegate calls to WorkspaceNamespace', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/delegate-ws.txt')
			const openTextDocumentSpy = vi.spyOn(workspaceNamespace, 'openTextDocument')

			// Act
			await simulator.workspace.openTextDocument(fileUri)

			// Assert
			expect(openTextDocumentSpy).toHaveBeenCalledOnce()
			expect(openTextDocumentSpy).toHaveBeenCalledWith(fileUri)
			openTextDocumentSpy.mockRestore()
		
		}) //<

		it('simulator.window should delegate calls to WindowNamespace', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/delegate-window.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))
			const doc = await simulator.workspace.openTextDocument(fileUri)
			const showTextDocumentSpy = vi.spyOn(windowNamespace, 'showTextDocument')

			// Act
			await simulator.window.showTextDocument(doc)

			// Assert
			expect(showTextDocumentSpy).toHaveBeenCalledOnce()
			expect(showTextDocumentSpy).toHaveBeenCalledWith(doc)
			showTextDocumentSpy.mockRestore()
		
		}) //<

		it('simulator.commands should delegate calls to CommandsNamespace', async () => { //>
			// Arrange
			const cmdId = 'test.delegateCommand'
			const handler = vi.fn()
			const registerCommandSpy = vi.spyOn(commandsNamespace, 'registerCommand')

			// Act
			simulator.commands.registerCommand(cmdId, handler, undefined)

			// Assert
			expect(registerCommandSpy).toHaveBeenCalledOnce()
			expect(registerCommandSpy).toHaveBeenCalledWith(cmdId, handler, undefined)
			registerCommandSpy.mockRestore()
		
		}) //<

		it('simulator.env should delegate calls to EnvNamespace', async () => { //>
			// Arrange
			const testText = 'delegate clipboard test'
			const writeTextSpy = vi.spyOn(envNamespace.clipboard, 'writeText')

			// Act
			await simulator.env.clipboard.writeText(testText)

			// Assert
			expect(writeTextSpy).toHaveBeenCalledOnce()
			expect(writeTextSpy).toHaveBeenCalledWith(testText)
			writeTextSpy.mockRestore()
		
		}) //<

		it('simulator.extensions should delegate calls to ExtensionsNamespace', async () => { //>
			// Arrange
			const testExtension: any = { id: 'test.extension', packageJSON: {}, isActive: false, extensionUri: simulator.Uri.file('/ext'), extensionPath: '/ext/', exports: undefined, activate: async () => {} }
			extensionsModule._extensionsService._addExtension(testExtension)

			const getExtensionSpy = vi.spyOn(extensionsNamespace, 'getExtension')

			// Act
			const result = simulator.extensions.getExtension(testExtension.id)

			// Assert
			expect(getExtensionSpy).toHaveBeenCalledOnce()
			expect(getExtensionSpy).toHaveBeenCalledWith(testExtension.id)
			expect(result).toBe(testExtension)
			getExtensionSpy.mockRestore()
		
		}) //<

		it('window.showTextDocument should call workspace.openTextDocument', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/window-calls-workspace.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('content'))
			const openTextDocumentSpy = vi.spyOn(workspaceNamespace, 'openTextDocument')

			// Act
			await simulator.window.showTextDocument(fileUri)

			// Assert
			expect(openTextDocumentSpy).toHaveBeenCalledOnce()
			// The argument to openTextDocument within showTextDocument might be the Uri object itself,
			// or a new Uri object with the same path. For robust testing, check path.
			expect(openTextDocumentSpy.mock.calls[0][0]!.toString()).toBe(fileUri.toString())
			openTextDocumentSpy.mockRestore()
		
		}) //<
        
	}) //<

	describe('Path Accessor (simulator.path)', () => { //>
		// The 'nodePathService' variable is available from the outer 'API Sim' describe block's beforeEach.
		// It is assigned `simulator.path`.

		beforeEach(() => { //>
			// Ensure the path service starts in a consistent mode for these specific tests.
			// The main simulator.reset() does not reset the internal mode of the singleton NodePathService.
			nodePathService.setMode('posix')
		
		}) //<

		it('should be defined and in posix mode after explicit set in beforeEach', () => { //>
			expect(nodePathService).toBeDefined()
			expect(nodePathService.getMode()).toBe('posix')
			expect(nodePathService.sep).toBe(nodePosix.sep)
		
		}) //<
	
		it('should allow switching modes and perform mode-specific operations', () => { //>
			// Switch to win32
			nodePathService.setMode('win32')
			expect(nodePathService.getMode()).toBe('win32')
			expect(nodePathService.sep).toBe(nodeWin32.sep)
			expect(nodePathService.join('C:\\foo', 'bar')).toBe(nodeWin32.join('C:\\foo', 'bar'))
			expect(nodePathService.isAbsolute('C:\\foo')).toBe(nodeWin32.isAbsolute('C:\\foo'))
	
			// Switch back to posix
			nodePathService.setMode('posix')
			expect(nodePathService.getMode()).toBe('posix')
			expect(nodePathService.sep).toBe(nodePosix.sep)
			expect(nodePathService.join('/foo', 'bar')).toBe(nodePosix.join('/foo', 'bar'))
			expect(nodePathService.isAbsolute('/foo')).toBe(nodePosix.isAbsolute('/foo'))
		
		}) //<
	
		it('should perform basic path operations like basename correctly per mode', () => { //>
			// Posix mode (set in beforeEach)
			expect(nodePathService.basename('/foo/bar/test.txt')).toBe(nodePosix.basename('/foo/bar/test.txt'))
			expect(nodePathService.basename('/foo/bar/test.txt', '.txt')).toBe(nodePosix.basename('/foo/bar/test.txt', '.txt'))
	
			// Switch to win32 for win32 specific test
			nodePathService.setMode('win32')
			expect(nodePathService.basename('C:\\foo\\bar\\test.txt')).toBe(nodeWin32.basename('C:\\foo\\bar\\test.txt'))
			expect(nodePathService.basename('C:\\foo\\bar\\test.txt', '.txt')).toBe(nodeWin32.basename('C:\\foo\\bar\\test.txt', '.txt'))
		
		}) //<
	
		it('should be the same instance as simulator.nodePathService', () => { //>
			expect(simulator.path).toBe(simulator.nodePathService)
		
		}) //<
	
		it('should be the same instance as mockly.node.path', () => { //>
			expect(simulator.path).toStrictEqual(mockly.node.path)
		
		}) //<
	
		describe('posix property (simulator.path.posix)', () => { //>
			it('should provide a posix-specific path service instance', () => { //>
				const posixPath = nodePathService.posix
				expect(posixPath).toBeDefined()
				expect(posixPath.getMode()).toBe('posix')
				expect(posixPath.sep).toBe(nodePosix.sep)
				expect(posixPath.join('foo', 'bar', '..', 'baz')).toBe(nodePosix.join('foo', 'bar', '..', 'baz'))
			
			}) //<
	
			it('should be independent of the main path object\'s mode', () => { //>
				const posixPath = nodePathService.posix
				nodePathService.setMode('win32') // Change mode of main path object
				expect(posixPath.getMode()).toBe('posix') // posixPath should remain posix
				expect(posixPath.sep).toBe(nodePosix.sep)
			
			}) //<
	
			it('should return a new instance each time .posix is accessed', () => { //>
				const posixPath1 = nodePathService.posix
				const posixPath2 = nodePathService.posix
				expect(posixPath1).not.toBe(posixPath2)
				// They should still behave the same and match nodePosix
				expect(posixPath1.join('a', 'b')).toBe(nodePosix.join('a', 'b'))
				expect(posixPath2.join('a', 'b')).toBe(nodePosix.join('a', 'b'))
			
			}) //<
		
		}) //<
	
		describe('win32 property (simulator.path.win32)', () => { //>
			it('should provide a win32-specific path service instance', () => { //>
				const win32Path = nodePathService.win32
				expect(win32Path).toBeDefined()
				expect(win32Path.getMode()).toBe('win32')
				expect(win32Path.sep).toBe(nodeWin32.sep)
				expect(win32Path.join('C:\\foo', 'bar', '..', 'baz')).toBe(nodeWin32.join('C:\\foo', 'bar', '..', 'baz'))
			
			}) //<
	
			it('should be independent of the main path object\'s mode', () => { //>
				const win32Path = nodePathService.win32
				nodePathService.setMode('posix') // Change mode of main path object (already posix from beforeEach, but for clarity)
				expect(win32Path.getMode()).toBe('win32') // win32Path should remain win32
				expect(win32Path.sep).toBe(nodeWin32.sep)
			
			}) //<
	
			it('should return a new instance each time .win32 is accessed', () => { //>
				const win32Path1 = nodePathService.win32
				const win32Path2 = nodePathService.win32
				expect(win32Path1).not.toBe(win32Path2)
				// They should still behave the same and match nodeWin32
				expect(win32Path1.join('C:\\a', 'b')).toBe(nodeWin32.join('C:\\a', 'b'))
				expect(win32Path2.join('C:\\a', 'b')).toBe(nodeWin32.join('C:\\a', 'b'))
			
			}) //<
		
		}) //<
	
	}) //<

})
