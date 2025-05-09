// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as Uri } from 'vscode-uri'

//--------------------------------------------------------------------------------------------------------------<<

export interface IUriService {

	/** @inheritdoc */
	file: (path: string) => Uri

	/** @inheritdoc */
	parse: (uri: string) => Uri

	/** @inheritdoc */
	joinPath: (baseUri: Uri, ...pathSegments: string[]) => Uri

	normalize: (p: string) => string

}