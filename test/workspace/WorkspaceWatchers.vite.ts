
// ESLint & Imports -->>

/* eslint-disable unused-imports/no-unused-vars */

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, vi } from 'vitest'

//= TSYRINGE ==================================================================================================
import { container } from '../../src/module_injection'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceStateService } from '../../src/modules/workspace/_interfaces/IWorkspaceStateService'
import type { IMockNodePathService } from '../../src/modules/workspace/_interfaces/IMockNodePathService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'
import type { ICoreUtilitiesService } from '../../src/core/_interfaces/ICoreUtilitiesService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests, silenceStd } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Watchers', () => {
	// SETUP -->>
	/* eslint-disble unused-imports/no-unused-vars */
    let simulator: IVSCodeAPISimulatorService
	let eventBus: IEventBusService
	let utilsService: ICoreUtilitiesService

	let folderUri: any
	let fileUri1: any, fileUri2: any, fileUri3: any
    /* eslint-enable unused-imports/no-unused-vars */

	beforeEach(async () => {
		simulator = setup.simulator
		eventBus = setup.eventBus
		utilsService = setup.utilsService

		const wsStateService = container.resolve<IWorkspaceStateService>('IWorkspaceStateService')
		container.resolve<IMockNodePathService>('IMockNodePathService').setMode('posix')
		folderUri = simulator.Uri.file('/project/watch/')
		fileUri1 = simulator.Uri.joinPath(folderUri, 'watch1.ts')
		fileUri2 = simulator.Uri.joinPath(folderUri, 'watch2.js')
		fileUri3 = simulator.Uri.joinPath(folderUri, 'other.txt')
		await simulator.workspace.fs.createDirectory(folderUri)
		await wsStateService.setWorkspaceFolders([folderUri])
	})

	//----------------------------------------<<

	describe('createFileSystemWatcher()', () => {
		it('should create a watcher and receive create events', async () => { //>
			// Arrange
			const watcher = simulator.workspace.createFileSystemWatcher('**/*.ts')
			const onCreate = vi.fn()
			watcher.onDidCreate(onCreate)

			// Act
			await simulator.workspace.fs.writeFile(fileUri1, new Uint8Array()) // Matches *.ts
			await simulator.workspace.fs.writeFile(fileUri2, new Uint8Array()) // Does not match

			// Assert
			expect(onCreate).toHaveBeenCalledOnce()
			expect(onCreate).toHaveBeenCalledWith(fileUri1)

			// Cleanup
			watcher.dispose()
		}) //<
		it('should receive change events (on save)', async () => { //>
			const localSilence = silenceStd(utilsService) // Silence logs for this test
			try {
				// Arrange
				await simulator.workspace.fs.writeFile(fileUri2, new TextEncoder().encode('Initial JS'))
				await simulator.workspace.openTextDocument(fileUri2) // Open the document
				const watcher = simulator.workspace.createFileSystemWatcher('**/*.js')
				const onChange = vi.fn()
				watcher.onDidChange(onChange)

				// Act: Modify and save (via fs.writeFile which triggers save events)
				await simulator.workspace.fs.writeFile(fileUri2, new TextEncoder().encode('Changed JS'))

				// Assert
				expect(onChange).toHaveBeenCalledOnce()
				expect(onChange).toHaveBeenCalledWith(fileUri2)

				// Cleanup
				watcher.dispose()
			}
			finally {
				localSilence.dispose()
			}
		}) //<
		it('should receive delete events', async () => { //>
			// Arrange
			await simulator.workspace.fs.writeFile(fileUri1, new Uint8Array())
			await simulator.workspace.fs.writeFile(fileUri3, new Uint8Array())
			const watcher = simulator.workspace.createFileSystemWatcher('**/*.{ts,txt}')
			const onDelete = vi.fn()
			watcher.onDidDelete(onDelete)

			// Act
			await simulator.workspace.fs.delete(fileUri1) // Matches *.ts
			await simulator.workspace.fs.delete(fileUri3) // Matches *.txt

			// Assert
			expect(onDelete).toHaveBeenCalledTimes(2)
			expect(onDelete).toHaveBeenCalledWith(fileUri1)
			expect(onDelete).toHaveBeenCalledWith(fileUri3)

			// Cleanup
			watcher.dispose()
		}) //<
		it('should respect ignoreCreateEvents flag', async () => { //>
			// Arrange
			const watcher = simulator.workspace.createFileSystemWatcher('**/*', true, false, false) // ignoreCreateEvents = true
			const onCreate = vi.fn()
			watcher.onDidCreate(onCreate)

			// Act
			await simulator.workspace.fs.writeFile(fileUri1, new Uint8Array())

			// Assert
			expect(onCreate).not.toHaveBeenCalled()

			// Cleanup
			watcher.dispose()
		}) //<
		it('should respect ignoreChangeEvents flag', async () => { //>
			const localSilence = silenceStd(utilsService) // Silence logs for this test
			try {
				// Arrange
				await simulator.workspace.fs.writeFile(fileUri1, new Uint8Array())
				await simulator.workspace.openTextDocument(fileUri1) // Open the document
				const watcher = simulator.workspace.createFileSystemWatcher('**/*', false, true, false) // ignoreChangeEvents = true
				const onChange = vi.fn()
				watcher.onDidChange(onChange)

				// Act
				await simulator.workspace.fs.writeFile(fileUri1, new TextEncoder().encode('change')) // Trigger save/change

				// Assert
				expect(onChange).not.toHaveBeenCalled()

				// Cleanup
				watcher.dispose()
			}
			finally {
				localSilence.dispose()
			}
		}) //<
		it('should respect ignoreDeleteEvents flag', async () => { //>
			// Arrange
			await simulator.workspace.fs.writeFile(fileUri1, new Uint8Array())
			const watcher = simulator.workspace.createFileSystemWatcher('**/*', false, false, true) // ignoreDeleteEvents = true
			const onDelete = vi.fn()
			watcher.onDidDelete(onDelete)

			// Act
			await simulator.workspace.fs.delete(fileUri1)

			// Assert
			expect(onDelete).not.toHaveBeenCalled()

			// Cleanup
			watcher.dispose()
		}) //<
		it('should stop receiving events after dispose()', async () => { //>
			// Arrange
			const watcher = simulator.workspace.createFileSystemWatcher('**/*')
			const onCreate = vi.fn()
			watcher.onDidCreate(onCreate)

			// Act
			watcher.dispose()
			await simulator.workspace.fs.writeFile(fileUri1, new Uint8Array()) // Create after dispose

			// Assert
			expect(onCreate).not.toHaveBeenCalled()
		}) //<
	})
    
})
