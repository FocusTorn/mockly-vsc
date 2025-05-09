// // esbuild.config.mjs
// import esbuild from 'esbuild'
// import process from 'process'

// const isWatch = process.argv.includes('--watch')
// const isDev = process.argv.includes('--dev')

// const sharedConfig = {
//     entryPoints: ['src/index.ts'],
//     bundle: true,
//     platform: 'node',
//     target: 'es2020',
//     sourcemap: isDev,
//     minify: !isDev,
//     tsconfig: './tsconfig.json',
//     logLevel: 'info',
// }

// async function buildOrWatch(config) {
//     const context = await esbuild.context(config)
//     if (isWatch) {
//         await context.watch()
//     }
//     else {
//         await context.rebuild()
//         await context.dispose()
//     }
// }

// // Build ESM
// const esmPromise = buildOrWatch({
//     ...sharedConfig,
//     format: 'esm',
//     outfile: 'dist/index.js', // Output for ESM
// })

// // Build CJS
// const cjsPromise = buildOrWatch({
//     ...sharedConfig,
//     format: 'cjs',
//     outfile: 'dist/index.cjs', // Output for CJS
// })

// // Wait for builds/watches to start
// await Promise.all([esmPromise, cjsPromise])

// if (isWatch) {
//     console.log('Watching for changes (ESM & CJS)...')
// }
// else {
//     console.log(`Build complete (${isDev ? 'development' : 'production'}) for ESM & CJS.`)
// }
