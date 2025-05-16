// ESLint & Imports -->>

//= INJECTED TYPES ============================================================================================
import type { IExtensionsService } from './IExtensionsService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IExtensionsNamespace } from './IExtensionsNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the public contract of the ExtensionsModule implementation.
 * It exposes the vscode.extensions namespace mock and a reset method.
 */
export interface IExtensionsModule {

	readonly extensions: IExtensionsNamespace

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	reset: () => Promise<void>

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly _extensionsService: IExtensionsService

}
