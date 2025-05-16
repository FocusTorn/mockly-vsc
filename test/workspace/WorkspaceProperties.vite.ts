// ESLint & Imports --------->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../src/_vscCore/vscEnums'
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceStateService } from '../../src/modules/workspace/_interfaces/IWorkspaceStateService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IWorkspaceModule } from '../../src/modules/workspace/_interfaces/IWorkspaceModule'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Properties', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let workspaceModule: IWorkspaceModule
	let utilsService: ICoreUtilitiesService
	// let fileUri1: any, fileUri2: any // Removed
	// let doc1: TextDocument, doc2: TextDocument // Removed
	let wsStateService: IWorkspaceStateService
	/* eslint-enable unused-imports/no-unused-vars */

	beforeEach(async () => { //>
		simulator = setup.simulator
		workspaceModule = setup.workspaceModule
		utilsService = setup.utilsService

		wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')

		// Removed setup for fileUri1, fileUri2, doc1, doc2
	
	}) //<

	//---------------------------------------------------------------------------------------------------------------<<
    
	it('should reflect workspaceFolders from WorkspaceStateService', async () => { //>
		// Arrange
		const folderUri1 = simulator.Uri.file('/project1')
		const folderUri2 = simulator.Uri.file('/project2')
		await simulator.workspace.fs.createDirectory(folderUri1)
		await simulator.workspace.fs.createDirectory(folderUri2)

		// Assert Initial State
		expect(simulator.workspace.workspaceFolders).toBeUndefined()

		// Act & Assert: Add one folder
		await wsStateService.addWorkspaceFolder(folderUri1)
		expect(simulator.workspace.workspaceFolders).toBeDefined()
		expect(simulator.workspace.workspaceFolders?.length).toBe(1)
		expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri1.toString())
		expect(simulator.workspace.workspaceFolders?.[0].name).toBe('project1')

		// Act & Assert: Add second folder
		await wsStateService.addWorkspaceFolder(folderUri2)
		expect(simulator.workspace.workspaceFolders?.length).toBe(2)
		expect(simulator.workspace.workspaceFolders?.[1].uri.toString()).toBe(folderUri2.toString())

		// Act & Assert: Remove one folder
		await wsStateService.removeWorkspaceFolder(folderUri1)
		expect(simulator.workspace.workspaceFolders?.length).toBe(1)
		expect(simulator.workspace.workspaceFolders?.[0].uri.toString()).toBe(folderUri2.toString())

		// Act & Assert: Clear workspace
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

		// Act & Assert: Single folder
		await wsStateService.addWorkspaceFolder(folderUri)
		expect(simulator.workspace.name).toBe('myProject')
		expect(simulator.workspace.workspaceFile).toBeUndefined()

		// Act & Assert: Set with workspace file
		await wsStateService.setWorkspaceFolders([folderUri], workspaceFileUri)
		expect(simulator.workspace.name).toBe('myWorkspace')
		expect(simulator.workspace.workspaceFile?.toString()).toBe(workspaceFileUri.toString())

		// Act & Assert: Clear workspace
		await wsStateService.clearWorkspace()
		expect(simulator.workspace.name).toBeUndefined()
		expect(simulator.workspace.workspaceFile).toBeUndefined()
	
	}) //<
	it('should reflect the list of open textDocuments', async () => { //>
		// Arrange
		const localFileUri1 = simulator.Uri.file('/open-docs/doc1.txt') // Use local to avoid conflict with outer scope
		const localFileUri2 = simulator.Uri.file('/open-docs/doc2.js')

		await simulator.workspace.fs.createDirectory(simulator.Uri.file('/open-docs'))
		await simulator.workspace.fs.writeFile(localFileUri1, new TextEncoder().encode('test'))
		await simulator.workspace.fs.writeFile(localFileUri2, new TextEncoder().encode('test'))

		// Assert: Initially empty (after reset from global beforeEach)
		expect(simulator.workspace.textDocuments.length).toBe(0)

		// Act & Assert: Open one document
		const localDoc1 = await simulator.workspace.openTextDocument(localFileUri1)
		utilsService.log(LogLevel.Debug, `After opening doc1: textDocuments = ${simulator.workspace.textDocuments.map(d => d.uri.toString())}`)
		expect(simulator.workspace.textDocuments.length).toBe(1)
		expect(simulator.workspace.textDocuments).toContain(localDoc1)

		// Act & Assert: Open a second document
		const localDoc2 = await simulator.workspace.openTextDocument(localFileUri2)
		utilsService.log(LogLevel.Debug, `After opening doc2: textDocuments = ${simulator.workspace.textDocuments.map(d => d.uri.toString())}`)
		expect(simulator.workspace.textDocuments.length).toBe(2)
		expect(simulator.workspace.textDocuments).toContain(localDoc1)
		expect(simulator.workspace.textDocuments).toContain(localDoc2)

		// Act & Assert: Close doc1 (via the module's closeTextDocument)
		await workspaceModule.closeTextDocument(localFileUri1)
		utilsService.log(LogLevel.Debug, `After closing doc1: textDocuments = ${simulator.workspace.textDocuments.map(d => d.uri.toString())}`)
		expect(simulator.workspace.textDocuments.length).toBe(1)
		expect(simulator.workspace.textDocuments).not.toContain(localDoc1)
		expect(simulator.workspace.textDocuments).toContain(localDoc2)

		// Log the document count before reset
		utilsService.log(LogLevel.Debug, `Before reset: textDocuments.length = ${simulator.workspace.textDocuments.length}`)
	
	}) //<

})
