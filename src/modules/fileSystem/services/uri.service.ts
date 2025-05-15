// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { URI as vUri } from 'vscode-uri'

//= INJECTED TYPES ============================================================================================
import type { IUriService } from '../_interfaces/IUriService.ts'
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class UriService implements IUriService {

	constructor(
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
	) {}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	file(path: string): vUri { //>
		return vUri.file(path)
	} //<

	parse(uri: string): vUri { //>
		return vUri.parse(uri)
	} //<

	joinPath(baseUri: vUri, ...pathSegments: string[]): vUri { //>
		const joinedPath = this.pathService.join(baseUri.path, ...pathSegments)
		return baseUri.with({ path: joinedPath })
	} //<

	normalize(p: string): string { //>
		return this.pathService.normalize(p)
	} //<

}