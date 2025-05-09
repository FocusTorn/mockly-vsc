// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

//= TSYRINGE ==================================================================================================
import type { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceStateService } from '../../src/modules/workspace/_interfaces/IWorkspaceStateService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests } from './_setup'
import type { IFileSystemService } from '../../src/modules/workspace/_interfaces/IFileSystemService'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('WorkspaceStateService Unit Tests', () => {
    // SETUP -->>
    /* eslint-disable unused-imports/no-unused-vars */
    let simulator: IVSCodeAPISimulatorService
	let eventBus: IEventBusService
	let utilsService: ICoreUtilitiesService
	let diContainer: typeof container
	let wsStateService: IWorkspaceStateService
	let onChangeFoldersSpy: ReturnType<typeof vi.fn>
    /* eslint-enable unused-imports/no-unused-vars */
    
	beforeEach(async () => {
		simulator = setup.simulator
		eventBus = setup.eventBus
		utilsService = setup.utilsService
		diContainer = setup.container

		wsStateService = diContainer.resolve<IWorkspaceStateService>('IWorkspaceStateService')
		onChangeFoldersSpy = vi.fn()
		eventBus.getOnDidChangeWorkspaceFoldersEvent()(onChangeFoldersSpy)
	}) //<

    //---------------------------------------------------------------------------------------------------------------<<
    
	describe('Properties', () => { //>
		it('should reflect workspaceFolders from WorkspaceStateService', async () => { //>
			// Arrange
			const folderUri1 = simulator.Uri.file('/project1')
			const folderUri2 = simulator.Uri.file('/project2')
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)

			// Assert Initial State (from simulator perspective, which reads from service)
			expect(simulator.workspace.workspaceFolders).toBeUndefined()

			// Act & Assert: Add one folder via service
			await wsStateService.addWorkspaceFolder(folderUri1)
			expect(simulator.workspace.workspaceFolders).toBeDefined()
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri1.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('project1')

			// Act & Assert: Add second folder via service
			await wsStateService.addWorkspaceFolder(folderUri2)
			expect(simulator.workspace.workspaceFolders?.length).toBe(2)
			expect(simulator.workspace.workspaceFolders?.[1].uri.toString()).toBe(folderUri2.toString())

			// Act & Assert: Remove one folder via service
			await wsStateService.removeWorkspaceFolder(folderUri1)
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri2.toString())

			// Act & Assert: Clear workspace via service
			await wsStateService.clearWorkspace()
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
		}) //<
		it('should reflect name and workspaceFile from WorkspaceStateService', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/myProject')
			const workspaceFileUri = simulator.Uri.file('/myWorkspace.code-workspace')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Assert Initial State
			expect(simulator.workspace.name).toBeUndefined()
			expect(simulator.workspace.workspaceFile).toBeUndefined()

			// Act & Assert: Single folder via service
			await wsStateService.addWorkspaceFolder(folderUri)
			expect(simulator.workspace.name).toBe('myProject')
			expect(simulator.workspace.workspaceFile).toBeUndefined()

			// Act & Assert: Set with workspace file via service
			await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri)
			expect(simulator.workspace.name).toBe('myWorkspace')
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())

			// Act & Assert: Clear workspace via service
			await wsStateService.clearWorkspace()
			expect(simulator.workspace.name).toBeUndefined()
			expect(simulator.workspace.workspaceFile).toBeUndefined()
		}) //<
	}) //<

	describe('setWorkspaceFolders', () => { //>
		beforeEach(() => { //>
			utilsService.setLogLevel(LogLevel.Off)
		}) //<

		it('should set a single valid folder, becoming SINGLE_ROOT', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/single/')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri])

			// Assert State (read from simulator, which reflects service state)
			expect(simulator.workspace.workspaceFolders).toBeDefined()
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('single')
			expect(simulator.workspace.workspaceFolders?.[0].index).toBe(0)
			expect(simulator.workspace.name).toBe('single')
			expect(simulator.workspace.workspaceFile).toBeUndefined()
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: folderUri })],
				removed: [],
			})
		}) //<
		it('should set multiple valid folders, becoming MULTI_ROOT', async () => { //>
			// Arrange
			const folderUri1 = simulator.Uri.file('/project/multi1/')
			const folderUri2 = simulator.Uri.file('/project/multi2/sub/')
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2])

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(2)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri1.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('multi1')
			expect(simulator.workspace.workspaceFolders?.[0].index).toBe(0)
			expect(simulator.workspace.workspaceFolders?.[1].uri.toString()).toBe(folderUri2.toString())
			expect(simulator.workspace.workspaceFolders?.[1].name).toBe('sub')
			expect(simulator.workspace.workspaceFolders?.[1].index).toBe(1)
			expect(simulator.workspace.name).toBe('multi1')
			expect(simulator.workspace.workspaceFile).toBeUndefined()
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({
				added: [
					expect.objectContaining({ uri: folderUri1 }),
					expect.objectContaining({ uri: folderUri2 }),
				],
				removed: [],
			})
		}) //<
		it('should set folders with a workspace file, becoming MULTI_ROOT and deriving name', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/ws-file-proj/')
			const workspaceFileUri = simulator.Uri.file('/project/myWorkspace.code-workspace')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri)

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri.toString())
			expect(simulator.workspace.name).toBe('myWorkspace')
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: folderUri })],
				removed: [],
			})
		}) //<
		it('should clear folders when setting an empty array, becoming NONE', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/to-clear/')
			await simulator.workspace.fs.createDirectory(folderUri)
			await wsStateService.setWorkspaceFolders([folderUri])
			onChangeFoldersSpy.mockClear()

			// Act
			await wsStateService.setWorkspaceFolders([])

			// Assert State
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
			expect(simulator.workspace.name).toBeUndefined()
			expect(simulator.workspace.workspaceFile).toBeUndefined()
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({
				added: [],
				removed: [expect.objectContaining({ uri: folderUri })],
			})
		}) //<
		it('should skip non-existent or non-directory folders', async () => { //>
			// Arrange
			const validFolderUri = simulator.Uri.file('/project/set-valid/')
			const nonExistentUri = simulator.Uri.file('/project/set-non-existent/')
			const fileUri = simulator.Uri.file('/project/set-is-file.txt')
			await simulator.workspace.fs.createDirectory(validFolderUri)
			await simulator.workspace.fs.writeFile(fileUri, new Uint8Array())

			// Act
			await wsStateService.setWorkspaceFolders([validFolderUri, nonExistentUri, fileUri])

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(validFolderUri.toString())
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: validFolderUri })],
				removed: [],
			})
		}) //<
		it('should skip duplicate folder URIs', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/set-duplicate/')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri, folderUri])

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri.toString())
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: folderUri })],
				removed: [],
			})
		}) //<
		it('should handle a mix of Uri and WorkspaceFolder objects', async () => { //>
			// Arrange
			const folderUri1 = simulator.Uri.file('/project/mix-uri/')
			const folderUri2 = simulator.Uri.file('/project/mix-wf/')
			const customName = 'CustomMixName'
			const workspaceFolderObj: any = { uri: folderUri2, name: customName, index: 99 }
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri1, workspaceFolderObj])

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(2)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri1.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('mix-uri')
			expect(simulator.workspace.workspaceFolders?.[0].index).toBe(0)
			expect(simulator.workspace.workspaceFolders?.[1].uri.toString()).toBe(folderUri2.toString())
			expect(simulator.workspace.workspaceFolders?.[1].name).toBe(customName)
			expect(simulator.workspace.workspaceFolders?.[1].index).toBe(1)
			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
		}) //<
		it('should correctly report added and removed folders in the event', async () => { //>
			// Arrange
			const folderUri1 = simulator.Uri.file('/project/change-1/')
			const folderUri2 = simulator.Uri.file('/project/change-2/')
			const folderUri3 = simulator.Uri.file('/project/change-3/')
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)
			await simulator.workspace.fs.createDirectory(folderUri3)
			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2])
			onChangeFoldersSpy.mockClear()

			// Act
			await wsStateService.setWorkspaceFolders([folderUri2, folderUri3])

			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			const eventArg = onChangeFoldersSpy.mock.calls[0][0]
			expect(eventArg.added.length).toBe(1)
			expect(eventArg.added[0].uri.toString()).toBe(folderUri3.toString())
			expect(eventArg.removed.length).toBe(1)
			expect(eventArg.removed[0].uri.toString()).toBe(folderUri1.toString())

			// Assert Final State
			expect(simulator.workspace.workspaceFolders?.length).toBe(2)
			expect(simulator.workspace.workspaceFolders?.find(f => f.uri.toString() === folderUri2.toString())).toBeDefined()
			expect(simulator.workspace.workspaceFolders?.find(f => f.uri.toString() === folderUri3.toString())).toBeDefined()
		}) //<
		it('should become MULTI_ROOT even with one folder if workspaceFile is provided', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/single-with-wsfile/')
			const workspaceFileUri = simulator.Uri.file('/project/single.code-workspace')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri)

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.name).toBe('single')
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			expect(wsStateService.workspaceType).toBe('multi')

			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
		}) //<
		it('should become MULTI_ROOT (empty) if zero folders but workspaceFile is provided', async () => { //>
			// Arrange
			const workspaceFileUri = simulator.Uri.file('/project/empty.code-workspace')

			// Act
			await wsStateService.setWorkspaceFolders([], workspaceFileUri)

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(0)
			expect(simulator.workspace.name).toBe('empty')
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			expect(wsStateService.workspaceType).toBe('multi')

			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith({ added: [], removed: [] })
		}) //<
	}) //<

	describe('getWorkspaceFolder', () => { //>
		// SETUP ---->>
		let folderUri1: any, folderUri2: any, fileInFolder1: any, fileOutside: any

		beforeEach(async () => { //>
			folderUri1 = simulator.Uri.file('/project/folder1/')
			folderUri2 = simulator.Uri.file('/project/folder2/nested/')
			fileInFolder1 = simulator.Uri.joinPath(folderUri1, 'file1.txt')
			fileOutside = simulator.Uri.file('/other/outside.txt')

			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)
			await simulator.workspace.fs.writeFile(fileInFolder1, new Uint8Array())

			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2])
		}) //<

		it('should return the correct folder for a URI inside it', () => { //>
			// Act
			const result = wsStateService.getWorkspaceFolder(fileInFolder1)

			// Assert
			expect(result).toBeDefined()
			expect(result?.uri.toString()).toBe(folderUri1.toString())
			expect(result?.name).toBe('folder1')
			expect(result?.index).toBe(0)
		}) //<
		it('should return the correct folder for a URI matching the folder exactly', () => { //>
			// Act
			const result = wsStateService.getWorkspaceFolder(folderUri2)

			// Assert
			expect(result).toBeDefined()
			expect(result?.uri.toString()).toBe(folderUri2.toString())
			expect(result?.name).toBe('nested')
			expect(result?.index).toBe(1)
		}) //<
		it('should return undefined for a URI outside any workspace folder', () => { //>
			// Act
			const result = wsStateService.getWorkspaceFolder(fileOutside)

			// Assert
			expect(result).toBeUndefined()
		}) //<
		it('should return undefined if no workspace folders are open', async () => { //>
			// Arrange: Clear folders
			await wsStateService.clearWorkspace()

			// Act
			const result = wsStateService.getWorkspaceFolder(fileInFolder1)

			// Assert
			expect(result).toBeUndefined()
		}) //<
		it('should return the closest parent folder if folders are nested', async () => { //>
			// Arrange: Add a nested folder structure
			const outerFolderUri = simulator.Uri.file('/project/outer/')
			const innerFolderUri = simulator.Uri.joinPath(outerFolderUri, 'inner/')
			const fileInInner = simulator.Uri.joinPath(innerFolderUri, 'deep.txt')
			await simulator.workspace.fs.createDirectory(outerFolderUri)
			await simulator.workspace.fs.createDirectory(innerFolderUri)
			await simulator.workspace.fs.writeFile(fileInInner, new Uint8Array())
			await wsStateService.setWorkspaceFolders([outerFolderUri, innerFolderUri])

			// Act
			const result = wsStateService.getWorkspaceFolder(fileInInner)

			// Assert
			expect(result).toBeDefined()
			expect(result?.uri.toString()).toBe(innerFolderUri.toString())
			expect(result?.name).toBe('inner')
		}) //<
	}) //<

	describe('[UNIT] addWorkspaceFolder (via Service)', () => { //>
		// SETUP ---->>
		let utilsErrorSpy: ReturnType<typeof vi.spyOn>
		let utilsLogSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => { //>
			utilsErrorSpy = vi.spyOn(utilsService, 'error')
			utilsLogSpy = vi.spyOn(utilsService, 'log')
			utilsService.setLogLevel(LogLevel.Off)
		}) //<

		afterEach(() => { //>
			utilsErrorSpy.mockRestore()
			utilsLogSpy.mockRestore()
		}) //<

		it('should return false and log error for non-existent folder URI', async () => { //>
			// Arrange
			const nonExistentUri = simulator.Uri.file('/add/non-existent/')

			// Act
			const result = await wsStateService.addWorkspaceFolder(nonExistentUri)

			// Assert
			expect(result).toBe(false)
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
			expect(utilsErrorSpy).toHaveBeenCalledOnce()
			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Validation failed for adding workspace folder: ${nonExistentUri.toString()}`),
			)
			expect(onChangeFoldersSpy).not.toHaveBeenCalled()
		}) //<
		it('should return false and log error for URI pointing to a file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/add/is-a-file.txt')
			await simulator.workspace.fs.writeFile(fileUri, new Uint8Array())

			// Act
			const result = await wsStateService.addWorkspaceFolder(fileUri)

			// Assert
			expect(result).toBe(false)
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
			expect(utilsErrorSpy).toHaveBeenCalledOnce()
			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Validation failed for adding workspace folder: ${fileUri.toString()}`),
			)
			expect(onChangeFoldersSpy).not.toHaveBeenCalled()
		}) //<
		it('should return false and log debug if folder already exists', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/add/duplicate/')
			await simulator.workspace.fs.createDirectory(folderUri)
			await wsStateService.addWorkspaceFolder(folderUri)
			onChangeFoldersSpy.mockClear()
			utilsLogSpy.mockClear()

			// Act
			const duplicateResult = await wsStateService.addWorkspaceFolder(folderUri)

			// Assert
			expect(duplicateResult).toBe(false)
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Debug,
				expect.stringContaining('Workspace folder already exists'),
			)
			expect(onChangeFoldersSpy).not.toHaveBeenCalled()
		}) //<
	}) //<

	describe('[UNIT] _updateStateAndFireEvent (via Service)', () => { //>
		// SETUP ---->>
		let utilsErrorSpy: ReturnType<typeof vi.spyOn>
		let utilsLogSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => { //>
			utilsErrorSpy = vi.spyOn(utilsService, 'error')
			utilsLogSpy = vi.spyOn(utilsService, 'log')
			utilsService.setLogLevel(LogLevel.Off)
		}) //<

		afterEach(() => { //>
			utilsErrorSpy.mockRestore()
			utilsLogSpy.mockRestore()
		}) //<

		//---------------------------------------------------------------------------------------------------------------<<
        
		it('should log generic error if VFS stat throws unknown error during validation', async () => { //>
			// Arrange
			const problematicUri = simulator.Uri.file('/add/stat-error/')
			const genericError = new Error('Simulated VFS Stat Error')
			// --- FIX: Spy on IFileSystemService instead of IFileSystemStateService ---
			const fileSystemService = diContainer.resolve<IFileSystemService>('IFileSystemService')
			const statSpy = vi.spyOn(fileSystemService, 'stat').mockImplementation(async (uri) => {
				if (uri.toString() === problematicUri.toString()) {
					throw genericError
				}
				throw new Error(`Unexpected stat call for ${uri.toString()}`)
			})

			// Act
			const result = await wsStateService.addWorkspaceFolder(problematicUri)

			// Assert
			expect(result).toBe(false)
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
			expect(utilsErrorSpy).toHaveBeenCalledTimes(2)
			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Error validating workspace folder URI ${problematicUri.toString()}`),
				genericError, // Now 'e' in _validateFolderUri's catch IS genericError
			)
			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Validation failed for adding workspace folder: ${problematicUri.toString()}`),
			)
			expect(onChangeFoldersSpy).not.toHaveBeenCalled()

			// Cleanup
			statSpy.mockRestore()
		}) //<
        
		it('should set name from basename if workspace file has no extension', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/ws_no_ext_proj/')
			const workspaceFileUri = simulator.Uri.file('/project/myPlainWorkspace')
			await simulator.workspace.fs.createDirectory(folderUri)
			onChangeFoldersSpy.mockClear()

			// Act
			await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri)

			// Assert State
			expect(wsStateService.workspaceType).toBe('multi')
			expect(wsStateService.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			expect(wsStateService.workspaceFolders?.length).toBe(1)
			expect(wsStateService.name).toBe('myPlainWorkspace')

			// Assert Event
			expect(onChangeFoldersSpy).toHaveBeenCalledOnce()
			expect(onChangeFoldersSpy).toHaveBeenCalledWith(expect.objectContaining({
				added: [expect.objectContaining({ name: 'ws_no_ext_proj' })],
				removed: [],
			}))
		}) //<
	}) //<
    
})
