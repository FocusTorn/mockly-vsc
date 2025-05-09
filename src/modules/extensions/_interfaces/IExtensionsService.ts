// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the contract for the internal ExtensionsService.
 * Manages the state and simulation of VS Code extensions.
 */
export interface IExtensionsService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	readonly all: readonly vt.Extension<any>[]
	readonly onDidChange: vt.Event<void>

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Simulates retrieving a mock extension by its ID.
	 * @param extensionId The ID of the extension.
	 * @returns The mock Extension object or undefined if not found.
	 */
	getExtension: <T>(extensionId: string) => vt.Extension<T> | undefined

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Adds a mock extension to the internal state. Used for testing.
	 * @param ext The mock Extension object to add.
	 */
	_addExtension: (ext: vt.Extension<any>) => void

	/**
	 * Clears all registered mock extensions. Used for resetting state in tests.
	 */
	_clearExtensions: () => void

	/**
	 * Removes a mock extension by its ID. Used for testing.
	 * @param extensionId The ID of the extension to remove.
	 */
	_removeExtension: (extensionId: string) => void

	/**
	 * Resets the state of the service. Used for testing.
	 */
	_reset: () => void

}
