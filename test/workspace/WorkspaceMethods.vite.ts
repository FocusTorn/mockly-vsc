// ESLint & Imports -->>

//= VITEST ====================================================================================================
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceStateService } from '../../src/modules/workspace/_interfaces/IWorkspaceStateService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IWorkspaceModule } from '../../src/modules/workspace/_interfaces/IWorkspaceModule'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../../src/modules/workspace/implementations/textDocument'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests } from './_setup'
import type { IMockNodePathService } from '../../src/modules/fileSystem/_interfaces/IMockNodePathService'
import type { IFileSystemService } from '../../src/modules/fileSystem/_interfaces/IFileSystemService'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Methods', () => { //>
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let workspaceModule: IWorkspaceModule
	let eventBus: IEventBusService
	let utilsService: ICoreUtilitiesService
	/* eslint-enable unused-imports/no-unused-vars */
    
	beforeEach(() => { //>
		simulator = setup.simulator
		workspaceModule = setup.workspaceModule
		eventBus = setup.eventBus
		utilsService = setup.utilsService
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<
    
	describe('setWorkspaceFolders', () => { //>
		// SETUP ---->>
		let onChangeFolders: any
		let wsStateService: IWorkspaceStateService

		beforeEach(() => { //>
			onChangeFolders = vi.fn()
			eventBus.getOnDidChangeWorkspaceFoldersEvent()(onChangeFolders)
			wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			utilsService.setLogLevel(LogLevel.Off)
		
		}) //<

		//----------------------------------------<<

		it('should set a single valid folder, becoming SINGLE_ROOT', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/single/')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri])

			// Assert State
			expect(simulator.workspace.workspaceFolders).toBeDefined()
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('single')
			expect(simulator.workspace.workspaceFolders?.[0].index).toBe(0)
			expect(simulator.workspace.name).toBe('single')
			expect(simulator.workspace.workspaceFile).toBeUndefined()
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({
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
			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2]) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(2)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri1.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('multi1')
			expect(simulator.workspace.workspaceFolders?.[0].index).toBe(0)
			expect(simulator.workspace.workspaceFolders?.[1].uri.toString()).toBe(folderUri2.toString())
			expect(simulator.workspace.workspaceFolders?.[1].name).toBe('sub')
			expect(simulator.workspace.workspaceFolders?.[1].index).toBe(1)
			expect(simulator.workspace.name).toBe('multi1') // Defaults to first folder name without workspace file
			expect(simulator.workspace.workspaceFile).toBeUndefined()
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({
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
			// Note: The workspace file doesn't need to exist in VFS for the name/type logic

			// Act
			await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri.toString())
			expect(simulator.workspace.name).toBe('myWorkspace') // Derived from workspace file
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: folderUri })],
				removed: [],
			})
		
		}) //<
		it('should clear folders when setting an empty array, becoming NONE', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/to-clear/')
			await simulator.workspace.fs.createDirectory(folderUri)
			await wsStateService.setWorkspaceFolders([folderUri]) // Set initial folder via wsStateService
			onChangeFolders.mockClear() // Clear initial event

			// Act
			await wsStateService.setWorkspaceFolders([]) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders).toBeUndefined()
			expect(simulator.workspace.name).toBeUndefined()
			expect(simulator.workspace.workspaceFile).toBeUndefined()
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({
				added: [],
				removed: [expect.objectContaining({ uri: folderUri })], // Should show the removed folder
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
			await wsStateService.setWorkspaceFolders([validFolderUri, nonExistentUri, fileUri]) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1) // Only the valid one should be set
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(validFolderUri.toString())
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: validFolderUri })],
				removed: [],
			})
		
		}) //<
		it('should skip duplicate folder URIs', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/project/set-duplicate/')
			await simulator.workspace.fs.createDirectory(folderUri)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri, folderUri]) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1) // Should only contain one instance
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri.toString())
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({
				added: [expect.objectContaining({ uri: folderUri })],
				removed: [],
			})
		
		}) //<
		it('should handle a mix of Uri and WorkspaceFolder objects', async () => { //>
			// Arrange
			const folderUri1 = simulator.Uri.file('/project/mix-uri/')
			const folderUri2 = simulator.Uri.file('/project/mix-wf/')
			const customName = 'CustomMixName'
			const workspaceFolderObj: any = { uri: folderUri2, name: customName, index: 99 } // Index will be recalculated
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)

			// Act
			await wsStateService.setWorkspaceFolders([folderUri1, workspaceFolderObj]) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(2)
			expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri1.toString())
			expect(simulator.workspace.workspaceFolders?.[0].name).toBe('mix-uri') // Default name
			expect(simulator.workspace.workspaceFolders?.[0].index).toBe(0)
			expect(simulator.workspace.workspaceFolders?.[1].uri.toString()).toBe(folderUri2.toString())
			expect(simulator.workspace.workspaceFolders?.[1].name).toBe(customName) // Custom name used
			expect(simulator.workspace.workspaceFolders?.[1].index).toBe(1) // Index recalculated
			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
		
		}) //<
		it('should correctly report added and removed folders in the event', async () => { //>
			// Arrange
			const folderUri1 = simulator.Uri.file('/project/change-1/') // Start with 1 & 2
			const folderUri2 = simulator.Uri.file('/project/change-2/')
			const folderUri3 = simulator.Uri.file('/project/change-3/') // End with 2 & 3
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)
			await simulator.workspace.fs.createDirectory(folderUri3)
			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2]) // Initial setup via wsStateService
			onChangeFolders.mockClear() // Clear initial event

			// Act
			await wsStateService.setWorkspaceFolders([folderUri2, folderUri3]) // Call on wsStateService

			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			const eventArg = onChangeFolders.mock.calls[0][0]
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
			await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			expect(simulator.workspace.name).toBe('single') // Name from workspace file
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			// Check type via internal service state if needed, or rely on name/workspaceFile presence
			expect(wsStateService.workspaceType).toBe('multi') // Explicitly check type

			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
		
		}) //<
		it('should become MULTI_ROOT (empty) if zero folders but workspaceFile is provided', async () => { //>
			// Arrange
			const workspaceFileUri = simulator.Uri.file('/project/empty.code-workspace')

			// Act
			await wsStateService.setWorkspaceFolders([], workspaceFileUri) // Call on wsStateService

			// Assert State
			expect(simulator.workspace.workspaceFolders?.length).toBe(0) // Empty array, not undefined
			expect(simulator.workspace.name).toBe('empty') // Name from workspace file
			expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())
			expect(wsStateService.workspaceType).toBe('multi')

			// Assert Event
			expect(onChangeFolders).toHaveBeenCalledOnce()
			expect(onChangeFolders).toHaveBeenCalledWith({ added: [], removed: [] }) // No folders changed
		
		}) //<
	
	}) //<

	describe('getWorkspaceFolder', () => { //>
		// SETUP ---->>
		let wsStateService: IWorkspaceStateService
		let folderUri1: any, folderUri2: any, fileInFolder1: any, fileOutside: any

		beforeEach(async () => {
			// Arrange: Setup workspace folders
			wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			folderUri1 = simulator.Uri.file('/project/folder1/')
			folderUri2 = simulator.Uri.file('/project/folder2/nested/')
			fileInFolder1 = simulator.Uri.joinPath(folderUri1, 'file1.txt')
			fileOutside = simulator.Uri.file('/other/outside.txt')

			// Ensure folders exist in VFS
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(folderUri2)
			await simulator.workspace.fs.writeFile(fileInFolder1, new Uint8Array())
			// fileOutside doesn't need to exist in VFS for this test

			// Set workspace folders using the state service
			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2])
		
		})

		//----------------------------------------<<

		it('should return the correct folder for a URI inside it', () => { //>
			// Act
			const result = simulator.workspace.getWorkspaceFolder(fileInFolder1)

			// Assert
			expect(result).toBeDefined()
			expect(result?.uri.toString()).toBe(folderUri1.toString())
			expect(result?.name).toBe('folder1')
			expect(result?.index).toBe(0)
		
		}) //<
		it('should return the correct folder for a URI matching the folder exactly', () => { //>
			// Act
			const result = simulator.workspace.getWorkspaceFolder(folderUri2)

			// Assert
			expect(result).toBeDefined()
			expect(result?.uri.toString()).toBe(folderUri2.toString())
			expect(result?.name).toBe('nested')
			expect(result?.index).toBe(1)
		
		}) //<
		it('should return undefined for a URI outside any workspace folder', () => { //>
			// Act
			const result = simulator.workspace.getWorkspaceFolder(fileOutside)

			// Assert
			expect(result).toBeUndefined()
		
		}) //<
		it('should return undefined if no workspace folders are open', async () => { //>
			// Arrange: Clear folders
			await wsStateService.clearWorkspace()

			// Act
			const result = simulator.workspace.getWorkspaceFolder(fileInFolder1)

			// Assert
			expect(result).toBeUndefined()
		
		}) //<
		it('should return the closest parent folder if folders are nested (hypothetical)', async () => { //>
			// Arrange: Add a nested folder structure where one contains the other
			const outerFolderUri = simulator.Uri.file('/project/outer/')
			const innerFolderUri = simulator.Uri.joinPath(outerFolderUri, 'inner/')
			const fileInInner = simulator.Uri.joinPath(innerFolderUri, 'deep.txt')
			await simulator.workspace.fs.createDirectory(outerFolderUri)
			await simulator.workspace.fs.createDirectory(innerFolderUri)
			await simulator.workspace.fs.writeFile(fileInInner, new Uint8Array())
			// Set folders with outer first, then inner
			await wsStateService.setWorkspaceFolders([outerFolderUri, innerFolderUri])

			// Act
			const result = simulator.workspace.getWorkspaceFolder(fileInInner)

			// Assert: Should return the inner folder as it's the more specific match
			expect(result).toBeDefined()
			expect(result?.uri.toString()).toBe(innerFolderUri.toString())
			expect(result?.name).toBe('inner')
		
		}) //<
	
	}) //<

	describe('asRelativePath', () => { //>
		// SETUP ---->>
		let wsStateService: IWorkspaceStateService
		let folderUri1: any, folderUri2: any, fileInFolder1: any, fileInFolder2: any, fileOutside: any

		beforeEach(async () => {
			// Arrange: Setup workspace folders
			wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			folderUri1 = simulator.Uri.file('/project/folder1/')
			folderUri2 = simulator.Uri.file('/project/folder2/nested/')
			fileInFolder1 = simulator.Uri.joinPath(folderUri1, 'sub/file1.txt')
			fileInFolder2 = simulator.Uri.joinPath(folderUri2, 'file2.js')
			fileOutside = simulator.Uri.file('/other/outside.txt')

			// Ensure folders exist in VFS
			await simulator.workspace.fs.createDirectory(folderUri1)
			await simulator.workspace.fs.createDirectory(simulator.Uri.joinPath(folderUri1, 'sub'))
			await simulator.workspace.fs.createDirectory(folderUri2)
			await simulator.workspace.fs.writeFile(fileInFolder1, new Uint8Array())
			await simulator.workspace.fs.writeFile(fileInFolder2, new Uint8Array())

			// Set workspace folders using the state service
			await wsStateService.setWorkspaceFolders([folderUri1, folderUri2])
		
		})

		//----------------------------------------<<

		it('should return relative path within a folder (default)', () => { //>
			// Act
			const relativePath = simulator.workspace.asRelativePath(fileInFolder1)
			const relativePathUri = simulator.workspace.asRelativePath(fileInFolder1) // Test with Uri input

			// Assert
			expect(relativePath).toBe('sub/file1.txt')
			expect(relativePathUri).toBe('sub/file1.txt')
		
		}) //<
		it('should return relative path including folder name', () => { //>
			// Act
			const relativePath = simulator.workspace.asRelativePath(fileInFolder2, true)
			const relativePathUri = simulator.workspace.asRelativePath(fileInFolder2, true) // Test with Uri input

			// Assert
			expect(relativePath).toBe('nested/file2.js') // 'nested' is the folder name
			expect(relativePathUri).toBe('nested/file2.js')
		
		}) //<
		it('should return full path if outside workspace', () => { //>
			// Act
			const relativePath = simulator.workspace.asRelativePath(fileOutside.fsPath) // Test with string input
			const relativePathUri = simulator.workspace.asRelativePath(fileOutside) // Test with Uri input

			// Assert
			expect(relativePath).toBe(fileOutside.path)
			expect(relativePathUri).toBe(fileOutside.path)
		
		}) //<
		it('should return full path if no workspace is open', async () => { //>
			// Arrange
			await wsStateService.clearWorkspace()

			// Act
			const relativePath = simulator.workspace.asRelativePath(fileInFolder1)

			// Assert
			expect(relativePath).toBe(fileInFolder1.path)
		
		}) //<
		it('should handle path matching folder URI exactly', () => { //>
			// Act
			const relativePath = simulator.workspace.asRelativePath(folderUri1)
			const relativePathIncludeFolder = simulator.workspace.asRelativePath(folderUri1, true)

			// Assert: Relative path of a folder to itself is empty string
			expect(relativePath).toBe('')
			expect(relativePathIncludeFolder).toBe('folder1') // Just the folder name
		
		}) //<
	
	}) //<

	describe('findFiles()', () => { //>
		// SETUP ---->>

		beforeEach(async () => {
			// Arrange: Setup a workspace with files
			const wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			container.resolve<IMockNodePathService>('IMockNodePathService').setMode('posix') // Ensure POSIX for glob matching consistency

			const folderUri = simulator.Uri.file('/project/find/')
			await simulator.workspace.fs.createDirectory(folderUri)
			await simulator.workspace.fs.createDirectory(simulator.Uri.joinPath(folderUri, 'src'))
			await simulator.workspace.fs.createDirectory(simulator.Uri.joinPath(folderUri, 'dist'))
			await simulator.workspace.fs.createDirectory(simulator.Uri.joinPath(folderUri, 'node_modules/some_lib'))

			await simulator.workspace.fs.writeFile(simulator.Uri.joinPath(folderUri, 'src/file1.ts'), new Uint8Array())
			await simulator.workspace.fs.writeFile(simulator.Uri.joinPath(folderUri, 'src/file2.js'), new Uint8Array())
			await simulator.workspace.fs.writeFile(simulator.Uri.joinPath(folderUri, 'dist/bundle.js'), new Uint8Array())
			await simulator.workspace.fs.writeFile(simulator.Uri.joinPath(folderUri, 'README.md'), new Uint8Array())
			await simulator.workspace.fs.writeFile(simulator.Uri.joinPath(folderUri, '.gitignore'), new Uint8Array()) // Hidden file
			await simulator.workspace.fs.writeFile(simulator.Uri.joinPath(folderUri, 'node_modules/some_lib/index.js'), new Uint8Array())

			await wsStateService.setWorkspaceFolders([folderUri])

			utilsService.setLogLevel(LogLevel.Off)
		
		})

		//----------------------------------------<<

		it('should find files matching include pattern', async () => { //>
			// Act
			const results = await simulator.workspace.findFiles('src/**/*.ts')

			// Assert
			expect(results.length).toBe(1)
			expect(results[0].path).toBe('/project/find/src/file1.ts')
		
		}) //<
		it('should exclude files matching exclude pattern (string)', async () => { //>
			// Act
			const results = await simulator.workspace.findFiles('**/*.js', '**/node_modules/**')

			// Assert
			results.sort((a, b) => a.path.localeCompare(b.path)) // Sort for consistent order
			expect(results.length).toBe(2)
			expect(results[0].path).toBe('/project/find/dist/bundle.js')
			expect(results[1].path).toBe('/project/find/src/file2.js')
		
		}) //<
		it('should exclude files matching exclude pattern (RelativePattern)', async () => { //>
			// Arrange
			const wsFolder = simulator.workspace.workspaceFolders![0]
			const excludePattern = new simulator.RelativePattern(wsFolder, 'dist/**') // Assuming RelativePattern is available or mocked

			// Act
			const results = await simulator.workspace.findFiles('**/*.js', excludePattern)

			// Assert
			results.sort((a, b) => a.path.localeCompare(b.path)) // Sort for consistent order
			expect(results.length).toBe(2) // file2.js and node_modules/some_lib/index.js
			expect(results[0].path).toBe('/project/find/node_modules/some_lib/index.js')
			expect(results[1].path).toBe('/project/find/src/file2.js')
		
		}) //<
		it('should respect maxResults limit', async () => { //>
			// Act
			const results = await simulator.workspace.findFiles('**/*', undefined, 2) // Find any file, limit 2

			// Assert
			expect(results.length).toBe(2)
		
		}) //<
		it('should find hidden files (dotfiles)', async () => { //>
			// Act
			const results = await simulator.workspace.findFiles('.gitignore')

			// Assert
			expect(results.length).toBe(1)
			expect(results[0].path).toBe('/project/find/.gitignore')
		
		}) //<
		it('should return empty array if no workspace folder is open', async () => { //>
			// Arrange
			const wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			await wsStateService.clearWorkspace()

			// Act
			const results = await simulator.workspace.findFiles('**/*')

			// Assert
			expect(results).toEqual([])
		
		}) //<
		it('should handle cancellation token', async () => { //>
			// Arrange
			const cts = new simulator.CancellationTokenSource()
			const findPromise = simulator.workspace.findFiles('**/*', undefined, undefined, cts.token)

			// Act: Cancel immediately
			cts.cancel()

			// Assert: Promise should resolve (likely with partial or empty results, depending on timing)
			// We mainly check that it doesn't hang or reject unexpectedly due to cancellation.
			const results = await findPromise
			expect(results).toBeInstanceOf(Array) // Should still return an array
			// Cannot guarantee the number of results due to race condition,
			// but it should be less than or equal to the total number of files.
			expect(results.length).toBeLessThanOrEqual(6)

			cts.dispose()
		
		}) //<
	
	}) //<

	describe('applyEdit', () => { //>
		// SETUP ---->>

		beforeEach(() => {
			utilsService.setLogLevel(LogLevel.Off)
		
		})

		//----------------------------------------<<

		it('should apply a simple insert edit', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/insert.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Initial content'))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.insert(fileUri, new simulator.Position(0, 7), ' inserted')
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('Initial inserted content')
		
		}) //<
		it('should apply a simple replace edit', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/replace.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Original content'))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.replace(fileUri, new simulator.Range(0, 0, 0, 8), 'Replaced')
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('Replaced content')
		
		}) //<
		it('should apply a simple delete edit', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/delete.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Content to delete'))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.delete(fileUri, new simulator.Range(0, 8, 0, 11))
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('Content delete')
		
		}) //<
		it('should apply multiple edits to the same document', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/multiple.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Line 1\nLine 2\nLine 3'))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.insert(fileUri, new simulator.Position(0, 0), 'Inserted ')
			edit.replace(fileUri, new simulator.Range(1, 0, 1, 6), 'Second')
			edit.delete(fileUri, new simulator.Range(2, 0, 3, 0))
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('Inserted Line 1\nSecond\n')
		
		}) //<
		it('should handle edits across multiple lines', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/multiline.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Line 1\nLine 2\nLine 3'))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.replace(fileUri, new simulator.Range(0, 5, 2, 0), ' new\nSecond ')
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('Line  new\nSecond Line 3')
		
		}) //<
		it('should apply edits in the correct order (reverse)', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/order.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('abcdef'))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.replace(fileUri, new simulator.Range(0, 2, 0, 4), 'XX') // replace cd with XX
			edit.insert(fileUri, new simulator.Position(0, 0), 'YY') // insert YY at the beginning
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('YYabXXef')
		
		}) //<
		it('should handle applying edits to an empty document', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/empty.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode(''))
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.insert(fileUri, new simulator.Position(0, 0), 'New content')
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('New content')
		
		}) //<
		it('should handle applying edits to a file that does not exist', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/nonexistent.txt')

			// Act
			const edit = new simulator.WorkspaceEdit()
			edit.insert(fileUri, new simulator.Position(0, 0), 'New content')
			const success = await simulator.workspace.applyEdit(edit)
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Assert
			expect(success).toBe(true)
			expect(doc.getText()).toBe('New content')
		
		}) //<
		it('should not apply edits if the document is closed', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/applyEdit/closed.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Initial content'))
			const doc = await simulator.workspace.openTextDocument(fileUri)
			await simulator.window.showTextDocument(doc)

			// Act: Close the document
			await workspaceModule.closeTextDocument(fileUri) // Use module method

			// Now try to apply the edit
			const edit = new simulator.WorkspaceEdit()
			edit.insert(fileUri, new simulator.Position(0, 7), ' inserted')
			const success = await simulator.workspace.applyEdit(edit)

			// Assert
			expect(success).toBe(true) // applyEdit resolves true but logs warning if doc closed
			// Re-open to check content
			const reopenedDoc = await simulator.workspace.openTextDocument(fileUri)
			expect(reopenedDoc.getText()).toBe('Initial content') // Content should remain initial
		
		}) //<
	
	}) //<

	describe('openTextDocument', () => { //>
		// SETUP ---->>
		beforeEach(async () => {
			// Ensure VFS is clean and ready
			// Reset is handled in global beforeEach
			utilsService.setLogLevel(LogLevel.Off) // Suppress logs during setup
		
		})
		//----------------------------------------<<

		it('should open an existing file with correct content', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/preExisting.txt')
			const fileContentString = 'Existing content.'
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode(fileContentString))

			// Listen for open event
			const onDidOpen = vi.fn()
			const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpen)

			// Act
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Assert
			expect(doc).toBeDefined()
			expect(doc.uri.toString()).toBe(fileUri.toString())
			expect(doc.getText()).toBe(fileContentString)
			expect(doc.isDirty).toBe(false)
			expect(doc.isClosed).toBe(false)
			expect(doc.languageId).toBe('plaintext') // Default based on extension guess
			expect(simulator.workspace.textDocuments).toContain(doc)

			// Check event
			expect(onDidOpen).toHaveBeenCalledOnce()
			expect(onDidOpen).toHaveBeenCalledWith(doc)

			// Cleanup
			sub.dispose()
		
		}) //<
		it('should return the same instance for an already open document', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/toBeOpenedOnce.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Initial'))

			// Act
			const doc1 = await simulator.workspace.openTextDocument(fileUri)
			const doc2 = await simulator.workspace.openTextDocument(fileUri) // Open again

			// Assert
			expect(doc2).toBe(doc1) // Should be the exact same instance
			expect(simulator.workspace.textDocuments.length).toBe(1) // Should only be one copy in the list
		
		}) //<
		it('should open an empty placeholder for a non-existent file URI', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/nonExistentForOpen.txt')

			// Listen for open event
			const onDidOpen = vi.fn()
			const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpen)

			// Act
			const doc = await simulator.workspace.openTextDocument(fileUri)

			// Assert
			expect(doc).toBeDefined()
			expect(doc.uri.toString()).toBe(fileUri.toString()) // URI should match the requested path
			expect(doc.getText()).toBe('') // Content should be empty
			expect(doc.isUntitled).toBe(false) // It's not technically 'untitled:' scheme
			expect(doc.isDirty).toBe(false) // Starts clean
			expect(doc.isClosed).toBe(false)
			expect(simulator.workspace.textDocuments).toContain(doc)

			// Check event
			expect(onDidOpen).toHaveBeenCalledOnce()
			expect(onDidOpen).toHaveBeenCalledWith(doc)

			// Cleanup
			sub.dispose()

			// Verify the file doesn't actually exist in VFS yet
			await expect(simulator.workspace.fs.stat(fileUri))
				.rejects
				.toThrowError(/FileNotFound/)
		
		}) //<
		it('should create a new untitled document when called with no arguments', async () => { //>
			// Arrange
			const onDidOpen = vi.fn()
			const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpen)

			// Act
			const doc = await simulator.workspace.openTextDocument() // No args

			// Assertions for an untitled document
			expect(doc).toBeDefined()
			expect(doc.uri.scheme).toBe('untitled')
			expect(doc.isUntitled).toBe(true)
			expect(doc.getText()).toBe('')
			expect(doc.isDirty).toBe(false) // Untitled starts clean
			expect(doc.languageId).toBe('plaintext')
			expect(simulator.workspace.textDocuments).toContain(doc)

			// Check event
			expect(onDidOpen).toHaveBeenCalledOnce()
			expect(onDidOpen).toHaveBeenCalledWith(doc)

			// Cleanup
			sub.dispose()
		
		}) //<
		it('should open untitled document with specified content and language', async () => { //>
			// Arrange
			const content = 'console.log("hello");'
			const language = 'javascript'

			// Listen for open event
			const onDidOpen = vi.fn()
			const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpen)

			// Act
			// Use the standard options overload { content, language }
			const doc = await simulator.workspace.openTextDocument({ content, language })

			// Assertions for an untitled document
			expect(doc).toBeDefined()
			expect(doc.uri.scheme).toBe('untitled') // Should be untitled scheme
			expect(doc.isUntitled).toBe(true) // Should be marked untitled
			expect(doc.getText()).toBe(content)
			expect(doc.languageId).toBe(language)
			expect(doc.isDirty).toBe(false) // Content provided at creation isn't "dirty" yet
			expect(simulator.workspace.textDocuments).toContain(doc) // Ensure it's tracked

			// Check event
			expect(onDidOpen).toHaveBeenCalledOnce()
			expect(onDidOpen).toHaveBeenCalledWith(doc)

			// Cleanup
			sub.dispose()
		
		}) //<
		it('should detect language based on file extension', async () => { //>
			// Arrange
			const tsUri = simulator.Uri.file('/test/detect.ts')
			const jsUri = simulator.Uri.file('/test/detect.js')
			const jsonUri = simulator.Uri.file('/test/detect.json')
			const unknownUri = simulator.Uri.file('/test/detect.unknown')
			await simulator.workspace.fs.writeFile(tsUri, new TextEncoder().encode('let x: number;'))
			await simulator.workspace.fs.writeFile(jsUri, new TextEncoder().encode('let y = 1;'))
			await simulator.workspace.fs.writeFile(jsonUri, new TextEncoder().encode('{ "key": "value" }'))
			await simulator.workspace.fs.writeFile(unknownUri, new TextEncoder().encode('some data'))

			// Act
			const tsDoc = await simulator.workspace.openTextDocument(tsUri)
			const jsDoc = await simulator.workspace.openTextDocument(jsUri)
			const jsonDoc = await simulator.workspace.openTextDocument(jsonUri)
			const unknownDoc = await simulator.workspace.openTextDocument(unknownUri)

			// Assert
			expect(tsDoc.languageId).toBe('typescript')
			expect(jsDoc.languageId).toBe('javascript')
			expect(jsonDoc.languageId).toBe('json')
			expect(unknownDoc.languageId).toBe('plaintext') // Default fallback
		
		}) //<
		it('should open an existing file using a string path', async () => { //>
			// Arrange
			const filePath = '/test/openWithString.txt' // Use string path
			const fileUri = simulator.Uri.file(filePath)
			const fileContentString = 'Opened via string path.'
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode(fileContentString))

			// Listen for open event
			const onDidOpen = vi.fn()
			const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpen)

			// Act
			const doc = await simulator.workspace.openTextDocument(filePath) // Pass string path

			// Assert
			expect(doc).toBeDefined()
			expect(doc.uri.toString()).toBe(fileUri.toString()) // Should resolve to the correct URI
			expect(doc.getText()).toBe(fileContentString)
			expect(doc.isDirty).toBe(false)
			expect(doc.isClosed).toBe(false)
			expect(simulator.workspace.textDocuments).toContain(doc)

			// Check event
			expect(onDidOpen).toHaveBeenCalledOnce()
			expect(onDidOpen).toHaveBeenCalledWith(doc)

			// Cleanup
			sub.dispose()
		
		}) //<
		it('should re-open a previously closed document', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/test/reopen.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Content to reopen'))
			const doc1 = await simulator.workspace.openTextDocument(fileUri) as TextDocument
			expect(doc1.isClosed).toBe(false)
			expect(simulator.workspace.textDocuments).toContain(doc1)

			// Close the document
			await workspaceModule.closeTextDocument(fileUri)
			expect(doc1.isClosed).toBe(true)
			// workspace.textDocuments should not contain closed documents
			expect(simulator.workspace.textDocuments).not.toContain(doc1)

			// Listen for open event again
			const onDidOpen = vi.fn()
			const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpen)

			// Act: Re-open the document
			const doc2 = await simulator.workspace.openTextDocument(fileUri)

			// Assert
			expect(doc2).toBeDefined()
			expect(doc2.uri.toString()).toBe(fileUri.toString())
			expect(doc2.getText()).toBe('Content to reopen') // Should have content from VFS
			expect(doc2.isClosed).toBe(false) // Should be marked open again
			expect(simulator.workspace.textDocuments).toContain(doc2) // Should be back in the list of "open" documents

			// MODIFIED ASSERTION: Expect the SAME instance to be re-used and re-opened.
			expect(doc2).toBe(doc1) // Should be the *same* instance after re-opening

			// Check event
			expect(onDidOpen).toHaveBeenCalledOnce()
			expect(onDidOpen).toHaveBeenCalledWith(doc2) // Event should fire with the re-opened document instance

			// Cleanup
			sub.dispose()
		
		}) //<
        
	}) //<

	describe('[UNIT] addWorkspaceFolder (via Service)', () => { //>
		// SETUP ---->>
		let wsStateService: IWorkspaceStateService
		let utilsErrorSpy: ReturnType<typeof vi.spyOn>
		let utilsLogSpy: ReturnType<typeof vi.spyOn>
		let onChangeFolders: ReturnType<typeof vi.fn>

		beforeEach(() => {
			wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			// Spy on utilsService methods used in the target blocks
			utilsErrorSpy = vi.spyOn(utilsService, 'error')
			utilsLogSpy = vi.spyOn(utilsService, 'log')
			// Spy on event firing
			onChangeFolders = vi.fn()
			eventBus.getOnDidChangeWorkspaceFoldersEvent()(onChangeFolders)

			utilsService.setLogLevel(LogLevel.Off)
		
		})

		afterEach(() => {
			// Restore spies
			utilsErrorSpy.mockRestore()
			utilsLogSpy.mockRestore()
		
		})
		//----------------------------------------<<

		//= Test for Block 1: Invalid Folder URI ============================================
		it('should return false and log error for non-existent folder URI', async () => { //>
			// Arrange
			const nonExistentUri = simulator.Uri.file('/add/non-existent/')

			// Act
			const result = await wsStateService.addWorkspaceFolder(nonExistentUri)

			// Assert
			expect(result).toBe(false) // Should return false indicating failure
			expect(simulator.workspace.workspaceFolders).toBeUndefined() // No folders should be added
			expect(utilsErrorSpy).toHaveBeenCalledOnce() // Error should be logged by the service

			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Validation failed for adding workspace folder: ${nonExistentUri.toString()}`),
			)

			expect(onChangeFolders).not.toHaveBeenCalled() // Event should not fire
		
		}) //<
		it('should return false and log error for URI pointing to a file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/add/is-a-file.txt')
			await simulator.workspace.fs.writeFile(fileUri, new Uint8Array()) // Create the file

			// Act
			const result = await wsStateService.addWorkspaceFolder(fileUri)

			// Assert
			expect(result).toBe(false) // Should return false indicating failure
			expect(simulator.workspace.workspaceFolders).toBeUndefined() // No folders should be added
			expect(utilsErrorSpy).toHaveBeenCalledOnce() // Error should be logged by the service
			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Validation failed for adding workspace folder: ${fileUri.toString()}`),
			)

			expect(onChangeFolders).not.toHaveBeenCalled() // Event should not fire
		
		}) //<

		//= Test for Block 2: Duplicate Folder URI ==========================================
		it('should return false and log debug if folder already exists', async () => { //>
			// Arrange
			const folderUri = simulator.Uri.file('/add/duplicate/')
			await simulator.workspace.fs.createDirectory(folderUri) // Ensure folder exists

			// Add the folder successfully the first time
			const initialResult = await wsStateService.addWorkspaceFolder(folderUri)
			expect(initialResult).toBe(true)
			expect(simulator.workspace.workspaceFolders?.length).toBe(1)
			onChangeFolders.mockClear() // Clear the event spy after initial add
			utilsLogSpy.mockClear() // Clear the log spy as well

			// Act: Try adding the same folder again
			const duplicateResult = await wsStateService.addWorkspaceFolder(folderUri)

			// Assert
			expect(duplicateResult).toBe(false) // Should return false indicating no change
			expect(simulator.workspace.workspaceFolders?.length).toBe(1) // Folder count should remain 1
			// Check if the specific debug log was called during the duplicate attempt
			expect(utilsLogSpy).toHaveBeenCalledWith(
				LogLevel.Debug,
				expect.stringContaining('Workspace folder already exists'),
			)
			expect(onChangeFolders).not.toHaveBeenCalled() // Event should not fire on duplicate add
		
		}) //<
	
	}) //<

	describe('[UNIT] _updateStateAndFireEvent (via Service)', () => { //>
		// SETUP -->>
		let wsStateService: IWorkspaceStateService
		let utilsErrorSpy: ReturnType<typeof vi.spyOn>
		let utilsLogSpy: ReturnType<typeof vi.spyOn>
		let onChangeFolders: ReturnType<typeof vi.fn>

		beforeEach(() => {
			wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
			utilsErrorSpy = vi.spyOn(utilsService, 'error')
			utilsLogSpy = vi.spyOn(utilsService, 'log')
			onChangeFolders = vi.fn()
			eventBus.getOnDidChangeWorkspaceFoldersEvent()(onChangeFolders)
			utilsService.setLogLevel(LogLevel.Off)
		
		})

		afterEach(() => {
			utilsErrorSpy.mockRestore()
			utilsLogSpy.mockRestore()
		
		})
            
		//---------------------------------------------------------------------------------------------------------------<<
            
		it('should log generic error if VFS stat throws unknown error during validation', async () => { //>
			// Arrange
			const problematicUri = simulator.Uri.file('/add/stat-error/')
			const genericError = new Error('Simulated VFS Stat Error')
			// --- FIX: Spy on IFileSystemService as used by WorkspaceStateService ---
			const fileSystemService = container.resolve<IFileSystemService>('IFileSystemService')
			const statSpy = vi.spyOn(fileSystemService, 'stat').mockImplementation(async (uri) => {
				// --- END FIX ---
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
				genericError,
			)
			expect(utilsErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining(`Validation failed for adding workspace folder: ${problematicUri.toString()}`),
			)
			expect(onChangeFolders).not.toHaveBeenCalled()

			// Cleanup
			statSpy.mockRestore()
		
		}) //<
        
	}) //<

})
