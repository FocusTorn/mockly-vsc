// gulp-tasks/dependency-validate.mjs
// ESLint & Imports -->>

import chalk from 'chalk'
import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'
import process from 'process'


//--------------------------------------------------------------------------------------------------------------<<

const exec = promisify(callbackExec) // Promisify exec for async/await usage

      
export async function validatePackages(done, config) { //>
	const { ignoreMatches = [], ignoreDirs = [] } = config || {}
	let scriptCommand = 'node src/scripts/js/check_excess_packages.js'

	if (ignoreMatches && ignoreMatches.length > 0) {
		scriptCommand += ` --ignoreMatches="${ignoreMatches.join(',')}"`
	
	}
	if (ignoreDirs.length > 0) {
		scriptCommand += ` --ignoreDirs="${ignoreDirs.join(',')}"`
	
	}

	try {
		const { stdout, stderr } = await exec(scriptCommand, { env: { ...process.env, FORCE_COLOR: '1' } })
		if (stdout) { console.log(stdout.trim()) }
		if (stderr) { console.error(stderr.trim()) } // check_excess_packages handles its stderr color
		
		console.log('')

		done(null, true) // Signal Gulp success with true status
	
	}
	catch (error) {
		if (error.stdout) { console.log(error.stdout.trim()) }
		// check_excess_packages.js writes its main error messages (like "Unused dependency packages found.")
		// to its stderr when it exits with code 1.
		if (error.stderr) { console.error(error.stderr.trim()) }


            
		if (error.code === 1) {
			// This specific message is for depsum's own summary, child script already logged details.
			console.error(chalk.red('Depsum: Unused core dependencies found by script.'))
			done(null, false) // Signal Gulp "success" (task completed) but with false status
		
		}
		else {
			let errorMessage = `Depsum: Package validation script encountered an unexpected error.`
			if (typeof error.code === 'number') {
				errorMessage += ` Exit code: ${error.code}.`
			
			}
			console.error(chalk.red(errorMessage))
			// If exec itself failed (e.g., command not found) and didn't produce script stdout/stderr,
			// error.message might contain useful info not in error.stderr.
			if (!error.stdout && !error.stderr && error.message && !error.message.includes(scriptCommand)) {
				console.error(chalk.red('Exec error details:'), error.message.trim())
			
			}
            
			console.log('')
            
			done(null, false) // Signal Gulp "success" but with false status
		
		}
	
	}

} //<
    


/*

node src/scripts/js/check_excess_packages.js --ignores="rimraf"

*/
