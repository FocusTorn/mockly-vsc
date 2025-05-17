// ESLint & Imports -->>

import gulp from 'gulp'
import chalk from 'chalk'

// Import underlying validation functions
import { tsum as tsumImplementation } from './gulp-tasks/tsc-validate.mjs'
import { validatePackages } from './gulp-tasks/dependency-validate.mjs'
import { eslintsum as eslintsumImplementation } from './gulp-tasks/eslint-validate.mjs'

//--------------------------------------------------------------------------------------------------------------<<

const depcheckIgnoreDirs = ['dist', 'dll', 'release', 'src/dist', 'gulp-tasks']
const depcheckIgnoreMatches = [
	'@typescript-eslint/eslint-plugin',
	'@typescript-eslint/parser',
	'@vitest/coverage-v8',
	'rimraf',
	'fancy-log',
    
	'@semantic-release/changelog',
	'@semantic-release/commit-analyzer',
	'@semantic-release/git',
	'@semantic-release/github',
	'@semantic-release/npm',
	'@semantic-release/release-notes-generator',
	'semantic-release',
    
]

let validationResults = []

console.log('\x1Bc') // Clear console at the start of gulpfile execution

function printTaskBanner(taskName, state) { //>
	const title = `${state === 'START' ? 'RUNNING' : 'COMPLETE'} ${taskName.toUpperCase()}`.padEnd(100)
	const line = `║ ${title} ║`
	console.log(chalk.cyanBright.bold('╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗'))
	console.log(chalk.cyanBright.bold(line))
	console.log(chalk.cyanBright.bold('╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝'))

} //<

//= Task for TSC validation ========================================================================= 
async function tsumTask() { //>
	printTaskBanner('TSC Validation', 'START')
	const success = await tsumImplementation()
	validationResults.push({ name: 'validateTSC (tsum)', success })
	// printTaskBanner('TSC Validation', 'END')

} //<
tsumTask.displayName = 'validateTSC (tsum)'
gulp.task('tsum', tsumTask)




//= Task for Dependency validation ================================================================== 
function depsumTask() { //>
	printTaskBanner('Dependency Validation', 'START')
	return new Promise((resolve) => {
		validatePackages((_gulpError, successStatus) => {
			validationResults.push({ name: 'validatePackages (depsum)', success: successStatus })
			// printTaskBanner('Dependency Validation', 'END')
			resolve() // Resolve the promise for Gulp
		
		}, {
			ignoreMatches: depcheckIgnoreMatches,
			ignoreDirs: depcheckIgnoreDirs,
		})
	
	})

} //<
depsumTask.displayName = 'validatePackages (depsum)'
gulp.task('depsum', depsumTask)

//= Task for ESLint validation ====================================================================== 
async function eslintsumTask() { //>
	printTaskBanner('ESLint Validation', 'START')
	const success = await eslintsumImplementation()
	validationResults.push({ name: 'validateESLint (eslintsum)', success })
	// printTaskBanner('ESLint Validation', 'END')

} //<
eslintsumTask.displayName = 'validateESLint (eslintsum)'
gulp.task('eslsum', eslintsumTask)


// Task to check all results and fail Gulp if needed
function checkOverallValidation(done) { //>
	// Determine overall success first
	let overallSuccess = true
	if (validationResults.length === 0) {
		overallSuccess = false // Treat as failure if no results
	
	}
	else {
		validationResults.forEach((result) => {
			if (!result.success) {
				overallSuccess = false
			
			}
		
		})
	
	}

	// Now print the start banner for this check
	printTaskBanner('Overall Validation Status', 'START')

	if (validationResults.length === 0) {
		console.log(chalk.yellow('No validation tasks were run or reported results.'))
	
	}
	else {
		validationResults.forEach((result) => {
			const statusText = result.success ? chalk.green('PASSED') : chalk.red('FAILED')
			console.log(`${chalk.white(result.name.padEnd(30))} ${statusText}`)
		
		})
	
	}
    
	// Prepare colored status for the end banner
	// const statusString = overallSuccess ? chalk.green.bold('PASS') : chalk.red.bold('FAIL')
	// printTaskBanner(`Overall Validation Status: ${statusString}`, 'END')
    
	console.log('') // Extra blank line for readability

	// Clear results for the next potential 'validate' run in the same Gulp process
	const currentResults = [...validationResults]
	validationResults = []

	if (!overallSuccess) {
		console.log(chalk.red.bold('Validation Failed. Exiting.\n'))
		const failedTasks = currentResults.filter(r => !r.success).map(r => r.name).join(', ')
		done(new Error(`One or more validation tasks failed: ${failedTasks || 'Unknown task'}.`))
	
	}
	else {
		console.log(chalk.green.bold('All validations passed.\n'))
		done() // Signal success to Gulp
	
	}

} //<
checkOverallValidation.displayName = 'checkOverallValidation'
gulp.task('checkOverallValidation', checkOverallValidation)

// Main validate task
export const validate = gulp.series( //>
	(cb) => { // Task to reset results at the very start of the 'validate' series
		validationResults = []
		cb()
	
	},
	'tsum',
	'depsum',
	'eslsum',
	'checkOverallValidation',
) //<

gulp.task('default', validate)
