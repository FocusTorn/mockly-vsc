
// ESLint & Imports -->>

import chalk from 'chalk'
import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'
// import process from 'process' // Removed: No longer using process.exit()

//--------------------------------------------------------------------------------------------------------------<<

const exec = promisify(callbackExec) // Promisify exec for async/await usage


export async function tsum() { //>
	// console.log('\x1Bc') // Removed: Clear console is handled in gulpfile.mjs
	let output = ''
	let exitCode = 0

	try {
		const result = await exec('npx tsc --pretty')
		output = result.stderr + result.stdout
		exitCode = 0 // Assume success if exec doesn't throw
	
	}
	catch (e) { //> This catch handles exec failures, including tsc non-zero exit codes
		output = (e.stderr || '') + (e.stdout || '')
		exitCode = typeof e.code === 'number' ? e.code : 1
	
	} //<

	let summaryLineIndex = -1
	const summaryPattern = /^Found \d+ errors? in /
	const outputLines = output.trim().split(/\r?\n/)
	summaryLineIndex = outputLines.findIndex(line => summaryPattern.test(line))

	if (summaryLineIndex !== -1) { // A TSC summary line was found
		const actualSummaryLineText = outputLines[summaryLineIndex]
		if (exitCode === 0) { exitCode = 1 } // Ensure exitCode reflects error if summary found

		if (actualSummaryLineText.includes('same file')) {
			const sameFileRegex = /Found (\d+) errors in the same file, starting at: (.+?):(\d+)/
			const sameFileMatch = actualSummaryLineText.match(sameFileRegex)
			if (sameFileMatch) {
				const errorCount = sameFileMatch[1]; const filePath = sameFileMatch[2]; const lineNumber = sameFileMatch[3]
				const pluralErrors = errorCount === '1' ? 'error' : 'errors'
                
				console.log('Errors  Files'); const formattedErrorCount = String(errorCount).padStart(5, ' ')
				console.log(`${formattedErrorCount}  ${filePath}:${lineNumber}`)
				console.log('')
				console.log(chalk.red(`TSC found ${errorCount} ${pluralErrors} in 1 file.`))
                
			}
		
		}
		else if (actualSummaryLineText.includes('1 error in')) {
			const singleErrorRegex = /Found 1 error in (.+?):(\d+)/
			const singleErrorMatch = actualSummaryLineText.match(singleErrorRegex)
			if (singleErrorMatch) {
				const filePath = singleErrorMatch[1]; const lineNumber = singleErrorMatch[2]
				
				console.log('Errors  Files'); console.log(`     1  ${filePath}:${lineNumber}`)
				console.log('')
				console.log(chalk.red(`TSC found 1 error in 1 file.`))
                
			}
		
		}
		else if (actualSummaryLineText.match(/^Found \d+ errors? in \d+ files?\.$/)) {
			if (outputLines.length > summaryLineIndex + 1) {
				console.log(outputLines.slice(summaryLineIndex + 1).join('\n'))
			
			}
		
			console.log(chalk.red(`TSC ${actualSummaryLineText.toLowerCase()}`))
            
		}
		else {
			console.log(chalk.yellow('Scenario: Other TSC summary (default display).'))
			console.log(actualSummaryLineText)
		
		}
	
	}
	else if (exitCode !== 0) { // No TSC summary line found, but exec reported an error
		if (output.includes('ENOENT')) {
			console.log(chalk.red(`\n--- TSC Command Execution Failed ---`))
			console.log(chalk.yellow(`Error: Could not execute 'npx tsc'.`)); console.log(chalk.dim(`  Ensure Node.js and npm are installed correctly.`))
			if (output.trim()) { console.log(chalk.dim(`  System error details: ${output.trim()}`)) }
		
		}
		else {
			console.log(chalk.red(`\n--- TSC Execution Problem (Exited with code ${exitCode}) ---\n`))
			console.log(output.trim())
		
		}
	
	}
	else {
		console.log(chalk.green('TSC found no errors'))
	
	}

	console.log('') // Keep trailing blank line for tsum's own output

	if (exitCode !== 0) {
		// console.log(chalk.redBright('TSC validation reported errors.')) // Modified message
		return false // Indicate failure
	
	}
	return true // Indicate success

} //<








// // ESLint & Imports -->>

// import chalk from 'chalk'
// import { exec as callbackExec } from 'child_process'
// import { promisify } from 'util'
// // import process from 'process' // Removed: No longer using process.exit()

// //--------------------------------------------------------------------------------------------------------------<<

// const exec = promisify(callbackExec) // Promisify exec for async/await usage

// export async function tsum() {
// 	let output = ''
// 	let exitCode = 0

// 	try {
// 		const result = await exec('npx tsc --pretty')
// 		output = result.stderr + result.stdout
// 		exitCode = 0 // Assume success if exec doesn't throw
	
// 	}
// 	catch (e) { //> This catch handles exec failures, including tsc non-zero exit codes
// 		output = (e.stderr || '') + (e.stdout || '')
// 		exitCode = typeof e.code === 'number' ? e.code : 1
	
// 	} //<

// 	let summaryLineIndex = -1
// 	const summaryPattern = /^Found \d+ errors? in /
// 	const outputLines = output.trim().split(/\r?\n/)
// 	summaryLineIndex = outputLines.findIndex(line => summaryPattern.test(line))

// 	if (summaryLineIndex !== -1) { // A TSC summary line was found (meaning errors were reported by tsc)
// 		const actualSummaryLineText = outputLines[summaryLineIndex]
        
// 		if (exitCode === 0) { exitCode = 1 }

// 		if (actualSummaryLineText.includes('same file')) { //>                              Scenario: "Found X errors in the same file..."
// 			const sameFileRegex = /Found (\d+) errors in the same file, starting at: (.+?):(\d+)/
// 			const sameFileMatch = actualSummaryLineText.match(sameFileRegex)

// 			if (sameFileMatch) {
// 				const errorCount = sameFileMatch[1]
// 				const filePath = sameFileMatch[2]
// 				const lineNumber = sameFileMatch[3]
// 				const pluralErrors = errorCount === '1' ? 'error' : 'errors'

// 				console.log(chalk.yellow(`TSC found ${errorCount} ${pluralErrors} in 1 file.`))
// 				console.log('') // Blank line
// 				console.log('Errors  Files')
// 				const formattedErrorCount = String(errorCount).padStart(5, ' ')
// 				console.log(`${formattedErrorCount}  ${filePath}:${lineNumber}`)
			
// 			}
		
// 		} //<
        
// 		else if (actualSummaryLineText.includes('1 error in')) { //>                        Scenario: "Found 1 error in ..."
// 			const singleErrorRegex = /Found 1 error in (.+?):(\d+)/
// 			const singleErrorMatch = actualSummaryLineText.match(singleErrorRegex)

// 			if (singleErrorMatch) {
// 				const filePath = singleErrorMatch[1]
// 				const lineNumber = singleErrorMatch[2]
// 				console.log(chalk.yellow(`TSC found 1 error in 1 file.`))
// 				console.log('')
// 				console.log('Errors  Files')
// 				console.log(`     1  ${filePath}:${lineNumber}`)
			
// 			}
		
// 		} //<
        
// 		else if (actualSummaryLineText.match(/^Found \d+ errors? in \d+ files?\.$/)) { //>  Scenario: "Found X errors in Y files..."
// 			// console.log(chalk.yellow(actualSummaryLineText))
// 			console.log(chalk.yellow(`TSC ${actualSummaryLineText.toLowerCase()}`))
            
			
// 			if (outputLines.length > summaryLineIndex + 1) {
// 				console.log(outputLines.slice(summaryLineIndex + 1).join('\n'))
			
// 			}
            
// 		} //<
        
// 		else { //>
// 			console.log(chalk.yellow('Scenario: Other TSC summary (default display).'))
// 			console.log(actualSummaryLineText)
		
// 		} //<
    
// 	}
    
// 	else if (exitCode !== 0) { //> No TSC summary line found, but exec reported an error (e.g., ENOENT, or tsc failed without a parsable summary)
// 		if (output.includes('ENOENT')) {
// 			console.log(chalk.red(`\n--- TSC Command Execution Failed ---`))
// 			console.log(chalk.yellow(`Error: Could not execute 'npx tsc'. The command 'npx' may not be installed or found in your system's PATH.`))
// 			console.log(chalk.dim(`  Ensure Node.js and npm are installed correctly and their bin directories are in the system PATH.`))
// 			if (output.trim()) {
// 				console.log(chalk.dim(`  System error details: ${output.trim()}`))
			
// 			}
		
// 		}
// 		else { // Other exec error, or tsc failed without a summary line we recognize
// 			console.log(chalk.red(`\n--- TSC Execution Problem (Exited with code ${exitCode}) ---\n`))
// 			console.log(output.trim())
		
// 		}
	
// 	} //<
// 	else { console.log(chalk.green('TSC found no errors')) }

// 	console.log('')

// 	if (exitCode !== 0) { //>
// 		// Print your custom failure message
// 		console.log(chalk.redBright.bold('\nValidation fail: TSC errors found.\n'))

// 		// Signal failure to Gulp by throwing an error.
// 		// This will stop the gulp.series execution.
// 		throw new Error('TSC validation task failed.')
	
// 	} //<

// }










// // // ESLint & Imports -->>

// // import chalk from 'chalk'
// // import { exec as callbackExec } from 'child_process'
// // import { promisify } from 'util'
// // import process from 'process'


// // //--------------------------------------------------------------------------------------------------------------<<

// // const exec = promisify(callbackExec) // Promisify exec for async/await usage

// // export async function tsum() {
// // 	console.log('\x1Bc') // Clear console
// // 	let output = ''
// // 	let exitCode = 0

// // 	try {
// // 		const result = await exec('npx tsc --pretty')
// // 		output = result.stderr + result.stdout
// // 		exitCode = 0
// // 	}
// // 	catch (e) { //>
// // 		output = (e.stderr || '') + (e.stdout || '')
// // 		exitCode = typeof e.code === 'number' ? e.code : 1

// // 	} //<

// //     let summaryLineIndex = -1
// //     const summaryPattern = /^Found \d+ errors? in /

// // 	const outputLines = output.trim().split(/\r?\n/)

// // 	summaryLineIndex = outputLines.findIndex(line => summaryPattern.test(line))



// // 	if (summaryLineIndex !== -1) { //> A TSC summary line was found
// // 		const actualSummaryLineText = outputLines[summaryLineIndex]

// // 		if (actualSummaryLineText.includes('same file')) { //>                              Scenario: "Found X errors in the same file..."
// // 			const sameFileRegex = /Found (\d+) errors? in the same file, starting at: (.+?):(\d+)/
// // 			const sameFileMatch = actualSummaryLineText.match(sameFileRegex)

// // 			if (sameFileMatch) {
// // 				const errorCount = sameFileMatch[1]
// // 				const filePath = sameFileMatch[2]
// // 				const lineNumber = sameFileMatch[3]
// // 				const pluralErrors = errorCount === '1' ? 'error' : 'errors'

// // 				console.log(chalk.yellow(`Found ${errorCount} ${pluralErrors} in 1 file.`))
// // 				console.log('') // Blank line
// // 				console.log('Errors  Files')
// // 				const formattedErrorCount = String(errorCount).padStart(5, ' ')
// // 				console.log(`${formattedErrorCount}  ${filePath}:${lineNumber}`)

// // 			}

// // 		} //<
// // 		else if (actualSummaryLineText.includes('1 error in')) { //>                        Scenario: "Found 1 error in ..."
// // 			const singleErrorRegex = /Found 1 error in (.+?):(\d+)/
// // 			const singleErrorMatch = actualSummaryLineText.match(singleErrorRegex)

// // 			if (singleErrorMatch) {
// // 				const filePath = singleErrorMatch[1]
// // 				const lineNumber = singleErrorMatch[2]
// // 				console.log(chalk.yellow(`Found 1 error in 1 file.`))
// // 				console.log('')
// // 				console.log('Errors  Files')
// // 				console.log(`     1  ${filePath}:${lineNumber}`)

// // 			}
// // 			// else {
// // 			//     console.log(actualSummaryLineText); // Fallback if regex fails
// // 			// }

// // 		} //<
// // 		else if (actualSummaryLineText.match(/^Found \d+ errors? in \d+ files?\.$/)) { //>  Scenario: "Found X errors in Y files..."
// // 			// Print the summary line itself in yellow
// // 			console.log(chalk.yellow(actualSummaryLineText))

// // 			// Print the rest of the lines (the table) if they exist
// // 			if (outputLines.length > summaryLineIndex + 1) {
// // 				// outputLines.slice(summaryLineIndex + 1) gets all lines *after* the summary line
// // 				console.log(outputLines.slice(summaryLineIndex + 1).join('\n'))

// // 			}

// // 		} //<
// // 		else { //>
// // 			console.log(chalk.yellow('Scenario: Other TSC summary (default display).'))
// // 			console.log(actualSummaryLineText)

// // 		} //<

// // 		if (exitCode === 0) { exitCode = 1 }

// // 	} //<
// // 	else if (exitCode !== 0) { //> TSC Command Execution Failed
// // 		// This case handles `npx ENOENT` or other exec failures where no summary line is found.
// // 		// The `runTscWithSpawn` version had more specific handling for ENOENT.
// // 		// With `exec`, the error `e` in the catch block would contain `e.message` like "spawn npx ENOENT".
// // 		if (output.includes('ENOENT')) {
// // 			console.log(chalk.red(`\n--- TSC Command Execution Failed ---`))
// // 			console.log(chalk.yellow(`Error: Could not execute 'npx tsc'. The command 'npx' may not be installed or found in your system's PATH.`))
// // 			console.log(chalk.dim(`  Ensure Node.js and npm are installed correctly and their bin directories are in the system PATH.`))
// // 			if (output.trim()) {
// // 				console.log(chalk.dim(`  System error details: ${output.trim()}`))

// // 			}

// // 		}
// // 		else {
// // 			console.log(chalk.red(`\n--- TSC output (Exited with code ${exitCode}, TSC summary line NOT found) ---\n`))
// // 			console.log(output.trim())

// // 		}

// // 	} //<

// //     else { console.log(chalk.green('\nTSC found no errors')) }

// // 	console.log('')

// // 	if (exitCode !== 0) { process.exit(exitCode) }

// // }
