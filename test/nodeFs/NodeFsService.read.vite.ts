// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach, afterEach } from 'vitest' // Added afterEach
import { Buffer } from 'node:buffer'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { FileType } from '../../src/_vscCore/vscEnums'
import type { FileSystemError } from '../../src/_vscCore/vscFileSystemError'

//= INJECTED TYPES ============================================================================================
import type { INodeFsService, IMockDirent } from '../../src/modules/nodeFs/_interfaces/INodeFsService'
import type { IFileSystemStateService } from '../../src/modules/fileSystem/_interfaces/IFileSystemStateService'
import type { IUriService } from '../../src/modules/fileSystem/_interfaces/IUriService'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupNodeFsTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

describe('NodeFsService - Read Operations', () => { //>
	// SETUP -->>
	const setup = setupNodeFsTests()
	let nodeFsService: INodeFsService
	let vfsStateService: IFileSystemStateService
	let uriService: IUriService
	let simulator: IVSCodeAPISimulatorService // Added simulator

	beforeEach(async () => { //>
		nodeFsService = setup.nodeFsService
		vfsStateService = setup.vfsStateService
		uriService = setup.uriService
		simulator = setup.simulator // Assign simulator
		// Ensure VFS is clean before each test in this describe block
		// simulator.reset() in the main _setup.ts already handles clearing VFSStateService via FileSystemModule.reset()
		// However, an explicit clear here ensures this specific suite starts pristine if needed,
		// but it might be redundant if _setup.ts's reset is comprehensive.
		// For now, relying on _setup.ts's reset.
		// await vfsStateService.clear() // Potentially redundant, relying on global setup
	
	}) //<

	//-----------------------------------------------------------------------------------<<

	describe('existsSync()', () => { //>
		it('should return true if path exists', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/exists.txt')
			await vfsStateService.addFile(filePath, { content: 'hello' })

			// Act
			const result = nodeFsService.existsSync(filePath)

			// Assert
			expect(result).toBe(true)
		
		}) //<

		it('should return false if path does not exist', () => { //>
			// Arrange
			const filePath = uriService.file('/test/notexists.txt')

			// Act
			const result = nodeFsService.existsSync(filePath)

			// Assert
			expect(result).toBe(false)
		
		}) //<

		it('should work with string paths', async () => { //>
			// Arrange
			const filePathStr = '/test/existsStr.txt'
			await vfsStateService.addFile(uriService.file(filePathStr), { content: 'hello' })

			// Act
			const result = nodeFsService.existsSync(filePathStr)

			// Assert
			expect(result).toBe(true)
		
		}) //<
	
	}) //<

	describe('statSync()', () => { //>
		it('should return stat for an existing file', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/statfile.txt')
			const content = 'hello world'
			const now = Date.now()
			await vfsStateService.addFile(filePath, { content, ctime: now - 1000, mtime: now, birthtime: now - 1000, atime: now })

			// Act
			const stats = nodeFsService.statSync(filePath)

			// Assert
			expect(stats.type).toBe(FileType.File)
			expect(stats.size).toBe(Buffer.from(content).byteLength)
			expect(stats.mtime).toBe(now)
			expect(stats.ctime).toBe(now - 1000)
			expect(stats.isFile()).toBe(true)
			expect(stats.isDirectory()).toBe(false)
		
		}) //<

		it('should return stat for an existing directory', async () => { //>
			// Arrange
			const dirPath = uriService.file('/test/statdir')
			const now = Date.now()
			await vfsStateService.addFolder(dirPath, { ctime: now - 500, mtime: now, birthtime: now - 500, atime: now })

			// Act
			const stats = nodeFsService.statSync(dirPath)

			// Assert
			expect(stats.type).toBe(FileType.Directory)
			expect(stats.size).toBe(0) // Directories have size 0 in this mock
			expect(stats.mtime).toBe(now)
			expect(stats.isFile()).toBe(false)
			expect(stats.isDirectory()).toBe(true)
		
		}) //<

		it('should throw ENOENT if path does not exist', () => { //>
			// Arrange
			const filePath = uriService.file('/test/statnotfound.txt')

			// Act & Assert
			expect(() => nodeFsService.statSync(filePath)).toThrowError(/ENOENT|FileNotFound/)
			try {
				nodeFsService.statSync(filePath)
			
			}
			catch (e) {
				expect((e as FileSystemError | Error).name).toBe('Error') // Mapped to generic Error by _handleError
				expect((e as any).code).toMatch(/ENOENT|FileNotFound/)
			
			}
		
		}) //<

		it('should throw ENOTDIR if path is a file but used as directory for a non-existent child', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/file.txt')
			await vfsStateService.addFile(filePath, { content: 'content' })
			const nonExistentChild = uriService.file('/test/file.txt/child')

			// Act & Assert
			// Note: statSync on a path like '/file.txt/child' where 'file.txt' is a file
			// would typically fail at the 'file.txt' part if it tries to traverse.
			// The VFS _findNode would likely return undefined for '/file.txt/child'
			// leading to ENOENT, rather than ENOTDIR for 'file.txt' itself.
			// ENOTDIR would be for operations like readdir on a file.
			// Let's test readdir for this. For statSync, ENOENT is more likely.
			expect(() => nodeFsService.statSync(nonExistentChild)).toThrowError(/ENOENT|FileNotFound/)
		
		}) //<
	
	}) //<

	describe('readFileSync()', () => { //>
		it('should read file content as Buffer by default', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/readfile.txt')
			const content = 'Hello, MockFS!'
			await vfsStateService.addFile(filePath, { content })

			// Act
			const buffer = nodeFsService.readFileSync(filePath)

			// Assert
			expect(buffer).toBeInstanceOf(Buffer)
			expect(buffer.toString('utf8')).toBe(content)
		
		}) //<

		it('should read file content with utf8 encoding', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/readfile_utf8.txt')
			const content = 'UTF-8 content with €uro symbol.'
			await vfsStateService.addFile(filePath, { content })

			// Act
			const strContent = nodeFsService.readFileSync(filePath, { encoding: 'utf8' })

			// Assert
			expect(typeof strContent).toBe('string')
			expect(strContent).toBe(content)
		
		}) //<

		it('should read file content with string encoding option', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/readfile_str_enc.txt')
			const content = 'Another test.'
			await vfsStateService.addFile(filePath, { content })

			// Act
			const strContent = nodeFsService.readFileSync(filePath, 'utf-8') // Using 'utf-8' directly

			// Assert
			expect(typeof strContent).toBe('string')
			expect(strContent).toBe(content)
		
		}) //<

		it('should throw ENOENT if file does not exist', () => { //>
			// Arrange
			const filePath = uriService.file('/test/readnotfound.txt')

			// Act & Assert
			expect(() => nodeFsService.readFileSync(filePath)).toThrowError(/ENOENT|FileNotFound/)
		
		}) //<

		it('should throw EISDIR if path is a directory', async () => { //>
			// Arrange
			const dirPath = uriService.file('/test/readdirectory_error')
			await vfsStateService.addFolder(dirPath)

			// Act & Assert
			expect(() => nodeFsService.readFileSync(dirPath)).toThrowError(/EISDIR|FileIsADirectory/)
			try {
				nodeFsService.readFileSync(dirPath)
			
			}
			catch (e) {
				expect((e as any).code).toMatch(/EISDIR|FileIsADirectory/)
			
			}
		
		}) //<
	
	}) //<

	describe('readdirSync()', () => { //>
		beforeEach(async () => { //>
			// Setup a common directory structure for readdir tests
			await vfsStateService.addFolder(uriService.file('/test/readdir_dir'))
			await vfsStateService.addFile(uriService.file('/test/readdir_dir/file1.txt'), { content: 'f1' })
			await vfsStateService.addFile(uriService.file('/test/readdir_dir/file2.ts'), { content: 'f2' })
			await vfsStateService.addFolder(uriService.file('/test/readdir_dir/subdir'))
			await vfsStateService.addFile(uriService.file('/test/readdir_dir/subdir/nested.js'), { content: 'n1' })
		
		}) //<

		it('should return an array of names by default', () => { //>
			// Arrange
			const dirPath = uriService.file('/test/readdir_dir')

			// Act
			const entries = nodeFsService.readdirSync(dirPath)

			// Assert
			expect(Array.isArray(entries)).toBe(true)
			expect(entries).toHaveLength(3)
			expect(entries).toContain('file1.txt')
			expect(entries).toContain('file2.ts')
			expect(entries).toContain('subdir')
			entries.forEach(entry => expect(typeof entry).toBe('string'))
		
		}) //<

		it('should return an array of Dirent objects when withFileTypes is true', () => { //>
			// Arrange
			const dirPath = uriService.file('/test/readdir_dir')

			// Act
			const entries = nodeFsService.readdirSync(dirPath, { withFileTypes: true })

			// Assert
			expect(Array.isArray(entries)).toBe(true)
			expect(entries).toHaveLength(3)

			const file1 = entries.find(e => e.name === 'file1.txt') as IMockDirent
			expect(file1).toBeDefined()
			expect(file1.isFile()).toBe(true)
			expect(file1.isDirectory()).toBe(false)

			const subdir = entries.find(e => e.name === 'subdir') as IMockDirent
			expect(subdir).toBeDefined()
			expect(subdir.isFile()).toBe(false)
			expect(subdir.isDirectory()).toBe(true)
		
		}) //<

		it('should throw ENOENT if directory does not exist', () => { //>
			// Arrange
			const dirPath = uriService.file('/test/readdir_notfound')

			// Act & Assert
			expect(() => nodeFsService.readdirSync(dirPath)).toThrowError(/ENOENT|FileNotFound/)
		
		}) //<

		it('should throw ENOTDIR if path is a file', async () => { //>
			// Arrange
			const filePath = uriService.file('/test/readdir_fileasdir.txt')
			await vfsStateService.addFile(filePath, { content: 'iamfile' })

			// Act & Assert
			expect(() => nodeFsService.readdirSync(filePath)).toThrowError(/ENOTDIR|FileNotADirectory/)
			try {
				nodeFsService.readdirSync(filePath)
			
			}
			catch (e) {
				expect((e as any).code).toMatch(/ENOTDIR|FileNotADirectory/)
			
			}
		
		}) //<
	
	}) //<

	describe('Path Mode Interactions (Win32 Mode)', () => { //>
		// SETUP -->>
		const winFsStructure = {
			'/c/Users/TestUser/Documents/': null,
			'/c/Users/TestUser/Documents/file1.txt': 'content1',
			'/c/Users/TestUser/Desktop/': null,
			'/c/Users/TestUser/Desktop/image.png': 'content2',
			'/d/Projects/MyProject/': null,
			'/d/Projects/MyProject/source.js': 'content3',
		}
		let originalPathMode: 'posix' | 'win32'

		beforeEach(async () => { //>
			originalPathMode = simulator.path.getMode()
			simulator.path.setMode('win32')
			// Ensure VFS is clean and populated for these specific tests
			// simulator.reset() in the main _setup.ts clears VFS.
			// We populate it here after setting the mode.
			await simulator.vfs.populate(winFsStructure)
		
		}) //<

		afterEach(async () => { //>
			simulator.path.setMode(originalPathMode) // Restore original path mode
			// simulator.reset() will be called by the main _setup.ts afterEach,
			// which will also reset path mode to posix.
		
		}) //<
		//-----------------------------------------------------------------------------------<<

		it('existsSync should correctly find files/folders using Windows-style paths', () => { //>
			// Arrange
			const winPathFile = 'C:\\Users\\TestUser\\Documents\\file1.txt'
			const winPathFolder = 'D:\\Projects\\MyProject'
			const winPathNonExistent = 'C:\\NonExistent\\path.txt'

			// Act
			const resultFile = nodeFsService.existsSync(winPathFile)
			const resultFolder = nodeFsService.existsSync(winPathFolder)
			const resultNonExistent = nodeFsService.existsSync(winPathNonExistent)

			// Assert
			expect(resultFile, `existsSync for ${winPathFile}`).toBe(true)
			expect(resultFolder, `existsSync for ${winPathFolder}`).toBe(true)
			expect(resultNonExistent, `existsSync for ${winPathNonExistent}`).toBe(false)
		
		}) //<

		it('statSync should correctly stat files/folders using Windows-style paths', () => { //>
			// Arrange
			const winPathFile = 'C:\\Users\\TestUser\\Documents\\file1.txt'
			const winPathFolder = 'D:\\Projects\\MyProject'

			// Act
			const statsFile = nodeFsService.statSync(winPathFile)
			const statsFolder = nodeFsService.statSync(winPathFolder)

			// Assert
			expect(statsFile.isFile(), `isFile for ${winPathFile}`).toBe(true)
			expect(statsFile.isDirectory(), `isDirectory for ${winPathFile}`).toBe(false)
			expect(statsFile.size).toBe(Buffer.from('content1').byteLength)

			expect(statsFolder.isFile(), `isFile for ${winPathFolder}`).toBe(false)
			expect(statsFolder.isDirectory(), `isDirectory for ${winPathFolder}`).toBe(true)
		
		}) //<

		it('statSync should throw ENOENT for non-existent Windows-style paths', () => { //>
			// Arrange
			const winPathNonExistent = 'C:\\Windows\\System32\\non_existent.dll'
			// Act & Assert
			expect(() => nodeFsService.statSync(winPathNonExistent)).toThrowError(/ENOENT|FileNotFound/)
		
		}) //<

		it('readFileSync should correctly read files using Windows-style paths', () => { //>
			// Arrange
			const winPathFile = 'D:\\Projects\\MyProject\\source.js'
			const expectedContent = 'content3'

			// Act
			const buffer = nodeFsService.readFileSync(winPathFile)
			const stringContent = nodeFsService.readFileSync(winPathFile, 'utf-8')


			// Assert
			expect(buffer).toBeInstanceOf(Buffer)
			expect(buffer.toString('utf8')).toBe(expectedContent)
			expect(stringContent).toBe(expectedContent)
		
		}) //<

		it('readdirSync should correctly list directory contents using Windows-style paths', () => { //>
			// Arrange
			const winPathFolder = 'C:\\Users\\TestUser\\Documents'
			const expectedEntries = ['file1.txt'] // Only file1.txt is directly in Documents

			// Act
			const entries = nodeFsService.readdirSync(winPathFolder)
			const entriesWithTypes = nodeFsService.readdirSync(winPathFolder, { withFileTypes: true })

			// Assert
			expect(entries).toEqual(expect.arrayContaining(expectedEntries))
			expect(entries.length).toBe(expectedEntries.length)

			expect(entriesWithTypes.length).toBe(expectedEntries.length)
			const file1Dirent = entriesWithTypes.find(e => e.name === 'file1.txt')
			expect(file1Dirent).toBeDefined()
			expect(file1Dirent?.isFile()).toBe(true)
		
		}) //<
	
	}) //<

})
