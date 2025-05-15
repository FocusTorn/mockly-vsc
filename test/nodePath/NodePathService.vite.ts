// ESLint & Imports -->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach } from 'vitest'
import path, { posix as nodePosix, win32 as nodeWin32 } from 'node:path'

//= INJECTED TYPES ============================================================================================
import type { IMockNodePathService, IPathObject } from '../../src/modules/nodePath/_interfaces/IMockNodePathService'

//= IMPLEMENTATIONS ===========================================================================================
import { setupNodePathTests } from './_setup'

//--------------------------------------------------------------------------------------------------------------<<

describe('NodePathService', () => {
	// SETUP -->>
	const setup = setupNodePathTests()
	
	// pathService will be initialized by the beforeEach within setupNodePathTests
	// We will access it via setup.pathService in each test or a describe-level variable if preferred,
	// but for simplicity and directness, using setup.pathService is fine.
	// To make it available to all 'it' blocks without passing 'setup' around,
	// we can declare it here and assign in a top-level beforeEach if Vitest scoping allows,
	// or more simply, just use setup.pathService.
	// For this correction, we'll use a variable assigned from the setup.
	let pathService: IMockNodePathService
	
	beforeEach(() => { // This beforeEach ensures pathService is fresh for each test from the setup context
		pathService = setup.pathService
	
	})
	
	//-----------------------------------------------------------------------------------<<

	describe('Mode Management (setMode, getMode)', () => { //>
		it('should default to posix mode', () => { //>
			// Assert
			expect(pathService.getMode()).toBe('posix')
			expect(pathService.sep).toBe(nodePosix.sep)
		
		}) //<

		it('should switch to win32 mode and back to posix', () => { //>
			// Act
			pathService.setMode('win32')
			// Assert
			expect(pathService.getMode()).toBe('win32')
			expect(pathService.sep).toBe(nodeWin32.sep)

			// Act
			pathService.setMode('posix')
			// Assert
			expect(pathService.getMode()).toBe('posix')
			expect(pathService.sep).toBe(nodePosix.sep)
		
		}) //<
	
	}) //<

	describe('basename()', () => { //>
		it('should return the basename (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.basename('/foo/bar/baz/asdf/quux.html')).toBe('quux.html')
			expect(pathService.basename('/foo/bar/baz/asdf/quux.html', '.html')).toBe('quux')
			expect(pathService.basename('/foo/bar/baz/')).toBe('baz')
			expect(pathService.basename('/foo/bar/baz')).toBe('baz')
		
		}) //<

		it('should return the basename (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.basename('C:\\foo\\bar\\baz\\asdf\\quux.html')).toBe('quux.html')
			expect(pathService.basename('C:\\foo\\bar\\baz\\asdf\\quux.html', '.html')).toBe('quux')
			expect(pathService.basename('C:\\foo\\bar\\baz\\')).toBe('baz')
			expect(pathService.basename('C:\\foo\\bar\\baz')).toBe('baz')
		
		}) //<
	
	}) //<

	describe('dirname()', () => { //>
		it('should return the dirname (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.dirname('/foo/bar/baz/asdf/quux.html')).toBe('/foo/bar/baz/asdf')
			expect(pathService.dirname('/foo/bar/baz')).toBe('/foo/bar')
		
		}) //<

		it('should return the dirname (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.dirname('C:\\foo\\bar\\baz\\asdf\\quux.html')).toBe('C:\\foo\\bar\\baz\\asdf')
			expect(pathService.dirname('C:\\foo\\bar\\baz')).toBe('C:\\foo\\bar')
		
		}) //<
	
	}) //<

	describe('extname()', () => { //>
		it('should return the extname (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.extname('index.html')).toBe('.html')
			expect(pathService.extname('index.coffee.md')).toBe('.md')
			expect(pathService.extname('index.')).toBe('.')
			expect(pathService.extname('index')).toBe('')
			expect(pathService.extname('.index')).toBe('')
			expect(pathService.extname('.index.md')).toBe('.md')
		
		}) //<

		it('should return the extname (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.extname('index.html')).toBe('.html')
			expect(pathService.extname('index.coffee.md')).toBe('.md')
			expect(pathService.extname('index.')).toBe('.')
			expect(pathService.extname('index')).toBe('')
			expect(pathService.extname('.index')).toBe('')
			expect(pathService.extname('.index.md')).toBe('.md')
		
		}) //<
	
	}) //<

	describe('format()', () => { //>
		it('should format a path object (posix)', () => { //>
			pathService.setMode('posix')
			const pathObj: Partial<IPathObject> = { root: '/ignored', dir: '/home/user/dir', base: 'file.txt', ext: '.ignored', name: 'ignored' }
			expect(pathService.format(pathObj)).toBe(nodePosix.format(pathObj as any))
			const pathObj2: Partial<IPathObject> = { root: '/', base: 'file.txt', ext: '.txt', name: 'file' }
			expect(pathService.format(pathObj2)).toBe(nodePosix.format(pathObj2 as any))
		
		}) //<

		it('should format a path object (win32)', () => { //>
			pathService.setMode('win32')
			const pathObj: Partial<IPathObject> = { root: 'C:\\ignored', dir: 'C:\\home\\user\\dir', base: 'file.txt', ext: '.ignored', name: 'ignored' }
			expect(pathService.format(pathObj)).toBe(nodeWin32.format(pathObj as any))
			const pathObj2: Partial<IPathObject> = { root: 'C:\\', base: 'file.txt', ext: '.txt', name: 'file' }
			expect(pathService.format(pathObj2)).toBe(nodeWin32.format(pathObj2 as any))
		
		}) //<
	
	}) //<

	describe('isAbsolute()', () => { //>
		it('should check if path is absolute (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.isAbsolute('/foo/bar')).toBe(true)
			expect(pathService.isAbsolute('/baz/..')).toBe(true)
			expect(pathService.isAbsolute('qux/')).toBe(false)
			expect(pathService.isAbsolute('.')).toBe(false)
		
		}) //<

		it('should check if path is absolute (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.isAbsolute('//server/file')).toBe(true)
			expect(pathService.isAbsolute('\\\\server\\file')).toBe(true)
			expect(pathService.isAbsolute('C:/Users/')).toBe(true)
			expect(pathService.isAbsolute('C:\\Users\\')).toBe(true)
			expect(pathService.isAbsolute('bar\\baz')).toBe(false)
			expect(pathService.isAbsolute('.\\bar\\baz')).toBe(false)
		
		}) //<
	
	}) //<

	describe('join()', () => { //>
		it('should join path segments (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.join('/foo', 'bar', 'baz/asdf', 'quux', '..')).toBe('/foo/bar/baz/asdf')
			expect(pathService.join('foo', '', 'bar')).toBe('foo/bar')
		
		}) //<

		it('should join path segments (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.join('C:\\foo', 'bar', 'baz\\asdf', 'quux', '..')).toBe('C:\\foo\\bar\\baz\\asdf')
			expect(pathService.join('foo', '', 'bar')).toBe('foo\\bar')
		
		}) //<
	
	}) //<

	describe('normalize()', () => { //>
		it('should normalize paths (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.normalize('/foo/bar//baz/asdf/../quux')).toBe('/foo/bar/baz/quux')
		
		}) //<

		it('should normalize paths (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.normalize('C:\\temp\\\\foo\\bar\\..\\')).toBe('C:\\temp\\foo\\')
		
		}) //<
	
	}) //<

	describe('parse()', () => { //>
		it('should parse path strings (posix)', () => { //>
			pathService.setMode('posix')
			const parsed = pathService.parse('/home/user/dir/file.txt')
			expect(parsed).toEqual(nodePosix.parse('/home/user/dir/file.txt'))
		
		}) //<

		it('should parse path strings (win32)', () => { //>
			pathService.setMode('win32')
			const parsed = pathService.parse('C:\\path\\dir\\file.txt')
			expect(parsed).toEqual(nodeWin32.parse('C:\\path\\dir\\file.txt'))
		
		}) //<
	
	}) //<

	describe('relative()', () => { //>
		it('should get relative path (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')).toBe('../../impl/bbb')
		
		}) //<

		it('should get relative path (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')).toBe('..\\..\\impl\\bbb')
		
		}) //<
	
	}) //<

	describe('resolve()', () => { //>
		it('should resolve paths (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.resolve('/foo/bar', './baz')).toBe(nodePosix.resolve('/foo/bar', './baz'))
			expect(pathService.resolve('/foo/bar', '/tmp/file/')).toBe(nodePosix.resolve('/foo/bar', '/tmp/file/'))
		
		}) //<

		it('should resolve paths (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.resolve('c:\\foo\\bar', '.\\baz')).toBe(nodeWin32.resolve('c:\\foo\\bar', '.\\baz'))
			expect(pathService.resolve('c:/foo/bar', '/tmp/file/')).toBe(nodeWin32.resolve('c:/foo/bar', '/tmp/file/'))
		
		}) //<
	
	}) //<

	describe('toNamespacedPath()', () => { //>
		it('should return namespaced path (win32)', () => { //>
			pathService.setMode('win32')
			expect(pathService.toNamespacedPath('C:\\foo\\bar')).toBe(nodeWin32.toNamespacedPath('C:\\foo\\bar'))
		
		}) //<

		it('should return path as is (posix)', () => { //>
			pathService.setMode('posix')
			expect(pathService.toNamespacedPath('/foo/bar')).toBe('/foo/bar')
		
		}) //<
	
	}) //<

	describe('matchesGlob()', () => { //>
		it('should perform basic glob matching (stubbed behavior)', () => { //>
			expect(pathService.matchesGlob('**/*.*', 'file.txt')).toBe(true)
			expect(pathService.matchesGlob('**/foo', 'path/to/foo')).toBe(true)
			expect(pathService.matchesGlob('*.js', 'other.txt')).toBe(false)
		
		}) //<
        
	}) //<

	describe('posix property', () => { //>
		it('should return a path service instance operating in posix mode', () => { //>
			const posixPath = pathService.posix
			expect(posixPath.getMode()).toBe('posix')
			expect(posixPath.sep).toBe('/')
			expect(posixPath.isAbsolute('/foo/bar')).toBe(true)
			expect(posixPath.isAbsolute('C:\\foo\\bar')).toBe(false)
		
		}) //<
	
	}) //<

	describe('win32 property', () => { //>
		it('should return a path service instance operating in win32 mode', () => { //>
			const win32Path = pathService.win32 // CRITICAL: Ensure this is .win32
            
			expect(win32Path.getMode()).toBe('win32')
			expect(win32Path.sep).toBe('\\')
			expect(win32Path.isAbsolute('C:\\foo\\bar')).toBe(true)
			expect(win32Path.isAbsolute('/foo/bar')).toBe(true)
		
            
		}) //<
	
	}) //<
    
    
    
    
})
