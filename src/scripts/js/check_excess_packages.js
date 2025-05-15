import path from 'node:path'
import chalk from 'chalk'
import process from 'process'

import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'

const ignoreDirs = ['dist', 'dll', 'release', 'src/dist']

const ignoreMatches = [
    'wireit',
    'gulp',
    'rimraf',

    //- TYPESCRIPT HELPERS --------------------------------------------------
    'typescript-eslint',
    '@typescript-eslint/eslint-plugin', // ADD THIS
    '@typescript-eslint/parser', // ADD THIS
    'ts-node',
    'tsconfig-paths',

    //- ESBUILD TOOLS -------------------------------------------------------
    'esbuild-visualizer', // ESBuild tool
    '@esbuild-plugins/tsconfig-paths',

    //- VITEST DEPENDENCIES -------------------------------------------------
    '@vitest/coverage-istanbul', // vitest provider
    '@vitest/coverage-v8', // vitest provider

    //- ESLINT DEPENDENCIES -------------------------------------------------
    '@eslint/config-inspector', // ESLint tool
    'eslint-rule-tester', // ESLint tool
    
    // ESLINT PLUGINS
    'eslint-plugin-chai-friendly', // Chai rule skips
    'eslint-plugin-unicorn', // unicorn() in use
    'eslint-plugin-unused-imports', // Rules used

    // AntFu
    '@eslint/js', // @antfu: javascript()
    '@stylistic/eslint-plugin', // @antfu: stylistic()
    'eslint-plugin-jsdoc', // @antfu: jsdoc()
    'eslint-plugin-import', // @antfu: imports()
]

const options = { ignoreMatches, ignoreDirs }

const exec = promisify(callbackExec)

async function checkUnusedDependencies() { //>

    const projectPath = path.join(import.meta.dirname, '../../..')

    let command = `depcheck ${projectPath} --json`

    if (options.ignoreMatches && options.ignoreMatches.length > 0) { //>
        // Join patterns with commas for the --ignore argument
        // command += ` --ignore="${options.ignoreMatches.join(',')}"`
        options.ignoreMatches.forEach(match => {
            command += ` --ignore="${match}"`
        });
        
    } //<

    if (options.ignoreDirs && options.ignoreDirs.length > 0) { //>
        // Join directories with commas for the --ignore-dirs argument
        command += ` --ignore-dirs="${options.ignoreDirs.join(',')}"`
    } //<

    let stdout = ''
    let stderr = ''
    let unused

    console.log('')
    console.log('Command ran:', command)
    console.log('')
    
    try {
        const result = await exec(command)
        stdout = result.stdout
        stderr = result.stderr
        unused = JSON.parse(stdout)
    }
    catch (error) { //>
        // depcheck exits with a non-zero code (usually 1) if unused dependencies are found.
        // When this happens, the error object contains the stdout and stderr.
        stdout = error.stdout
        stderr = error.stderr

        try { unused = JSON.parse(stdout) }
        catch (parseError) { //>
            // Handle case where output is not valid JSON
            console.error(chalk.red('Failed to parse depcheck JSON output:'))
            console.error(stdout)
            console.error(stderr)
            console.error(parseError)
            console.error(parseError)
            process.exit(1)
        } //<
    } //<

    const unusedDependencies = unused.dependencies || []
    const unusedDevDependencies = unused.devDependencies || []

    let foundUnusedCoreDeps = false

    if (unusedDependencies.length > 0) { //>
        console.log(chalk.red.bold('Unused dependencies'))
        console.log(chalk.red(unusedDependencies.join('\n')))
        foundUnusedCoreDeps = true
    } //<

    if (unusedDevDependencies.length > 0) { //>
        console.log(chalk.yellow.bold('Unused devDependencies'))
        console.log(chalk.yellow(unusedDevDependencies.join('\n')))
    } //<

    if (stderr) { //>
        console.error(chalk.blue('\ndepcheck stderr:'))
        console.error(stderr.trim())
    } //<

    if (foundUnusedCoreDeps) { //>
        console.error(chalk.red('\nUnused dependency packages found.\n'))
        process.exit(1) // Exit with non-zero code ONLY if unused core dependencies were found
    } //<
    else { //>
        console.log(chalk.green('\nNo unused core dependencies found. Unused devDependencies listed above are informational.\n')) // Added newline at end for consistent output
        process.exit(0)
    } //<

} //<

checkUnusedDependencies()

// import path from 'node:path'
// import chalk from 'chalk'

// import { exec as callbackExec } from 'child_process'
// import { promisify } from 'util'

// const options = {
//     ignoreMatches: [
//         'wireit',
//         'gulp',

//         //- TYPESCRIPT HELPERS --------------------------------------------------
//         'typescript-eslint',
//         'ts-node',
//         'tsconfig-paths',

//         //- ESBUILD TOOLS -------------------------------------------------------
//         'esbuild-visualizer',               // ESBuild tool
//         '@esbuild-plugins/tsconfig-paths',

//         //- VITEST DEPENDENCIES -------------------------------------------------
//         '@vitest/coverage-istanbul',        // vitest provider
//         '@vitest/coverage-v8',              // vitest provider

//         //- ESLINT DEPENDENCIES -------------------------------------------------
//         '@eslint/config-inspector',         // ESLint tool
//         'eslint-rule-tester',               // ESLint tool

//         'eslint-plugin-chai-friendly',      // Chai rule skips
//         'eslint-plugin-unicorn',            // unicorn() in use
//         'eslint-plugin-unused-imports',     // Rules used

//         '@eslint/js',                       // @antfu: javascript()
//         '@stylistic/eslint-plugin',         // @antfu: stylistic()
//         'eslint-plugin-jsdoc',              // @antfu: jsdoc()
//         'eslint-plugin-jsonc',              // @antfu: jsonc()
//         'eslint-plugin-import',             // @antfu: imports()

//     ],
//     skipMissing: false,
//     ignoreDirs: [ 'dist', 'dll', 'release', 'src/dist', ],

//     // the target special parsers
//     // specials: [ depcheck.special.eslint, ],
// }

// const exec = promisify(callbackExec)

// async function checkUnusedDependencies () {
//     const projectPath = path.join(import.meta.dirname, '../../..')
//     const { stdout, stderr } = await exec(`depcheck ${projectPath} --json`)
//     const unused = JSON.parse(stdout)
//     console.log(unused) // For debugging, inspect the structure
//   }
//   checkUnusedDependencies()

// depcheck(path.join(import.meta.dirname, '../../..'), options, (unused) => {
//     const unusedDependencies = unused.dependencies || [] // Use empty array if null or undefined
//     const unusedDevDependencies = unused.devDependencies || [] // Use empty array if null or undefined

//     if (unusedDependencies.length > 0) { // Check length directly
//         console.log(chalk.yellow.bold('Unused dependencies'))
//         console.log(chalk.yellow(unusedDependencies.join('\n'))) // Native join
//     }

//     if (unusedDevDependencies.length > 0) { // Check length directly
//         console.log(chalk.yellow.bold('Unused devDependencies'))
//         console.log(chalk.yellow(unusedDevDependencies.join('\n'))) // Native join
//     }
// })
