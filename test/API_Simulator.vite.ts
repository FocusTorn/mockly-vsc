// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'
import { LogLevel } from '../src/_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from '../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IEventBusService } from '../src/core/_interfaces/IEventBusService'
import type { ICoreUtilitiesService } from '../src/core/_interfaces/ICoreUtilitiesService'
import type { IWorkspaceModule } from '../src/modules/workspace/_interfaces/IWorkspaceModule'
import type { IWindowModule } from '../src/modules/window/_interfaces/IWindowModule'
import type { ICommandsModule } from '../src/modules/commands/_interfaces/ICommandsModule'
import type { IEnvModule } from '../src/modules/env/_interfaces/IEnvModule'
import type { IExtensionsModule } from '../src/modules/extensions/_interfaces/IExtensionsModule'
import type { TextDocument } from '../src/modules/workspace/implementations/textDocument'
import type { TextEditor } from '../src/modules/window/implementations/textEditor'
import type { IWorkspaceNamespace } from '../src/modules/workspace/_interfaces/IWorkspaceNamespace'
import type { IWindowNamespace } from '../src/modules/window/_interfaces/IWindowNamespace'
import type { ICommandsNamespace } from '../src/modules/commands/_interfaces/ICommandsNamespace'
import type { IEnvNamespace } from '../src/modules/env/_interfaces/IEnvNamespace'
import type { IExtensionsNamespace } from '../src/modules/extensions/_interfaces/IExtensionsNamespace'
import type { IMockNodePathService } from '../src/modules/fileSystem/_interfaces/IMockNodePathService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWindowTests } from './window/_setup'

// Use the window setup

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWindowTests()

describe('API Sim', () => {
	// SETUP ----------->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let eventBus: IEventBusService // Renamed from _eventBus to match setup
	let utilsService: ICoreUtilitiesService
	let workspaceModule: IWorkspaceModule
	let windowModule: IWindowModule
	let commandsModule: ICommandsModule
	let envModule: IEnvModule
	let extensionsModule: IExtensionsModule
	let pathService: IMockNodePathService // Added for path testing
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(() => { //>
		simulator = setup.simulator
		eventBus = setup.eventBus
		utilsService = setup.utilsService
		windowModule = setup.windowModule // Directly from setup
		// Access other modules via the simulator's properties
		workspaceModule = simulator._workspaceModule
		commandsModule = simulator._commandsModule
		envModule = simulator._envModule
		extensionsModule = simulator._extensionsModule
		pathService = simulator._fileSystemModule.path // Get instance for spying
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<

	describe('Initialization & Reset', () => { //>
		it('should initialize without errors', () => { //>
			expect(simulator).toBeDefined()
			expect(simulator.workspace).toBeDefined()
			expect(simulator.window).toBeDefined()
			expect(simulator.commands).toBeDefined()
			expect(simulator.env).toBeDefined()
			expect(simulator.Uri).toBeDefined()
			expect(simulator.path).toBeDefined() // Verify path exists
		
		}) //<

		it('should reset the simulator state correctly', async () => { //>
			// Arrange: Setup some initial state
			const cmdId = 'test.command.reset'
			const cmdHandler = vi.fn()
			simulator.commands.registerCommand(cmdId, cmdHandler)
			const fileUri = simulator.Uri.file('/test/reset-test.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('content'))
			const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument
			const activeEditor = await simulator.window.showTextDocument(doc) as TextEditor
			await simulator.env.clipboard.writeText('clipboard content')

			// Verify initial state
			expect(commandsModule._commandsService._getRegisteredCommandIds()).toContain(cmdId)
			expect(simulator.workspace.textDocuments.length).toBe(1)
			expect(activeEditor?.document.uri.toString()).toBe(fileUri.toString())
			expect(simulator.window.visibleTextEditors.length).toBe(1)
			expect(await simulator.env.clipboard.readText()).toBe('clipboard content')

			// Act: Reset the simulator (handled by setup.afterEach, but can call explicitly for this test)
			await simulator.reset()

			// Assert: Check if state is cleared
			expect(commandsModule._commandsService._getRegisteredCommandIds().length).toBe(0)
			expect(simulator.workspace.textDocuments.length).toBe(0)
			expect(simulator.window.activeTextEditor).toBeUndefined()
			expect(simulator.window.visibleTextEditors.length).toBe(0)
			expect(await simulator.env.clipboard.readText()).toBe('')
			await expect(simulator.workspace.fs.stat(fileUri)).rejects.toThrowError(/FileNotFound/)
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
		
		}) //<

		it('should call reset/clear on dependent services during reset', async () => { //>
			// Arrange: Spy on dependent services' clear/reset methods
			// Access services via the resolved module instances from the simulator
			const vfsSpy = vi.spyOn(workspaceModule._fileSystemService, '_clear')
			const wsSpy = vi.spyOn(workspaceModule._workspaceStateService, 'clearWorkspace')
			const mockTextDocumentServiceSpy = vi.spyOn(workspaceModule._textDocumentService, '_reset')

			const eventBusSpy = vi.spyOn(eventBus, 'reset') // eventBus from setup
			const windowModuleResetSpy = vi.spyOn(windowModule, 'reset')
			const textEditorServiceSpy = vi.spyOn(windowModule._textEditorService, '_reset')
			const userInteractionServiceSpy = vi.spyOn(windowModule._userInteractionService, '_reset')
			const terminalServiceSpy = vi.spyOn(windowModule._terminalService, '_reset')
			const outputChannelServiceSpy = vi.spyOn(windowModule._outputChannelService, '_clearOutputChannels')

			const commandsModuleResetSpy = vi.spyOn(commandsModule, 'reset')
			const envModuleResetSpy = vi.spyOn(envModule, 'reset')
			const extensionsModuleResetSpy = vi.spyOn(extensionsModule, 'reset')

			// Spy on the Workspace Module's reset method
			const workspaceModuleResetSpy = vi.spyOn(workspaceModule, 'reset')
			const fileSystemModuleResetSpy = vi.spyOn(simulator._fileSystemModule, 'reset') // Spy on FileSystemModule reset

			// Act
			await simulator.reset() // This is also called by setup.afterEach

			// Assert
			// The simulator's reset should call the module's reset
			expect(workspaceModuleResetSpy).toHaveBeenCalledOnce() // Simulator calls module reset
			expect(windowModuleResetSpy).toHaveBeenCalledOnce()
			expect(commandsModuleResetSpy).toHaveBeenCalledOnce()
			expect(envModuleResetSpy).toHaveBeenCalledOnce()
			expect(extensionsModuleResetSpy).toHaveBeenCalledOnce()
			expect(fileSystemModuleResetSpy).toHaveBeenCalledOnce() // Verify FileSystemModule reset is called


			// Module resets should call their internal services' reset/clear
			expect(vfsSpy).toHaveBeenCalledOnce()
			expect(wsSpy).toHaveBeenCalledOnce()
			expect(mockTextDocumentServiceSpy).toHaveBeenCalledOnce()

			expect(textEditorServiceSpy).toHaveBeenCalledOnce()
			expect(userInteractionServiceSpy).toHaveBeenCalledOnce()
			expect(terminalServiceSpy).toHaveBeenCalledOnce()
			expect(outputChannelServiceSpy).toHaveBeenCalledOnce()

			// EventBus is reset directly by the simulator
			expect(eventBusSpy).toHaveBeenCalledOnce()

			// Cleanup spies
			vfsSpy.mockRestore()
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
			fileSystemModuleResetSpy.mockRestore() // Restore FileSystemModule spy
		
		}) //<
	
	}) //<

	describe('Module/Namespace Interactions', () => { //>
		// SETUP -->>
		/* eslint-disable unused-imports/no-unused-vars */
		let workspaceNamespace: IWorkspaceNamespace
		let windowNamespace: IWindowNamespace
		let commandsNamespace: ICommandsNamespace
		let envNamespace: IEnvNamespace
		let extensionsNamespace: IExtensionsNamespace
		/* eslint-enable unused-imports/no-unused-vars */

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
			extensionsModule._extensionsService._addExtension(testExtension) // Use internal service to add

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
			expect(openTextDocumentSpy).toHaveBeenCalledWith(fileUri)
			openTextDocumentSpy.mockRestore()
		
		}) //<
	
	}) //<

	describe('Path Accessor (simulator.path)', () => { //>
		it('should provide access to the path service', () => { //>
			// Assert
			expect(simulator.path).toBeDefined()
			expect(simulator.path).toBe(pathService) // Check if it's the same instance
			expect(typeof simulator.path.join).toBe('function')
			expect(typeof simulator.path.normalize).toBe('function')
			expect(typeof simulator.path.basename).toBe('function')
			expect(typeof simulator.path.dirname).toBe('function')
			expect(typeof simulator.path.relative).toBe('function')
			expect(typeof simulator.path.resolve).toBe('function')
			expect(simulator.path.sep).toBeDefined()
			expect(simulator.path.delimiter).toBeDefined()
			expect(simulator.path.posix).toBeDefined()
			expect(simulator.path.win32).toBeDefined()
		
		}) //<

		it('should delegate calls to the underlying path service', () => { //>
			// Arrange
			const joinSpy = vi.spyOn(pathService, 'join')
			const normalizeSpy = vi.spyOn(pathService, 'normalize')
			const basenameSpy = vi.spyOn(pathService, 'basename')

			// Act
			simulator.path.join('a', 'b', 'c')
			simulator.path.normalize('/a/b/../c')
			simulator.path.basename('/a/b/file.txt', '.txt')

			// Assert
			expect(joinSpy).toHaveBeenCalledOnce()
			expect(joinSpy).toHaveBeenCalledWith('a', 'b', 'c')
			expect(normalizeSpy).toHaveBeenCalledOnce()
			expect(normalizeSpy).toHaveBeenCalledWith('/a/b/../c')
			expect(basenameSpy).toHaveBeenCalledOnce()
			expect(basenameSpy).toHaveBeenCalledWith('/a/b/file.txt', '.txt')

			// Cleanup
			joinSpy.mockRestore()
			normalizeSpy.mockRestore()
			basenameSpy.mockRestore()
		
		}) //<

		it('should return correct results for basic path operations (posix mode)', () => { //>
			// Arrange (ensure posix mode if necessary, though it's default)
			pathService.setMode('posix')

			// Act & Assert
			expect(simulator.path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')).toBe('/foo/bar/baz/asdf')
			expect(simulator.path.normalize('/foo/bar//baz/asdf/quux/..')).toBe('/foo/bar/baz/asdf')
			expect(simulator.path.basename('/foo/bar/baz/asdf/quux.html')).toBe('quux.html')
			expect(simulator.path.basename('/foo/bar/baz/asdf/quux.html', '.html')).toBe('quux')
			expect(simulator.path.dirname('/foo/bar/baz/asdf/quux.html')).toBe('/foo/bar/baz/asdf')
			expect(simulator.path.sep).toBe('/')
		
		}) //<

		it('should return correct results for basic path operations (win32 mode)', () => { //>
			// Arrange
			pathService.setMode('win32')

			// Act & Assert
			expect(simulator.path.join('C:\\foo', 'bar', 'baz\\asdf', 'quux', '..')).toBe('C:\\foo\\bar\\baz\\asdf')
			expect(simulator.path.normalize('C:\\foo\\bar\\\\baz\\asdf\\quux\\..')).toBe('C:\\foo\\bar\\baz\\asdf')
			expect(simulator.path.basename('C:\\foo\\bar\\baz\\asdf\\quux.html')).toBe('quux.html')
			expect(simulator.path.basename('C:\\foo\\bar\\baz\\asdf\\quux.html', '.html')).toBe('quux')
			expect(simulator.path.dirname('C:\\foo\\bar\\baz\\asdf\\quux.html')).toBe('C:\\foo\\bar\\baz\\asdf')
			expect(simulator.path.sep).toBe('\\')

			// Cleanup - Reset to default mode after test
			pathService.setMode('posix')
		
		}) //<
	
	}) //<

})