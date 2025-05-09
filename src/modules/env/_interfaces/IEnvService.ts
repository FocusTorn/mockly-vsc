// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as vUri } from 'vscode-uri'
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the contract for the internal EnvService.
 * Manages the state and simulation of the vscode.env namespace properties and methods.
 */
export interface IEnvService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	readonly isNewAppInstall: boolean
	readonly clipboard: vt.Clipboard

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	readonly appHost: string
	readonly appName: string
	readonly appRoot: string
	readonly language: string
	readonly logLevel: vt.LogLevel
	readonly machineId: string
	readonly onDidChangeLogLevel: vt.Event<vt.LogLevel>
	readonly remoteName: string | undefined
	readonly sessionId: string
	readonly uiKind: vt.UIKind
	readonly uriScheme: string

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Simulates converting a URI to an external URI.
	 * @param target The URI to convert.
	 * @returns A promise that resolves with the external URI.
	 */
	asExternalUri: (target: vUri) => Promise<vUri>

	/**
	 * Simulates opening a URI externally.
	 * @param target The URI to open.
	 * @returns A promise that resolves to true if successful.
	 */
	openExternal: (target: vUri) => Promise<boolean>

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Resets the state of the service. Used for testing.
	 */
	_reset: () => void

}
