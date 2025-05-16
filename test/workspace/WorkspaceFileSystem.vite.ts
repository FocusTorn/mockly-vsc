// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, vi, beforeEach } from 'vitest'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { TextDecoder, TextEncoder } from 'node:util'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'
import type { IEventBusService } from '../../src/core/_interfaces/IEventBusService'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../../src/modules/workspace/implementations/textDocument'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace File System (fs)', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	let eventBus: IEventBusService
	/* eslint-enable unused-imports/no-unused-vars */
	
	const decoder = new TextDecoder()

	beforeEach(() => {
		simulator = setup.simulator
		eventBus = setup.eventBus
	
	})

	//---------------------------------------------------------------------------------------------------------------<<
    
	describe('stat()', () => { //>
		it('should return stats for an existing file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/stat-test.txt')
			const content = new TextEncoder().encode('stat me')
			await simulator.workspace.fs.writeFile(fileUri, content)

			// Act
			const stats = await simulator.workspace.fs.stat(fileUri)

			// Assert
			expect(stats).toBeDefined()
			expect(stats.type).toBe(simulator.FileType.File)
			expect(stats.size).toBe(content.length)
			expect(stats.ctime).toBeGreaterThan(0)
			expect(stats.mtime).toBeGreaterThan(0)
		
		}) //<
		it('should return stats for an existing directory', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/stat-dir-test/')
			await simulator.workspace.fs.createDirectory(dirUri)

			// Act
			const stats = await simulator.workspace.fs.stat(dirUri)

			// Assert
			expect(stats).toBeDefined()
			expect(stats.type).toBe(simulator.FileType.Directory)
			expect(stats.size).toBe(0) // Directories have size 0 in this mock
		
		}) //<
		it('should throw FileNotFound for non-existent path', async () => { //>
			// Arrange
			const nonExistentUri = simulator.Uri.file('/non-existent-stat')

			// Act & Assert
			await expect(simulator.workspace.fs.stat(nonExistentUri))
				.rejects
				.toThrowError(/FileNotFound/)
		
		}) //<
	
	}) //<

	describe('readDirectory()', () => { //>
		it('should read an empty directory', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/readDir-empty/')
			await simulator.workspace.fs.createDirectory(dirUri)

			// Act
			const entries = await simulator.workspace.fs.readDirectory(dirUri)

			// Assert
			expect(entries).toEqual([])
		
		}) //<
		it('should read a directory with files and subdirectories', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/readDir-test/')
			const fileUri = simulator.Uri.joinPath(dirUri, 'file.txt')
			const subDirUri = simulator.Uri.joinPath(dirUri, 'subdir')
			await simulator.workspace.fs.createDirectory(dirUri)
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('data'))
			await simulator.workspace.fs.createDirectory(subDirUri)

			// Act
			const entries = await simulator.workspace.fs.readDirectory(dirUri)

			// Assert
			// Sort for consistent comparison
			entries.sort((a, b) => a[0].localeCompare(b[0]))
			expect(entries).toEqual([
				['file.txt', simulator.FileType.File],
				['subdir', simulator.FileType.Directory],
			])
		
		}) //<
		it('should throw FileNotFound for non-existent path', async () => { //>
			// Arrange
			const nonExistentUri = simulator.Uri.file('/non-existent-readDir')

			// Act & Assert
			await expect(simulator.workspace.fs.readDirectory(nonExistentUri))
				.rejects
				.toThrowError(/FileNotFound/)
		
		}) //<
		it('should throw FileNotADirectory for a file path', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/readDir-is-a-file.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('data'))

			// Act & Assert
			await expect(simulator.workspace.fs.readDirectory(fileUri))
				.rejects
				.toThrowError(/FileNotADirectory/)
		
		}) //<
	
	}) //<

	describe('readFile()', () => { //>
		it('should read content of an existing file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/readFile-test.txt')
			const content = new TextEncoder().encode('Read this content')
			await simulator.workspace.fs.writeFile(fileUri, content)

			// Act
			const readBytes = await simulator.workspace.fs.readFile(fileUri)

			// Assert
			expect(readBytes).toEqual(content)
			expect(decoder.decode(readBytes)).toBe('Read this content')
		
		}) //<
		it('should throw FileNotFound for non-existent file', async () => { //>
			// Arrange
			const nonExistentUri = simulator.Uri.file('/non-existent-readFile.txt')

			// Act & Assert
			await expect(simulator.workspace.fs.readFile(nonExistentUri))
				.rejects
				.toThrowError(/FileNotFound/)
		
		}) //<
		it('should throw FileIsADirectory for a directory path', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/readFile-is-a-dir/')
			await simulator.workspace.fs.createDirectory(dirUri)

			// Act & Assert
			await expect(simulator.workspace.fs.readFile(dirUri))
				.rejects
				.toThrowError(/FileIsADirectory/)
		
		}) //<
	
	}) //<

	describe('writeFile()', () => { //>
		it('should write a new file and fire create events', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/write-new.txt')
			const content = new TextEncoder().encode('New file content')
			const onWillCreate = vi.fn()
			const onDidCreate = vi.fn()
			const sub1 = eventBus.getOnWillCreateFilesEvent()(onWillCreate)
			const sub2 = eventBus.getOnDidCreateFilesEvent()(onDidCreate)

			// Act
			await simulator.workspace.fs.writeFile(fileUri, content)

			// Assert File Content
			const readBytes = await simulator.workspace.fs.readFile(fileUri)
			expect(readBytes).toEqual(content)

			// Assert Events
			expect(onWillCreate).toHaveBeenCalledOnce()
			expect(onWillCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [fileUri] }))
			expect(onDidCreate).toHaveBeenCalledOnce()
			expect(onDidCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [fileUri] }))

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should overwrite an existing file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/write-overwrite.txt')
			const initialContent = new TextEncoder().encode('Initial')
			const newContent = new TextEncoder().encode('Overwritten')
			await simulator.workspace.fs.writeFile(fileUri, initialContent)

			// Act
			await simulator.workspace.fs.writeFile(fileUri, newContent)

			// Assert File Content
			const readBytes = await simulator.workspace.fs.readFile(fileUri)
			expect(readBytes).toEqual(newContent)
		
		}) //<
		it('should create parent directories if they do not exist', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/write-parent/subdir/deep-file.txt')
			const content = new TextEncoder().encode('Deep content')

			// Act
			await simulator.workspace.fs.writeFile(fileUri, content)

			// Assert File Content
			const readBytes = await simulator.workspace.fs.readFile(fileUri)
			expect(readBytes).toEqual(content)

			// Assert Parent Exists
			const parentStats = await simulator.workspace.fs.stat(simulator.Uri.file('/write-parent/subdir/'))
			expect(parentStats.type).toBe(simulator.FileType.Directory)
		
		}) //<
		it('should throw FileIsADirectory if path is a directory', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/write-is-dir/')
			await simulator.workspace.fs.createDirectory(dirUri)
			const content = new TextEncoder().encode('Cannot write')

			// Act & Assert
			await expect(simulator.workspace.fs.writeFile(dirUri, content))
				.rejects
				.toThrowError(/FileIsADirectory/)
		
		}) //<
		it('should update open document content, mark saved, and fire save events', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/write-open-doc.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Initial content'))
			const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument
			// Manually make dirty (requires editor)
			await simulator.window.showTextDocument(doc)
			const editor = simulator.window.activeTextEditor
			await editor?.edit(editBuilder => editBuilder.insert(new simulator.Position(0, 0), 'Make it dirty '))
			expect(doc.isDirty).toBe(true)

			const newContent = new TextEncoder().encode('Saved content')
			const onWillSave = vi.fn()
			const onDidSave = vi.fn()
			const sub1 = eventBus.getOnWillSaveTextDocumentEvent()(onWillSave)
			const sub2 = eventBus.getOnDidSaveTextDocumentEvent()(onDidSave)

			// Act: Write via workspace.fs
			await simulator.workspace.fs.writeFile(fileUri, newContent)

			// Assert Document State
			expect(doc.getText()).toBe('Saved content')
			expect(doc.isDirty).toBe(false)
			expect(doc.version).toBeGreaterThan(1) // Version should have incremented

			// Assert Events
			expect(onWillSave).toHaveBeenCalledOnce()
			expect(onWillSave).toHaveBeenCalledWith(expect.objectContaining({ document: doc }))
			expect(onDidSave).toHaveBeenCalledOnce()
			expect(onDidSave).toHaveBeenCalledWith(doc)

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
	
	}) //<

	describe('rename()', () => { //>
		it('should rename a file and fire rename events', async () => { //>
			// Arrange
			const oldUri = simulator.Uri.file('/rename-file-old.txt')
			const newUri = simulator.Uri.file('/rename-file-new.txt')
			await simulator.workspace.fs.writeFile(oldUri, new TextEncoder().encode('rename me'))
			const onWillRename = vi.fn()
			const onDidRename = vi.fn()
			const sub1 = eventBus.getOnWillRenameFilesEvent()(onWillRename)
			const sub2 = eventBus.getOnDidRenameFilesEvent()(onDidRename)

			// Act
			await simulator.workspace.fs.rename(oldUri, newUri)

			// Assert File System
			await expect(simulator.workspace.fs.stat(oldUri)).rejects.toThrowError(/FileNotFound/)
			const stats = await simulator.workspace.fs.stat(newUri)
			expect(stats.type).toBe(simulator.FileType.File)

			// Assert Events
			expect(onWillRename).toHaveBeenCalledOnce()
			expect(onWillRename).toHaveBeenCalledWith(expect.objectContaining({ files: [{ oldUri, newUri }] }))
			expect(onDidRename).toHaveBeenCalledOnce()
			expect(onDidRename).toHaveBeenCalledWith(expect.objectContaining({ files: [{ oldUri, newUri }] }))

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should rename a directory and fire rename events', async () => { //>
			// Arrange
			const oldUri = simulator.Uri.file('/rename-dir-old/')
			const newUri = simulator.Uri.file('/rename-dir-new/')
			const fileInDir = simulator.Uri.joinPath(oldUri, 'file.txt')
			await simulator.workspace.fs.createDirectory(oldUri)
			await simulator.workspace.fs.writeFile(fileInDir, new TextEncoder().encode('data'))
			const onWillRename = vi.fn()
			const onDidRename = vi.fn()
			const sub1 = eventBus.getOnWillRenameFilesEvent()(onWillRename)
			const sub2 = eventBus.getOnDidRenameFilesEvent()(onDidRename)

			// Act
			await simulator.workspace.fs.rename(oldUri, newUri)

			// Assert File System
			await expect(simulator.workspace.fs.stat(oldUri)).rejects.toThrowError(/FileNotFound/)
			const stats = await simulator.workspace.fs.stat(newUri)
			expect(stats.type).toBe(simulator.FileType.Directory)
			// Check if file inside was moved correctly
			const newFileInDir = simulator.Uri.joinPath(newUri, 'file.txt')
			const fileStats = await simulator.workspace.fs.stat(newFileInDir)
			expect(fileStats.type).toBe(simulator.FileType.File)

			// Assert Events
			expect(onWillRename).toHaveBeenCalledOnce()
			expect(onDidRename).toHaveBeenCalledOnce()

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should throw FileNotFound for non-existent source', async () => { //>
			// Arrange
			const oldUri = simulator.Uri.file('/rename-non-existent')
			const newUri = simulator.Uri.file('/rename-new-path')

			// Act & Assert
			await expect(simulator.workspace.fs.rename(oldUri, newUri))
				.rejects
				.toThrowError(/FileNotFound/)
		
		}) //<
		it('should throw FileExists if target exists and overwrite is false', async () => { //>
			// Arrange
			const oldUri = simulator.Uri.file('/rename-source-exists')
			const newUri = simulator.Uri.file('/rename-target-exists')
			await simulator.workspace.fs.writeFile(oldUri, new TextEncoder().encode('source'))
			await simulator.workspace.fs.writeFile(newUri, new TextEncoder().encode('target'))

			// Act & Assert
			await expect(simulator.workspace.fs.rename(oldUri, newUri, { overwrite: false }))
				.rejects
				.toThrowError(/FileExists/)
		
		}) //<
		it('should overwrite if target exists and overwrite is true', async () => { //>
			// Arrange
			const oldUri = simulator.Uri.file('/rename-source-overwrite')
			const newUri = simulator.Uri.file('/rename-target-overwrite')
			const oldContent = new TextEncoder().encode('source')
			await simulator.workspace.fs.writeFile(oldUri, oldContent)
			await simulator.workspace.fs.writeFile(newUri, new TextEncoder().encode('target'))
			const onWillRename = vi.fn()
			const onDidRename = vi.fn()
			const sub1 = eventBus.getOnWillRenameFilesEvent()(onWillRename)
			const sub2 = eventBus.getOnDidRenameFilesEvent()(onDidRename)

			// Act
			await simulator.workspace.fs.rename(oldUri, newUri, { overwrite: true })

			// Assert File System
			await expect(simulator.workspace.fs.stat(oldUri)).rejects.toThrowError(/FileNotFound/)
			const stats = await simulator.workspace.fs.stat(newUri)
			expect(stats.type).toBe(simulator.FileType.File)
			const content = await simulator.workspace.fs.readFile(newUri)
			expect(content).toEqual(oldContent) // Should have source content

			// Assert Events
			expect(onWillRename).toHaveBeenCalledOnce()
			expect(onDidRename).toHaveBeenCalledOnce()

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should update open document URI when renaming', async () => { //>
			// Arrange
			const oldUri = simulator.Uri.file('/rename-open-doc-old.txt')
			const newUri = simulator.Uri.file('/rename-open-doc-new.txt')
			const content = 'Rename open doc'
			await simulator.workspace.fs.writeFile(oldUri, new TextEncoder().encode(content))
			const _doc = await simulator.workspace.openTextDocument(oldUri) as TextDocument
			expect(simulator.workspace.textDocuments.find(d => d.uri.toString() === oldUri.toString())).toBeDefined()
			expect(simulator.workspace.textDocuments.find(d => d.uri.toString() === newUri.toString())).toBeUndefined()

			// Act
			await simulator.workspace.fs.rename(oldUri, newUri)

			// Assert Document State
			const docAfterRename = simulator.workspace.textDocuments.find(d => d.uri.toString() === newUri.toString())
			expect(docAfterRename).toBeDefined() // A doc with the new URI should exist
			expect(docAfterRename?.uri.toString()).toBe(newUri.toString())
			expect(docAfterRename?.getText()).toBe(content)
			expect(simulator.workspace.textDocuments.find(d => d.uri.toString() === oldUri.toString())).toBeUndefined() // Doc with old URI should be gone
			expect(simulator.workspace.textDocuments.length).toBe(1)
		
		}) //<
	
	}) //<

	describe('createDirectory()', () => { //>
		it('should create a new directory and fire create events', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/createDir-new/')
			const onWillCreate = vi.fn()
			const onDidCreate = vi.fn()
			const sub1 = eventBus.getOnWillCreateFilesEvent()(onWillCreate)
			const sub2 = eventBus.getOnDidCreateFilesEvent()(onDidCreate)

			// Act
			await simulator.workspace.fs.createDirectory(dirUri)

			// Assert Directory Exists
			const stats = await simulator.workspace.fs.stat(dirUri)
			expect(stats.type).toBe(simulator.FileType.Directory)

			// Assert Events
			expect(onWillCreate).toHaveBeenCalledOnce()
			expect(onWillCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [dirUri] }))
			expect(onDidCreate).toHaveBeenCalledOnce()
			expect(onDidCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [dirUri] }))

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should create nested directories', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/createDir-nested/subdir/')

			// Act
			await simulator.workspace.fs.createDirectory(dirUri)

			// Assert Directory Exists
			const stats = await simulator.workspace.fs.stat(dirUri)
			expect(stats.type).toBe(simulator.FileType.Directory)
			const parentStats = await simulator.workspace.fs.stat(simulator.Uri.file('/createDir-nested/'))
			expect(parentStats.type).toBe(simulator.FileType.Directory)
		
		}) //<
		it('should not throw if directory already exists', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/createDir-exists/')
			await simulator.workspace.fs.createDirectory(dirUri) // Create first time
			const onWillCreate = vi.fn()
			const onDidCreate = vi.fn()
			const sub1 = eventBus.getOnWillCreateFilesEvent()(onWillCreate)
			const sub2 = eventBus.getOnDidCreateFilesEvent()(onDidCreate)

			// Act & Assert
			await expect(simulator.workspace.fs.createDirectory(dirUri)).resolves.toBeUndefined()

			// Assert Events (Should not fire again if it already exists)
			expect(onWillCreate).not.toHaveBeenCalled()
			expect(onDidCreate).not.toHaveBeenCalled()

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should throw FileExists if path exists as a file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/createDir-is-file.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('i am a file'))

			// Act & Assert
			await expect(simulator.workspace.fs.createDirectory(fileUri))
				.rejects
				.toThrowError(/FileExists/)
		
		}) //<
	
	}) //<

	describe('isWritableFileSystem()', () => { //>
		it('should return true for "file" scheme', () => { //>
			// Act
			const result = simulator.workspace.fs.isWritableFileSystem('file')
			// Assert
			expect(result).toBe(true)
		
		}) //<
		it('should return true for "untitled" scheme', () => { //>
			// Act
			const result = simulator.workspace.fs.isWritableFileSystem('untitled')
			// Assert
			expect(result).toBe(true)
		
		}) //<
		it('should return undefined for other schemes', () => { //>
			// Act
			const resultHttp = simulator.workspace.fs.isWritableFileSystem('http')
			const resultGit = simulator.workspace.fs.isWritableFileSystem('git')
			// Assert
			expect(resultHttp).toBeUndefined()
			expect(resultGit).toBeUndefined()
		
		}) //<
	
	}) //<

	describe('copy()', () => { //>
		it('should copy a file and fire create event', async () => { //>
			// Arrange
			const sourceUri = simulator.Uri.file('/copy-source.txt')
			const targetUri = simulator.Uri.file('/copy-target.txt')
			const content = new TextEncoder().encode('copy me')
			await simulator.workspace.fs.writeFile(sourceUri, content)
			const onDidCreate = vi.fn()
			const sub = eventBus.getOnDidCreateFilesEvent()(onDidCreate)

			// Act
			await simulator.workspace.fs.copy(sourceUri, targetUri)

			// Assert File System
			const sourceStats = await simulator.workspace.fs.stat(sourceUri) // Source should still exist
			expect(sourceStats.type).toBe(simulator.FileType.File)
			const targetStats = await simulator.workspace.fs.stat(targetUri)
			expect(targetStats.type).toBe(simulator.FileType.File)
			const targetContent = await simulator.workspace.fs.readFile(targetUri)
			expect(targetContent).toEqual(content)

			// Assert Events
			expect(onDidCreate).toHaveBeenCalledOnce()
			// The event fires with the *target* URI
			expect(onDidCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [targetUri] }))

			// Cleanup
			sub.dispose()
		
		}) //<
		it('should copy a directory recursively and fire create event', async () => { //>
			// Arrange
			const sourceDirUri = simulator.Uri.file('/copy-source-dir/')
			const targetDirUri = simulator.Uri.file('/copy-target-dir/')
			const fileInDir = simulator.Uri.joinPath(sourceDirUri, 'file.txt')
			await simulator.workspace.fs.createDirectory(sourceDirUri)
			await simulator.workspace.fs.writeFile(fileInDir, new TextEncoder().encode('data'))
			const onDidCreate = vi.fn()
			const sub = eventBus.getOnDidCreateFilesEvent()(onDidCreate)

			// Act
			await simulator.workspace.fs.copy(sourceDirUri, targetDirUri)

			// Assert File System
			const sourceStats = await simulator.workspace.fs.stat(sourceDirUri) // Source should still exist
			expect(sourceStats.type).toBe(simulator.FileType.Directory)
			const targetStats = await simulator.workspace.fs.stat(targetDirUri)
			expect(targetStats.type).toBe(simulator.FileType.Directory)
			// Check if file inside was copied correctly
			const targetFileInDir = simulator.Uri.joinPath(targetDirUri, 'file.txt')
			const fileStats = await simulator.workspace.fs.stat(targetFileInDir)
			expect(fileStats.type).toBe(simulator.FileType.File)

			// Assert Events (should fire for the top-level target dir)
			expect(onDidCreate).toHaveBeenCalledOnce()
			expect(onDidCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [targetDirUri] }))

			// Cleanup
			sub.dispose()
		
		}) //<
		it('should throw FileNotFound for non-existent source', async () => { //>
			// Arrange
			const sourceUri = simulator.Uri.file('/copy-non-existent')
			const targetUri = simulator.Uri.file('/copy-target-path')

			// Act & Assert
			await expect(simulator.workspace.fs.copy(sourceUri, targetUri))
				.rejects
				.toThrowError(/FileNotFound/)
		
		}) //<
		it('should throw FileExists if target exists and overwrite is false', async () => { //>
			// Arrange
			const sourceUri = simulator.Uri.file('/copy-source-exists')
			const targetUri = simulator.Uri.file('/copy-target-exists')
			await simulator.workspace.fs.writeFile(sourceUri, new TextEncoder().encode('source'))
			await simulator.workspace.fs.writeFile(targetUri, new TextEncoder().encode('target'))

			// Act & Assert
			await expect(simulator.workspace.fs.copy(sourceUri, targetUri, { overwrite: false }))
				.rejects
				.toThrowError(/FileExists/)
		
		}) //<
		it('should overwrite if target exists and overwrite is true', async () => { //>
			// Arrange
			const sourceUri = simulator.Uri.file('/copy-source-overwrite')
			const targetUri = simulator.Uri.file('/copy-target-overwrite')
			const sourceContent = new TextEncoder().encode('source')
			await simulator.workspace.fs.writeFile(sourceUri, sourceContent)
			await simulator.workspace.fs.writeFile(targetUri, new TextEncoder().encode('target'))
			const onDidCreate = vi.fn() // VFS paste might not trigger create.
			const sub = eventBus.getOnDidCreateFilesEvent()(onDidCreate)

			// Act
			await simulator.workspace.fs.copy(sourceUri, targetUri, { overwrite: true })

			// Assert File System
			const sourceStats = await simulator.workspace.fs.stat(sourceUri)
			expect(sourceStats.type).toBe(simulator.FileType.File)
			const targetStats = await simulator.workspace.fs.stat(targetUri)
			expect(targetStats.type).toBe(simulator.FileType.File)
			const content = await simulator.workspace.fs.readFile(targetUri)
			expect(content).toEqual(sourceContent) // Should have source content

			// Assert Events (Assume it *does* fire create for the target for now)
			expect(onDidCreate).toHaveBeenCalledOnce()
			expect(onDidCreate).toHaveBeenCalledWith(expect.objectContaining({ files: [targetUri] }))

			// Cleanup
			sub.dispose()
		
		}) //<
	
	}) //<

	describe('delete()', () => { //>
		it('should delete a file and fire delete events', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/delete-file.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('delete'))
			const onWillDelete = vi.fn()
			const onDidDelete = vi.fn()
			const sub1 = eventBus.getOnWillDeleteFilesEvent()(onWillDelete)
			const sub2 = eventBus.getOnDidDeleteFilesEvent()(onDidDelete)

			// Act
			await simulator.workspace.fs.delete(fileUri)

			// Assert File Gone
			await expect(simulator.workspace.fs.stat(fileUri)).rejects.toThrowError(/FileNotFound/)

			// Assert Events
			expect(onWillDelete).toHaveBeenCalledOnce()
			expect(onWillDelete).toHaveBeenCalledWith(expect.objectContaining({ files: [fileUri] }))
			expect(onDidDelete).toHaveBeenCalledOnce()
			expect(onDidDelete).toHaveBeenCalledWith(expect.objectContaining({ files: [fileUri] }))

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should delete an empty directory', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/delete-empty-dir/')
			await simulator.workspace.fs.createDirectory(dirUri)
			const onWillDelete = vi.fn()
			const onDidDelete = vi.fn()
			const sub1 = eventBus.getOnWillDeleteFilesEvent()(onWillDelete)
			const sub2 = eventBus.getOnDidDeleteFilesEvent()(onDidDelete)

			// Act: Need recursive true even for empty dirs in strict VS Code API
			await simulator.workspace.fs.delete(dirUri, { recursive: true })

			// Assert Dir Gone
			await expect(simulator.workspace.fs.stat(dirUri)).rejects.toThrowError(/FileNotFound/)

			// Assert Events
			expect(onWillDelete).toHaveBeenCalledOnce()
			expect(onDidDelete).toHaveBeenCalledOnce()

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should delete a directory recursively', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/delete-recursive/')
			const fileUri = simulator.Uri.joinPath(dirUri, 'file.txt')
			await simulator.workspace.fs.createDirectory(dirUri)
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('data'))
			const onWillDelete = vi.fn()
			const onDidDelete = vi.fn()
			const sub1 = eventBus.getOnWillDeleteFilesEvent()(onWillDelete)
			const sub2 = eventBus.getOnDidDeleteFilesEvent()(onDidDelete)

			// Act
			await simulator.workspace.fs.delete(dirUri, { recursive: true })

			// Assert Dir Gone
			await expect(simulator.workspace.fs.stat(dirUri)).rejects.toThrowError(/FileNotFound/)

			// Assert Events (should fire for the top-level dir)
			expect(onWillDelete).toHaveBeenCalledOnce()
			expect(onWillDelete).toHaveBeenCalledWith(expect.objectContaining({ files: [dirUri] }))
			expect(onDidDelete).toHaveBeenCalledOnce()
			expect(onDidDelete).toHaveBeenCalledWith(expect.objectContaining({ files: [dirUri] }))

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should not throw when deleting non-existent path', async () => { //>
			// Arrange
			const nonExistentUri = simulator.Uri.file('/delete-non-existent')
			const onWillDelete = vi.fn()
			const onDidDelete = vi.fn()
			const sub1 = eventBus.getOnWillDeleteFilesEvent()(onWillDelete)
			const sub2 = eventBus.getOnDidDeleteFilesEvent()(onDidDelete)

			// Act & Assert
			await expect(simulator.workspace.fs.delete(nonExistentUri)).resolves.toBeUndefined()

			// Assert Events (Events fire *before* VFS call)
			expect(onWillDelete).toHaveBeenCalledOnce()
			expect(onDidDelete).toHaveBeenCalledOnce()

			// Cleanup
			sub1.dispose()
			sub2.dispose()
		
		}) //<
		it('should throw error deleting non-empty directory without recursive flag', async () => { //>
			// Arrange
			const dirUri = simulator.Uri.file('/delete-non-empty-no-recurse/')
			const fileUri = simulator.Uri.joinPath(dirUri, 'file.txt')
			await simulator.workspace.fs.createDirectory(dirUri)
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('data'))

			// Act & Assert
			await expect(simulator.workspace.fs.delete(dirUri, { recursive: false }))
				.rejects
				.toThrowError(/Directory not empty/)
		
		}) //<
		it('should close the document when deleting an open file', async () => { //>
			// Arrange
			const fileUri = simulator.Uri.file('/delete-closes-doc.txt')
			await simulator.workspace.fs.writeFile(fileUri, new TextEncoder().encode('Open me'))
			const doc = await simulator.workspace.openTextDocument(fileUri) as TextDocument
			expect(simulator.workspace.textDocuments).toContain(doc)
			const onDidCloseDoc = vi.fn()
			const sub = eventBus.getOnDidCloseTextDocumentEvent()(onDidCloseDoc)

			// Act
			await simulator.workspace.fs.delete(fileUri) // Use simulator.workspace.fs.delete

			// Assert
			expect(doc.isClosed).toBe(true)
			expect(simulator.workspace.textDocuments).not.toContain(doc)
			expect(onDidCloseDoc).toHaveBeenCalledOnce()
			expect(onDidCloseDoc).toHaveBeenCalledWith(doc)

			// Cleanup
			sub.dispose()
		
		}) //<
	
	}) //<

})
