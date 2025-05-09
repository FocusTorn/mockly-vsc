// ESLint & Imports --------->>

import gulp from 'gulp'
import log from 'fancy-log'

import { exec as callbackExec } from 'child_process'
import { promisify } from 'util'
import chalk from 'chalk'

//--------------------------------------------------------------------------------------------------------------<<

const tsSourceFiles = [
    'src/**/*.ts',
    '*.ts',
]

const exec = promisify(callbackExec) // Promisify exec for async/await usage

async function tsum() { //>
    console.log('\x1Bc')

    let output = ''
    let exitCode = 0
    let tscSuccess = false

    try {
        const { stdout, stderr } = await exec('npx tsc --pretty')
        output = stderr + stdout
        tscSuccess = true
        exitCode = 0
    }
    catch (e) { //>
        output = (e.stderr || '') + (e.stdout || '')
        exitCode = typeof e.code === 'number' ? e.code : 1
        tscSuccess = false
    } //<

    const outputLines = output.trim().split(/\r?\n/)
    let startIndex = -1
    
    const summaryPattern = /^Found \d+ errors? in (the same file|\d+ file)\.?/
    startIndex = outputLines.findIndex(line => summaryPattern.test(line))

    if (startIndex !== -1) {
        console.log(outputLines.slice(startIndex).join('\n'))
    }
    else if (!tscSuccess) {
        console.log(chalk.red(`\n--- TSC output (Exited with code ${exitCode}, TSC summary line NOT found) ---\n`))
        console.log(output.trim())
    }
    else {
        console.log(chalk.green('\nTSC found no errors'))
    }

    console.log('')
} //<

function logWatchStart(done) { //> This task *only* logs the message. 
    
    // log(`Watcher started. Watching files: ${colors.cyan(tsSourceFiles.join(', '))}`)
    
    log(chalk.yellow(`Watching for file changes...`))
    
    // It needs `done` for Gulp to know it finished.
    done()
    
} //<

function startTscWatcher() { //>
    return gulp.watch(tsSourceFiles, gulp.series(tsum, logWatchStart))
} //<

// Define the main watch task:
// 1. Runs tsum once.
// 2. Logs the "Watcher started" message.
// 3. Starts the actual file watcher.
export const watch = gulp.series(tsum, logWatchStart, startTscWatcher) // Run this with: gulp watch
export { tsum }

async function validatePackages(done) {
    // log(colors.magenta('Validating Packages...'))
    const { stdout, stderr } = await exec('node src/scripts/js/check_excess_packages.js')
    if (stderr) {
        console.error(chalk.red('Package validation errors:'))
        console.error(stderr)
    }
    if (stdout) {
        console.log(stdout) // Log the output
    }
    // log(colors.magenta('Package validation complete.'))
    done() // Indicate task completion
}

export const validate = gulp.series(tsum, validatePackages)

// // ESLint ------------------->> 

// // --- Configuration ---
// // Adjust this glob pattern to match all the TS files you want to lint.
// // It respects the 'ignores' defined in your eslint.config.js
// const filesToLint = [
//     'src/**/*.ts',
//     // 'lib/**/*.ts',
//     'test/**/*.ts',
//     '*.ts', // Lint TS files in the root
//     '*.mjs', // Also lint MJS files (like this gulpfile or eslint.config.js if it were mjs)
//     'eslint.config.js', // Lint your ESLint config itself
// ];

// // Options for ESLint execution
// const eslintOptions = {
//     // fix: true, // Uncomment to enable auto-fixing
//     // warnIgnored: true, // Uncomment to show warnings for ignored files
// };

// // --- Gulp Task ---

// /**
//  * Lints TypeScript files using ESLint with Flat Config (eslint.config.js).
//  */
// function lint() {
//     log(`Starting ${colors.cyan('\'lint\'')} task...`);
//     return gulp.src(filesToLint, { base: './', since: gulp.lastRun(lint) }) // `since` optimizes for incremental builds
//         .pipe(eslint(eslintOptions)) // ESLint automatically finds eslint.config.js
//         .pipe(eslint.format('stylish')) // Format output nicely
//         .pipe(eslint.failAfterError()) // Fail the Gulp task if errors are found
//         // If using `fix: true`, uncomment the next line to write changes back to files
//         // .pipe(gulp.dest('./'))
//         .on('end', () => {
//             log(`Finished ${colors.cyan('\'lint\'')} task`);
//         })
//         .on('error', (err) => {
//             log.error(`Error in ${colors.cyan('\'lint\'')} task:`, err);
//         });
// }

// // --- Exports ---

// // Define the public Gulp task
// gulp.task('lint', lint);

// // Define a default task (runs when you just type `gulp`)
// gulp.task('default', gulp.series('lint'));

// // Optional: Watch for changes and lint automatically
// function watchFiles() {
//     log('Watching files for changes...');
//     gulp.watch(filesToLint, gulp.series('lint'));
// }

// gulp.task('watch', watchFiles);

// // Export tasks for potential programmatic use (optional)

// //--------------------------------------------------------<<
// export { lint, watchFiles as watch };
