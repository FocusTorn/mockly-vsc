// ESLint & Imports --------->>

//= ViTest ====================================================================================================
import { describe, it, expect, beforeEach } from 'vitest'

//= IMPLEMENTATIONS ===========================================================================================
import { setupWorkspaceTests } from '../workspace/_setup'
import type { IVSCodeAPISimulatorService } from '../../src/core/_interfaces/IVSCodeAPISimulatorService'

//--------------------------------------------------------------------------------------------------------------<<

const setup = setupWorkspaceTests()

describe('Workspace Namespace Top-Level', () => {
	// SETUP -->>
	/* eslint-disable unused-imports/no-unused-vars */
	let simulator: IVSCodeAPISimulatorService
	/* eslint-enable unused-imports/no-unused-vars */
	
	beforeEach(() => { simulator = setup.simulator })

	//---------------------------------------------------------------------------------------------------------------<<

	it('should expose the workspace namespace on the simulator', () => { //>
		expect(simulator.workspace).toBeDefined()

	}) //<

})
