// ESLint & Imports -->>


//= ViTest ====================================================================================================
import { describe, it, expect, vi, beforeEach } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceStateService } from '../../src/modules/workspace/_interfaces/IWorkspaceStateService'
import type { IWorkspaceModule } from '../../src/modules/workspace/_interfaces/IWorkspaceModule'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../../src/modules/workspace/implementations/textDocument'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Events', () => { //>
    // SETUP -->>
    /* eslint-disable unused-imports/no-unused-vars */
    let simulator: IVSCodeAPISimulatorService
	let workspaceModule: IWorkspaceModule
	let eventBus: IEventBusService
	let utilsService: ICoreUtilitiesService
    /* eslint-enable unused-imports/no-unused-vars */
    
	beforeEach(() => {
		simulator = setup.simulator
		workspaceModule = setup.workspaceModule
		eventBus = setup.eventBus
		utilsService = setup.utilsService
	})

    //---------------------------------------------------------------------------------------------------------------<<
    
	it('should fire onDidChangeWorkspaceFolders when folders change', async () => { //>
		// Arrange
		const wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
		const folderUri1 = simulator.Uri.file('/events/folders/proj1/')
		const folderUri2 = simulator.Uri.file('/events/folders/proj2/')
		await simulator.workspace.fs.createDirectory(folderUri1)
		await simulator.workspace.fs.createDirectory(folderUri2)

		const onDidChangeFoldersSpy = vi.fn()
		const sub = eventBus.getOnDidChangeWorkspaceFoldersEvent()(onDidChangeFoldersSpy)

		// Act 1: Add first folder
		await wsStateService.addWorkspaceFolder(folderUri1)

		// Assert 1
		expect(onDidChangeFoldersSpy).toHaveBeenCalledOnce()
		expect(onDidChangeFoldersSpy).toHaveBeenCalledWith(expect.objectContaining({
			added: [expect.objectContaining({ uri: folderUri1 })],
			removed: [],
		}))

		onDidChangeFoldersSpy.mockClear()

		// Act 2: Add second folder
		await wsStateService.addWorkspaceFolder(folderUri2)

		// Assert 2
		expect(onDidChangeFoldersSpy).toHaveBeenCalledOnce()
		expect(onDidChangeFoldersSpy).toHaveBeenCalledWith(expect.objectContaining({
			added: [expect.objectContaining({ uri: folderUri2 })],
			removed: [],
		}))

		onDidChangeFoldersSpy.mockClear()

		// Act 3: Remove first folder
		await wsStateService.removeWorkspaceFolder(folderUri1)

		// Assert 3
		expect(onDidChangeFoldersSpy).toHaveBeenCalledOnce()
		expect(onDidChangeFoldersSpy).toHaveBeenCalledWith(expect.objectContaining({
			added: [],
			removed: [expect.objectContaining({ uri: folderUri1 })],
		}))

		// Cleanup
		sub.dispose()
	}) //<
	it('should fire onDidOpenTextDocument when opening a document', async () => { //>
		// Arrange
		const fileUri = simulator.Uri.file('/events/open/doc.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))
		const onDidOpenSpy = vi.fn()
		const sub = eventBus.getOnDidOpenTextDocumentEvent()(onDidOpenSpy)

		// Act
		const doc = await simulator.workspace.openTextDocument(fileUri)

		// Assert
		expect(onDidOpenSpy).toHaveBeenCalledOnce()
		expect(onDidOpenSpy).toHaveBeenCalledWith(doc)

		// Cleanup
		sub.dispose()
	}) //<
	it('should fire onDidCloseTextDocument when closing a document', async () => { //>
		// Arrange
		const fileUri = simulator.Uri.file('/events/close/doc.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))
		const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument // Open it

		const onDidCloseSpy = vi.fn()
		const sub = eventBus.getOnDidCloseTextDocumentEvent()(onDidCloseSpy)

		// Act
		await workspaceModule.closeTextDocument(fileUri) // Use module's method to close

		// Assert
		expect(onDidCloseSpy).toHaveBeenCalledOnce()
		expect(onDidCloseSpy).toHaveBeenCalledWith(doc) // Event carries the closed document instance

		// Cleanup
		sub.dispose()
	}) //<
	it('should fire onWillSaveTextDocument and onDidSaveTextDocument on save', async () => { //>
		// Arrange
		const fileUri = simulator.Uri.file('/events/save/doc.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('initial'))
		const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument

		// Make the document dirty
		await simulator.window.showTextDocument(doc) // Need editor to apply edit
		const editor = simulator.window.activeTextEditor
		await editor?.edit(editBuilder => editBuilder.insert(new simulator.Position(0, 0), 'dirty '))
		expect(doc.isDirty).toBe(true)

		const onWillSaveSpy = vi.fn()
		const onDidSaveSpy = vi.fn()
		const sub1 = eventBus.getOnWillSaveTextDocumentEvent()(onWillSaveSpy)
		const sub2 = eventBus.getOnDidSaveTextDocumentEvent()(onDidSaveSpy)

		// Act: Trigger save via workspace.saveAll (or could use fs.writeFile which internally saves)
		const success = await simulator.workspace.saveAll()

		// Assert
		expect(success).toBe(true)
		expect(doc.isDirty).toBe(false)
		expect(onWillSaveSpy).toHaveBeenCalledOnce()
		expect(onWillSaveSpy).toHaveBeenCalledWith(expect.objectContaining({ document: doc }))
		expect(onDidSaveSpy).toHaveBeenCalledOnce()
		expect(onDidSaveSpy).toHaveBeenCalledWith(doc)

		// Cleanup
		sub1.dispose()
		sub2.dispose()
	}) //<
	it('should fire onDidChangeTextDocument when document content changes', async () => { //>
		// Arrange
		const fileUri = simulator.Uri.file('/events/change/doc.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('initial'))
		const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument

		const onChangeSpy = vi.fn()
		const sub = eventBus.getOnDidChangeTextDocumentEvent()(onChangeSpy)

		// Act: Simulate an edit (e.g., via TextEditor.edit or internal _updateContent)
		await simulator.window.showTextDocument(doc) // Need editor to apply edit
		const editor = simulator.window.activeTextEditor
		await editor?.edit(editBuilder => editBuilder.insert(new simulator.Position(0, 0), 'changed '))

		// Assert
		expect(onChangeSpy).toHaveBeenCalledOnce()
		const eventArg = onChangeSpy.mock.calls[0][0]
		expect(eventArg.document).toBe(doc)
		expect(eventArg.contentChanges.length).toBeGreaterThan(0) // Mock sends simplified event

		// Cleanup
		sub.dispose()
	}) //<
	it('should fire file operation events (create, delete, rename)', async () => { //>
		// Arrange
		const createUri = simulator.Uri.file('/events/fileops/create.txt')
		const deleteUri = simulator.Uri.file('/events/fileops/delete.txt')
		const renameOldUri = simulator.Uri.file('/events/fileops/renameOld.txt')
		const renameNewUri = simulator.Uri.file('/events/fileops/renameNew.txt')

		await simulator.workspace.fs.writeFile(deleteUri, new TextEncoder().encode('to delete'))
		await simulator.workspace.fs.writeFile(renameOldUri, new TextEncoder().encode('to rename'))

		const onWillCreateSpy = vi.fn()
		const onDidCreateSpy = vi.fn()
		const onWillDeleteSpy = vi.fn()
		const onDidDeleteSpy = vi.fn()
		const onWillRenameSpy = vi.fn()
		const onDidRenameSpy = vi.fn()

		const subCreateW = eventBus.getOnWillCreateFilesEvent()(onWillCreateSpy)
		const subCreateD = eventBus.getOnDidCreateFilesEvent()(onDidCreateSpy)
		const subDeleteW = eventBus.getOnWillDeleteFilesEvent()(onWillDeleteSpy)
		const subDeleteD = eventBus.getOnDidDeleteFilesEvent()(onDidDeleteSpy)
		const subRenameW = eventBus.getOnWillRenameFilesEvent()(onWillRenameSpy)
		const subRenameD = eventBus.getOnDidRenameFilesEvent()(onDidRenameSpy)

		// Act: Create
		await simulator.workspace.fs.writeFile(createUri, new TextEncoder().encode('created'))

		// Assert: Create
		expect(onWillCreateSpy).toHaveBeenCalledOnce()
		expect(onWillCreateSpy).toHaveBeenCalledWith(expect.objectContaining({ files: [createUri] }))
		expect(onDidCreateSpy).toHaveBeenCalledOnce()
		expect(onDidCreateSpy).toHaveBeenCalledWith(expect.objectContaining({ files: [createUri] }))

		// Act: Delete
		await simulator.workspace.fs.delete(deleteUri)

		// Assert: Delete
		expect(onWillDeleteSpy).toHaveBeenCalledOnce()
		expect(onWillDeleteSpy).toHaveBeenCalledWith(expect.objectContaining({ files: [deleteUri] }))
		expect(onDidDeleteSpy).toHaveBeenCalledOnce()
		expect(onDidDeleteSpy).toHaveBeenCalledWith(expect.objectContaining({ files: [deleteUri] }))

		// Act: Rename
		await simulator.workspace.fs.rename(renameOldUri, renameNewUri)

		// Assert: Rename
		expect(onWillRenameSpy).toHaveBeenCalledOnce()
		expect(onWillRenameSpy).toHaveBeenCalledWith(expect.objectContaining({ files: [{ oldUri: renameOldUri, newUri: renameNewUri }] }))
		expect(onDidRenameSpy).toHaveBeenCalledOnce()
		expect(onDidRenameSpy).toHaveBeenCalledWith(expect.objectContaining({ files: [{ oldUri: renameOldUri, newUri: renameNewUri }] }))

		// Cleanup
		subCreateW.dispose()
		subCreateD.dispose()
		subDeleteW.dispose()
		subDeleteD.dispose()
		subRenameW.dispose()
		subRenameD.dispose()
	}) //<

}) //<