// ESLint & Imports -->>

//= NODE JS ===================================================================================================
import path from 'node:path'
import fs from 'node:fs'
import process from 'node:process'
import type { Stats as FsStats } from 'node:fs'

//--------------------------------------------------------------------------------------------------------------<<

const isTestEnvironment: boolean = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'

function getNormalizedDirectory( //>
	filePath: string,
	injectedFS: typeof fs,
	injectedPath: typeof path,
): string {
	const isAbsolute: boolean = injectedPath.isAbsolute(filePath)
	const resolvedPath: string = isAbsolute ? filePath : injectedPath.resolve(filePath)
	const posixPath: string = resolvedPath.replace(/\\/g, '/')
	const normalPath: string = injectedPath.posix.normalize(posixPath)
	try {
		const stats: FsStats = injectedFS.statSync(normalPath)
		return stats.isDirectory() ? normalPath : injectedPath.dirname(normalPath)
	
	}
	catch (error) {
		if (!isTestEnvironment) {
			console.error('Error in getNormalizedDirectory:', error)
		
		}
		throw error
	
	}

} //<

export function getDottedPath( //>
	targetPath: string,
	pointingPath: string,
	injectedFS: typeof fs = fs,
	injectedPath: typeof path = path,
): string | null {
	try {
		// Get normalized directories for relative calculation
		const targetDir_normal: string = getNormalizedDirectory(targetPath, injectedFS, injectedPath)
		const pointingDir_normal: string = getNormalizedDirectory(pointingPath, injectedFS, injectedPath)

		// Calculate the relative path between the directories
		const relativeDirPath: string = injectedPath.posix.relative(pointingDir_normal, targetDir_normal)

		let finalPath: string

		// Check if the original targetPath likely represents a directory
		// A simple check is if it ends with a slash (after normalization for consistency)
		const normalizedTargetPath: string = injectedPath.posix.normalize(targetPath.replace(/\\/g, '/'))
		const isTargetDirectory: boolean = normalizedTargetPath.endsWith('/')

		if (isTargetDirectory) {
			// --- Target is a Directory ---
			if (relativeDirPath === '') {
				// Pointing and target directories are the same
				finalPath = './'
			
			}
			else {
				finalPath = relativeDirPath
				// Prepend './' if needed (e.g., sibling dir 'subdir/')
				if (!finalPath.startsWith('.') && !finalPath.startsWith('..')) {
					finalPath = `./${finalPath}`
				
				}
			
			}
		
		}
		else {
			// --- Target is a File ---
			const targetBasename: string = injectedPath.basename(targetPath)
			if (relativeDirPath === '') {
				// File is in the same directory
				finalPath = `./${targetBasename}`
			
			}
			else {
				// Combine relative dir path and basename
				finalPath = `${relativeDirPath}/${targetBasename}`
				// Prepend './' if needed (e.g., 'subdir/file.js')
				if (!finalPath.startsWith('.') && !finalPath.startsWith('..')) {
					finalPath = `./${finalPath}`
				
				}
			
			}
		
		}

		return finalPath

	}
	catch (error) {
		if (!isTestEnvironment) {
			console.error('Error in getDottedPath:', error)
		
		}
		return null // Return null on error
	
	}

} //<
