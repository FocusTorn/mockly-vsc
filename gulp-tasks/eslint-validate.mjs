// ESLint & Imports -->>

import chalk from 'chalk'
import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'
import path from 'node:path'
import process from 'node:process'

//--------------------------------------------------------------------------------------------------------------<<

const exec = promisify(callbackExec)

export async function eslintsum() { //>
	let eslintOutputJson = ''
	let exitCode = 0 // Exit code from the eslint process itself
	let eslintResults = []

	try {
		const { stdout } = await exec('npx eslint . --fix --format json --no-color')
		eslintOutputJson = stdout
		// If eslint exits with 0, it means no lint errors.

	}
	catch (error) {
		// ESLint exits with a non-zero code if there are linting errors or other execution issues.
		eslintOutputJson = error.stdout || '' // JSON output is on stdout even on error
		exitCode = typeof error.code === 'number' ? error.code : 1 // Capture ESLint's exit code

	}

	try {
		if (eslintOutputJson) {
			eslintResults = JSON.parse(eslintOutputJson)

		}
		else if (exitCode !== 0 && !eslintOutputJson) {
			// Handle cases where ESLint fails without producing JSON (e.g., config error)
			console.error(chalk.red('ESLint execution failed and produced no JSON output. Check ESLint configuration or command.'))
			// No specific error count, but it's a failure.
			console.log(chalk.redBright(`ESLint validation reported critical execution errors.\n`))
			return false // Indicate failure

		}

	}
	catch (parseError) {
		console.error(chalk.red('Failed to parse ESLint JSON output:'))
		console.error(eslintOutputJson)
		console.error(parseError)
		console.log(chalk.redBright(`ESLint validation reported JSON parsing errors.\n`))
		return false // Indicate failure

	}

	const filesWithErrors = []
	let totalErrorCountFromResults = 0

	for (const result of eslintResults) { //>
		if (result.errorCount > 0) {
			totalErrorCountFromResults += result.errorCount
			const firstErrorMessage = result.messages.find(msg => msg.severity === 2)
			const firstErrorLine = firstErrorMessage ? firstErrorMessage.line : 'N/A'
			const relativePath = path.relative(process.cwd(), result.filePath).replace(/\\/g, '/')
			filesWithErrors.push({ path: relativePath, count: result.errorCount, firstLine: firstErrorLine })

		}

	} //<


	// Determine overall success based on ESLint's exit code primarily,
	// or secondarily by parsed error counts if exit code was 0 but errors were found (unlikely for ESLint).
	const hadErrors = exitCode !== 0 || totalErrorCountFromResults > 0

	if (!hadErrors) {
		console.log(chalk.green('ESLint found no errors.'))
		console.log('')
	
	}
	else {
		const numFilesWithErrors = filesWithErrors.length
		// Use totalErrorCountFromResults for the message, as exitCode just signals error presence.
		const errorDisplayCount = totalErrorCountFromResults > 0 ? totalErrorCountFromResults : 'some'
		const pluralFiles = numFilesWithErrors === 1 ? 'file' : 'files'
		const pluralErrors = totalErrorCountFromResults === 1 ? 'error' : 'errors'


		if (numFilesWithErrors === 1 && filesWithErrors[0]) {
			const file = filesWithErrors[0]
			console.log('')

			console.log('Errors  File')
			const formattedErrorCount = String(file.count).padStart(5, ' ')
			console.log(`${formattedErrorCount}  ${file.path}:${file.firstLine}`)

		}
		else if (numFilesWithErrors > 0) {
			console.log('')

			console.log('Errors  File (first error at line)')
			filesWithErrors.forEach((file) => {
				const formattedErrorCount = String(file.count).padStart(5, ' ')
				console.log(`${formattedErrorCount}  ${file.path}:${file.firstLine}`)

			})

		}

		console.log('')
		console.log(chalk.red(`ESLint found ${errorDisplayCount} ${pluralErrors}${numFilesWithErrors > 0 ? ` in ${numFilesWithErrors} ${pluralFiles}` : ''}.`))
		console.log('')



	}


	if (hadErrors) {
		// console.log(chalk.redBright(`ESLint validation reported errors.`))
		return false // Indicate failure

	}
	return true // Indicate success

} //<
