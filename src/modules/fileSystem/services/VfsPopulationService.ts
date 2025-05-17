// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= NODE JS ===================================================================================================
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'
import type { IFileSystemStateService, IAddNodeOptions } from '../_interfaces/IFileSystemStateService.ts'
import type { IVfsPopulationService, IFileSystemStructure, IFileSystemPopulateEntry } from '../_interfaces/IVfsPopulationService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class VfsPopulationService implements IVfsPopulationService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	private _textEncoder = new TextEncoder()

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('IFileSystemStateService') private fsStateService: IFileSystemStateService,
	) {
		this.utils.log(LogLevel.Debug, 'VfsPopulationService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Public Methods                                                                                  │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	populateSync(structure: IFileSystemStructure): void { //>
		this.utils.log(LogLevel.Info, `VfsPopulationService: populateSync called with ${Object.keys(structure).length} entries.`)
		const posixPathUtil = this.pathService.posix
		// Sort paths to ensure parent directories are created before their children
		const sortedPaths = Object.keys(structure).sort((a, b) => {
			const depthA = a.split(/\/|\\/).length
			const depthB = b.split(/\/|\\/).length
			if (depthA !== depthB)
				return depthA - depthB
			return a.localeCompare(b)
		
		})

		for (const rawPath of sortedPaths) {
			try {
				const normalizedPath = posixPathUtil.normalize(rawPath.replace(/\\/g, '/'))
				const entryValue = structure[rawPath]

				if (entryValue === null) { // Explicit directory
					this.fsStateService.addFolderSync(normalizedPath)
				
				}
				else if (typeof entryValue === 'string') {
					this.fsStateService.writeFileSync(normalizedPath, this._textEncoder.encode(entryValue))
				
				}
				else if (entryValue instanceof Uint8Array) {
					this.fsStateService.writeFileSync(normalizedPath, entryValue)
				
				}
				else if (typeof entryValue === 'object' && entryValue !== null) {
					const populateEntry = entryValue as IFileSystemPopulateEntry
					const addNodeOptions: IAddNodeOptions = {} // Currently, IAddNodeOptions from populateEntry not fully mapped
					const isDirectory = populateEntry.content === undefined // Infer directory if no content

					if (populateEntry.content !== undefined) {
						addNodeOptions.content = populateEntry.content
					
					}
					// TODO: Map other IFileSystemPopulateEntry metadata (like mtime) to IAddNodeOptions if needed

					if (isDirectory) {
						this.fsStateService.addFolderSync(normalizedPath, addNodeOptions)
					
					}
					else {
						let contentUint8Array: Uint8Array
						if (addNodeOptions.content instanceof Uint8Array) {
							contentUint8Array = addNodeOptions.content
						
						}
						else if (typeof addNodeOptions.content === 'string') {
							contentUint8Array = this._textEncoder.encode(addNodeOptions.content)
						
						}
						else {
							contentUint8Array = new Uint8Array() // Default to empty
						
						}
						this.fsStateService.writeFileSync(normalizedPath, contentUint8Array, addNodeOptions)
					
					}
				
				}
				else {
					this.utils.warn(`VfsPopulationService: populateSync - Skipping unknown entry type for path: ${rawPath}`)
				
				}
			
			}
			catch (e) {
				this.utils.error(`VfsPopulationService: populateSync - Error processing path '${rawPath}':`, e)
				throw e // Re-throw to halt populate on error
			
			}
		
		}
		this.utils.log(LogLevel.Debug, `VfsPopulationService: populateSync finished.`)
	
	} //<

	async populate(structure: IFileSystemStructure): Promise<void> { //>
		this.utils.log(LogLevel.Info, `VfsPopulationService: populate (async) called with ${Object.keys(structure).length} entries.`)
		const posixPathUtil = this.pathService.posix
		const sortedPaths = Object.keys(structure).sort((a, b) => {
			const depthA = a.split(/\/|\\/).length
			const depthB = b.split(/\/|\\/).length
			if (depthA !== depthB)
				return depthA - depthB
			return a.localeCompare(b)
		
		})

		for (const rawPath of sortedPaths) {
			try {
				const normalizedPath = posixPathUtil.normalize(rawPath.replace(/\\/g, '/'))
				const entryValue = structure[rawPath]

				if (entryValue === null) {
					await this.fsStateService.addFolder(normalizedPath)
				
				}
				else if (typeof entryValue === 'string') {
					await this.fsStateService.writeFile(normalizedPath, this._textEncoder.encode(entryValue))
				
				}
				else if (entryValue instanceof Uint8Array) {
					await this.fsStateService.writeFile(normalizedPath, entryValue)
				
				}
				else if (typeof entryValue === 'object' && entryValue !== null) {
					const populateEntry = entryValue as IFileSystemPopulateEntry
					const addNodeOptions: IAddNodeOptions = {}
					const isDirectory = populateEntry.content === undefined

					if (populateEntry.content !== undefined) {
						addNodeOptions.content = populateEntry.content
					
					}

					if (isDirectory) {
						await this.fsStateService.addFolder(normalizedPath, addNodeOptions)
					
					}
					else {
						let contentUint8Array: Uint8Array
						if (addNodeOptions.content instanceof Uint8Array) {
							contentUint8Array = addNodeOptions.content
						
						}
						else if (typeof addNodeOptions.content === 'string') {
							contentUint8Array = this._textEncoder.encode(addNodeOptions.content)
						
						}
						else {
							contentUint8Array = new Uint8Array()
						
						}
						await this.fsStateService.writeFile(normalizedPath, contentUint8Array, addNodeOptions)
					
					}
				
				}
				else {
					this.utils.warn(`VfsPopulationService: populate (async) - Skipping unknown entry type for path: ${rawPath}`)
				
				}
			
			}
			catch (e) {
				this.utils.error(`VfsPopulationService: populate (async) - Error processing path '${rawPath}':`, e)
				throw e
			
			}
		
		}
		this.utils.log(LogLevel.Debug, `VfsPopulationService: populate (async) finished.`)
	
	} //<

}
