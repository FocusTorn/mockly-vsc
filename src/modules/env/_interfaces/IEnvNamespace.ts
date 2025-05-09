// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface simulating the `vscode.env` namespace.
 * This is the public interface exposed by the Env module.
 */
export interface IEnvNamespace extends Pick <typeof vt.env, //
  'appName' |
  'appRoot' |
  'appHost' |
  'uriScheme' |
  'language' |
  'sessionId' |
  'machineId' |
  'remoteName' |
  'uiKind' |
  'clipboard' |
  'openExternal' |
  'asExternalUri' |
  'logLevel' |
  'onDidChangeLogLevel' |
  'isNewAppInstall'> { }
