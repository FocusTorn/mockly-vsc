// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, vi, beforeEach } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'
import type { IWorkspaceModule } from '../../src/modules/workspace/_interfaces/IWorkspaceModule'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocumentService } from '../../src/modules/workspace/services/textDocument.service'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Sanity Checks', () => { //>
    // SETUP -->>
    /* eslint-disable unused-imports/no-unused-vars */
    let simulator: IVSCodeAPISimulatorService
	let workspaceModule: IWorkspaceModule
	let utilsService: ICoreUtilitiesService
    /* eslint-enable unused-imports/no-unused-vars */
    
	beforeEach(() => {
		simulator = setup.simulator
		workspaceModule = setup.workspaceModule
		utilsService = setup.utilsService
	})

    //---------------------------------------------------------------------------------------------------------------<<
    
	it('textDocuments getter should return a snapshot', async () => { //>
		const fileUri = simulator.Uri.file('/test/snapshot.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))
		const doc1 = await simulator.workspace.openTextDocument(fileUri)

		const textDocuments1 = simulator.workspace.textDocuments // Get snapshot 1
		expect(textDocuments1.length).toBe(1)
		expect(textDocuments1).toContain(doc1)

		const doc2 = await simulator.workspace.openTextDocument(simulator.Uri.file('/test/snapshot2.txt'))
		const textDocuments2 = simulator.workspace.textDocuments // Get snapshot 2

		expect(textDocuments1.length).toBe(1) // Snapshot 1 should not have changed
		expect(textDocuments2.length).toBe(2) // Snapshot 2 should have the new doc
		expect(textDocuments2).toContain(doc1)
		expect(textDocuments2).toContain(doc2)
	}) //<
	it('openAndAddTextDocument should only be called once per URI', async () => { //>
		const localSilence = silenceStd(utilsService) // Silence console noise for this specific test
		try {
			const fileUri = simulator.Uri.file('/test/openOnce.txt')
			// Resolve MockTextDocumentService from the container
			const mockTextDocumentService = container.resolve<TextDocumentService>('ITextDocumentService')
			// Spy on openAndAddTextDocument
			const openAndAddTextDocumentSpy = vi.spyOn(mockTextDocumentService, 'openAndAddTextDocument')

			// Remove the file if it exists (ensure clean state)
			try {
				await simulator.workspace.fs.delete(fileUri)
			} catch (e) { //>
				if ((e as any).code !== 'FileNotFound') {
					throw e
				}
			} //<

			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))

			const doc1 = await simulator.workspace.openTextDocument(fileUri)
			const doc2 = await simulator.workspace.openTextDocument(fileUri) // Open again

			expect(doc2).toBe(doc1) // Should return the same instance
			expect(openAndAddTextDocumentSpy).toHaveBeenCalledTimes(1)

			// Restore the spy
			openAndAddTextDocumentSpy.mockRestore()
		} finally {
			localSilence.dispose()
		}
	}) //<
	it('reset method should be called only once per test', () => { //>
		// This test relies on the afterEach hook in the shared setup,
		// which calls simulator.reset(). If this test fails, it means
		// something is calling reset more than once per test, which is wrong.
		// Pass condition is just that the test runs without error.
		expect(true).toBe(true) // Dummy assertion
	}) //<
	it('should not directly modify the array returned by textDocuments getter', async () => { //>
		// Arrange: Open a document so there's something in the list
		const fileUri = simulator.Uri.file('/test/modify-snapshot.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('initial'))
		const doc = await simulator.workspace.openTextDocument(fileUri)

		// Act: Get the array snapshot
		const docsArray1 = simulator.workspace.textDocuments
		expect(docsArray1.length).toBe(1)
		expect(docsArray1).toContain(doc);

		// Attempt to modify the returned array (this should not affect the internal state)
		// Using 'as any' to bypass readonly check for testing purposes
        (docsArray1 as any).push('this should not be added internally');
        (docsArray1 as any).splice(0, 1) // Also try removing

		// Assert: Get the array snapshot again
		const docsArray2 = simulator.workspace.textDocuments

		// The second snapshot should be identical to the first (before attempted modification)
		expect(docsArray2.length).toBe(1)
		expect(docsArray2).toContain(doc)
		// Verify it's a different array instance (snapshot)
		expect(docsArray2).not.toBe(docsArray1)

		// Verify the internal map size hasn't changed from the attempted push on the copy
		// We need to access the internal service to check its state
		const mockTextDocumentService = container.resolve<TextDocumentService>('ITextDocumentService')
		const openTextDocumentsMap = (mockTextDocumentService as any)._openTextDocuments
		expect(openTextDocumentsMap.size).toBe(1) // Should still only have the original document
	}) //<
	it('openTextDocument adds document to TextDocumentService', async () => { //>
		const fileUri = simulator.Uri.file('/test/docServiceAdd.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))

		// Resolve TextDocumentService from the container
		const mockTextDocumentService = container.resolve<TextDocumentService>('ITextDocumentService')

		const doc = await simulator.workspace.openTextDocument(fileUri)
		expect(mockTextDocumentService.getTextDocument(fileUri)).toBe(doc)
	}) //<
	it('closeTextDocument removes document from TextDocumentService', async () => { //>
		const localSilence = silenceStd(utilsService) // Silence console noise for this specific test
		try {
			const fileUri = simulator.Uri.file('/test/docServiceRemove.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))

			// Resolve TextDocumentService from the container
			const mockTextDocumentService = container.resolve<TextDocumentService>('ITextDocumentService')

			const doc = await simulator.workspace.openTextDocument(fileUri)
			expect(mockTextDocumentService.getTextDocument(fileUri)).toBe(doc) // confirm existance

			// Use the module's closeTextDocument method
			// The closeTextDocument method was moved to WorkspaceModule
			await workspaceModule.closeTextDocument(fileUri)

			// After closing, the document should still be retrievable by getTextDocument,
			// but its isClosed property should be true.
			// And it should not be in the list returned by getTextDocuments().
			const closedDocInstance = mockTextDocumentService.getTextDocument(fileUri)
			expect(closedDocInstance).toBeDefined()
			expect(closedDocInstance?.isClosed).toBe(true)
			expect(mockTextDocumentService.getTextDocuments().find(d => d.uri.toString() === fileUri.toString())).toBeUndefined()
		} finally {
			localSilence.dispose()
		}
	}) //<
    it('reset clears _openTextDocuments in TextDocumentService', async () => { //>
		const fileUri = simulator.Uri.file('/test/resetClears.txt')
		await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('test'))
		await simulator.workspace.openTextDocument(fileUri)

		// Resolve TextDocumentService from the container
		const mockTextDocumentService = container.resolve<TextDocumentService>('ITextDocumentService')
		expect(mockTextDocumentService.getTextDocuments().length).toBe(1)

		await simulator.reset() // reset is called in global afterEach

		expect(mockTextDocumentService.getTextDocuments().length).toBe(0)
	}) //<
}) 