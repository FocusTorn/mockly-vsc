// esbuild.config.mjs
import esbuild from 'esbuild'
import process from 'process'

const isWatch = process.argv.includes('--watch')
const isDev = process.argv.includes('--dev') // Assuming you might use --dev for sourcemaps/minify toggle

const sharedConfig = {
    entryPoints: ['src/index.ts'], // Make sure this points to your actual entry file
    bundle: true,
    platform: 'node',
    target: 'es2022', // Match your tsconfig target
    sourcemap: isDev, // Generate sourcemaps only if --dev is passed (or set true/false as needed)
    minify: !isDev,   // Minify only if --dev is NOT passed (production)
    tsconfig: './tsconfig.json', // Ensure esbuild uses the tsconfig
    logLevel: 'info',
    external: ['vscode'], // Keep vscode external
}

async function buildOrWatch(config) { //>
    // This function remains the same
    const context = await esbuild.context(config)
    if (isWatch) {
        await context.watch()
        // Return context for watch mode if needed elsewhere, otherwise void is fine
    }
    else {
        await context.rebuild()
        await context.dispose()
    }
} //<

// --- Start of Change ---
async function main() { //> Wrap the execution logic in an async function
    // Build ESM
    const esmPromise = buildOrWatch({
        ...sharedConfig,
        format: 'esm',
        outfile: 'dist/index.js', // Output for ESM
    })

    // Build CJS
    const cjsPromise = buildOrWatch({
        ...sharedConfig,
        format: 'cjs',
        outfile: 'dist/index.cjs', // Output for CJS
    })

    // Wait for builds/watches to start
    // Use Promise.allSettled if you want to see results even if one fails
    // Note: buildOrWatch doesn't explicitly return a promise that resolves
    // when the build is *done* in non-watch mode, it resolves after dispose.
    // In watch mode, it resolves after watch starts. Promise.all is okay here
    // to wait for the setup phase of both.
    await Promise.all([esmPromise, cjsPromise])

    if (isWatch) {
        console.log('Watching for changes (ESM & CJS)...')
        // Keep the process alive in watch mode
    }
    else {
        console.log(`Build complete (${isDev ? 'development' : 'production'}) for ESM & CJS.`)
    }
} //<

// Execute the main function and handle potential errors
main().catch((error) => { //>
    console.error("Build process failed:", error);
    process.exit(1); // Exit if the build setup fails
}); //<
// --- End of Change ---