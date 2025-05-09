// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface simulating the `vscode.extensions` namespace.
 * This is the public interface exposed by the Extensions module.
 */
export interface IExtensionsNamespace extends Pick<typeof vt.extensions, | 'getExtension'
  | 'all'
  | 'onDidChange'> { }
