// ESLint & Imports -->>

//= IMPLEMENTATION TYPES ======================================================================================
import type { IEnvNamespace } from './IEnvNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the public contract of the EnvModule implementation.
 * It exposes the vscode.env namespace mock and a reset method.
 */
export interface IEnvModule {
	readonly env: IEnvNamespace

	reset: () => Promise<void>

}
