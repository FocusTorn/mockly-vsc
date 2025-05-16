# Mockly-VSC: Core Usage Guide for Testing (AI Reference)

This document provides a concise overview of `mockly-vsc` for AI agents assisting with testing VS Code extensions.

## 1. Installation
*(No changes to this section)*

### Main Package
~~~bash
npm install mockly-vsc --save-dev
# or
yarn add mockly-vsc --dev
# or
pnpm add mockly-vsc --dev
~~~

### Peer Dependencies
Ensure these are installed in the target project:
~~~bash
npm install vitest vscode-uri reflect-metadata --save-dev
# or
yarn add vitest vscode-uri reflect-metadata --dev
# or
pnpm add vitest vscode-uri reflect-metadata --dev
~~~

## 2. Vitest Setup (`vitest.setup.ts` or `test/setup.ts`)
*(No changes to this section)*

### a. `reflect-metadata` Import
This is required once for `tsyringe` (dependency injection).
~~~typescript
// e.g., test/setup.ts
import 'reflect-metadata';

// Other global test setups can go here
~~~

### b. `vitest.config.ts`
Update `vitest.config.ts` (or `vite.config.ts`) to include `setupFiles`:
~~~typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		// ... other Vitest configurations
		setupFiles: ['./path/to/your/test/setup.ts'], // Adjust path
		globals: true, // Optional, for Vitest globals like describe, it
	},
});
~~~

## 3. Streamlined Test Structure with a Shared Setup File

To make tests cleaner and reduce boilerplate, create a shared setup file (e.g., `test/_setup.ts` or `test/myModule/_setup.ts`) for common initializations.

### a. Example Shared Setup File (`test/_setup.ts`)

This file will handle common `beforeEach` and `afterEach` logic, including `vscodeSimulator.reset()`, resolving common services, and optionally silencing console output.

~~~typescript
// test/_setup.ts (Example)
import { beforeEach, afterEach, vi, type SpyInstance } from 'vitest'; // Added SpyInstance
import { container } from 'path/to/your/src/module_injection'; // Adjust path
import { mockly, vscodeSimulator } from 'mockly-vsc';
import type { IVSCodeAPISimulatorService } from 'path/to/your/src/core/_interfaces/IVSCodeAPISimulatorService'; // Adjust
import type { ICoreUtilitiesService } from 'path/to/your/src/core/_interfaces/ICoreUtilitiesService'; // Adjust
import type { LogLevel } from 'path/to/your/src/_vscCore/vscEnums'; // Adjust path for LogLevel if needed

// Define an interface for the test context provided by this setup
export interface TestSetupContext {
	mockly: typeof mockly;
	simulator: IVSCodeAPISimulatorService;
	utils: ICoreUtilitiesService;
	// Add other commonly used services or modules from the container
	consoleSpies: ReturnType<typeof silenceStdAndCapture>; // For accessing captured logs or spies
}

/**
 * Silences standard console output and captures logs from the mockly utility service.
 * @param utilsService - The core utility service instance from mockly.
 * @returns An object with a dispose method and methods to get captured logs/spies.
 */
export function silenceStdAndCapture(utilsService: ICoreUtilitiesService) {
	const spies: SpyInstance[] = [];
	const methodsToSpy: (keyof Console)[] = ['log', 'warn', 'error', 'info', 'debug', 'trace'];
	methodsToSpy.forEach(method => {
		spies.push(vi.spyOn(console, method).mockImplementation(() => {}));
	});

	const capturedUtilsLogs = vi.fn();
	// Spy on utilsService.log to capture its calls without letting them go to the actual console
	spies.push(
		vi.spyOn(utilsService, 'log').mockImplementation((level, message, ...args) => {
			if (level >= utilsService.getLogLevel()) { // Respect mockly's internal log level
				capturedUtilsLogs(level, message, ...args);
			}
		})
	);

	return {
		dispose: () => {
			spies.forEach(spy => spy.mockRestore());
		},
		getCapturedUtilsLogs: () => capturedUtilsLogs,
		// Optionally expose individual console spies if needed for specific assertions
		// consoleWarnSpy: spies.find(spy => spy.getMockName() === 'console.warn'),
	};
}

export function commonTestSetup(): TestSetupContext {
	const context: Partial<TestSetupContext> = {};
	let silenceHandler: ReturnType<typeof silenceStdAndCapture> | undefined;

	beforeEach(async () => {
		// Resolve services first
		context.simulator = vscodeSimulator;
		context.mockly = mockly;
		context.utils = container.resolve<ICoreUtilitiesService>('ICoreUtilitiesService');

		// Set a very low log level for mockly internally if you want to capture everything
		// context.utils.setLogLevel(mockly.LogLevel.Trace); // Or as needed

		// Silence console output and capture mockly logs
		// This should happen AFTER utils is resolved and its log level potentially set
		silenceHandler = silenceStdAndCapture(context.utils);
		context.consoleSpies = silenceHandler;

		// Ensure simulator is reset before each test
		await context.simulator.reset();

		// Set a default log level for tests if desired (e.g., for what utils.log actually outputs if not silenced)
		// This might be redundant if silenceStdAndCapture completely bypasses original log logic.
		// context.utils.setLogLevel(mockly.LogLevel.Warning);
	});

	afterEach(async () => {
		// Restore console and utility log spies
		silenceHandler?.dispose();

		// Optional: Reset simulator again
		// await context.simulator?.reset();
	});

	return context as TestSetupContext;
}
~~~

### b. Using the Shared Setup in Test Files

~~~typescript
// myFeature.test.ts
import { describe, expect, it, vi } from 'vitest';
import { commonTestSetup, type TestSetupContext } from './_setup';
// import { myFunctionToTest } from '../src/myFeature';

describe('My Extension Feature', () => {
	const { mockly, simulator, utils, consoleSpies } = commonTestSetup();

	it('should test something without console noise', async () => {
		const docs = mockly.workspace.textDocuments;
		expect(docs.length).toBe(0);

		// Example: An action that might log via mockly's utils
		mockly.window.createOutputChannel("TestChannel").appendLine("Hello");

		// Assert that specific logs were captured by mockly's utility service (optional)
		// This example assumes you want to check for a log from OutputChannelService via CoreUtilitiesService
		// Note: The exact message might depend on mockly's internal logging format.
		// expect(consoleSpies.getCapturedUtilsLogs()).toHaveBeenCalledWith(
		//     mockly.LogLevel.Info, // Or whatever level OutputChannelService logs at
		//     expect.stringContaining("[Output TestChannel] Hello")
		// );
	});
});
~~~