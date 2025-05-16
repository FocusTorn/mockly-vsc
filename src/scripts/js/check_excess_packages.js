import path from 'node:path'
import chalk from 'chalk'
import process from 'process'

import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(callbackExec)

function parseArgs() { //>
	const args = process.argv.slice(2) // Remove 'node' and script path
	let ignoreMatchesArg = ''
	let ignoreDirsArg = ''

	args.forEach((arg) => { //>
		if (arg.startsWith('--ignoreMatches=')) {
			ignoreMatchesArg = arg.split('=')[1]
		
		}
		else if (arg.startsWith('--ignoreDirs=')) {
			ignoreDirsArg = arg.split('=')[1]
		
		}
	
	}) //<

	return {
		ignoreMatches: ignoreMatchesArg ? ignoreMatchesArg.split(',') : [],
		ignoreDirs: ignoreDirsArg ? ignoreDirsArg.split(',') : [],
	}

} //<

async function checkUnusedDependencies() { //>
	const { ignoreMatches, ignoreDirs } = parseArgs()
	const projectPath = path.join(import.meta.dirname, '../../..')
	let command = `depcheck ${projectPath} --json`
          
	if (ignoreMatches && ignoreMatches.length > 0) { //>
		command += ` --ignores="${ignoreMatches.join(',')}"`
	
	} //<

	if (ignoreDirs && ignoreDirs.length > 0) { //>
		command += ` --ignore-dirs="${ignoreDirs.join(',')}"`
	
	} //<

	let stdout = ''
	let stderr = ''
	let unused

	// console.log('');
	// console.log('Command ran:', command);
	// console.log('');
    
	try { //> exec(command)
		const result = await exec(command)
		stdout = result.stdout
		stderr = result.stderr
		unused = JSON.parse(stdout)
	
	} //<
	catch (error) { //>
		stdout = error.stdout
		stderr = error.stderr

		try { unused = JSON.parse(stdout) }
		catch (parseError) { //>
			console.error(chalk.red('Failed to parse depcheck JSON output:'))
			console.error(stdout)
			console.error(stderr)
			console.error(parseError)
			process.exit(1)
		
		} //<
	
	} //<

	const unusedDependencies = unused.dependencies || []
	const unusedDevDependencies = unused.devDependencies || []
	let foundUnusedCoreDeps = false

    
	if (unusedDevDependencies.length > 0) { //>
		console.log(chalk.yellow.bold('Unused devDependencies'))
		console.log(chalk.yellow(unusedDevDependencies.join('\n')))
		console.log('')
	
	} //<

    
	
	if (stderr) { //>
		console.error(chalk.blue('\ndepcheck stderr:'))
		console.error(stderr.trim())
	
	} //<

    
    
	if (unusedDependencies.length > 0) { //>
		console.log(chalk.red.bold('Unused dependencies'))
		console.log(chalk.red(unusedDependencies.join('\n')))
		console.log('')
		foundUnusedCoreDeps = true
	
	} //<

    
    
	if (foundUnusedCoreDeps) { //>
		console.error(chalk.redBright.bold('Validation fail: Unused dependency packages found.\n'))
		process.exit(1)
	
	} //<
	      
	else { //> No unused core dependencies were found
		if (unusedDevDependencies.length > 0) {
			// Core deps are clean, but dev deps were listed
			console.log(chalk.green('Unused devDependencies listed above are informational.'))
		
		}
		else {
			// Core deps are clean, AND no dev deps were listed
			console.log(chalk.green('No unused dependencies found.'))
		
		}
		process.exit(0)
	
	} //<

    

} //<

checkUnusedDependencies()
