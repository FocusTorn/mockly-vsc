// /* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable style/no-multiple-empty-lines */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
//> Plugin wishlist

// @ztrehagem/svg-bundler

// //- Esbuild plugin to copy and watch for files  ------------------>>
// esbuild-plugin-copy-watch

// import copy from 'esbuild-plugin-copy-watch'

// await esbuild.build({
//   entryPoints: ['src/index.js'],
//   bundle: true,
//   outfile: 'dest/build.js',
//   write: false,
//   plugins: [
//     copy({
//       paths: [
//         { from: 'static/**', to: 'static' }, // will copy into dest/static
//         { from: ['config/*.js', '!config/private.js'], to: 'config' } // will copy config files into dest/config and ignore the private.js
//       ],
//       forceCopyOnRebuild: false // force to copy the files in every rebuild
//     })
//   ]
// })
// //----------------------------------------------------------------<<
// //- Plugin which uses tsc to compile typescript files ------------>>

// esbuild-tsc typescript

// import esbuildPluginTsc from 'esbuild-tsc';

// plugins: [
//     esbuildPluginTsc(options),
//   ],

// _tsconfigPath [string] _: Path of the tsconfig json file. filter [RegExp | Function]: A RegExp or function to filter files.

// //<

//- ESLINT  --->>
/* eslint-disable style/max-statements-per-line */

//---------------------------------------------------------------<<
//- IMPORTS  -->>

import { writeFile } from 'fs'
import { rm } from 'fs/promises'
import process from 'process'
import path from 'path'
import { fileURLToPath } from 'url'
import { context } from 'esbuild'

//---------------------------------------------------------------<<

const production = process.argv.includes('--production')
const meta = process.argv.includes('--meta')
const watch = process.argv.includes('--watch')
// const test = process.argv.includes('--test')

const pluginsToInclude = [ //>
    './plugins/esbuildProblemMatcher.js',
    // './plugins/createTsPathsPlugin.js',

    // _fixPnpSourcemapPaths,
    // esbuildProblemMatcher
    // _logPathResolution,
] //<

async function loadPlugins() { //>
    const loadedPlugins = await Promise.all(
        pluginsToInclude.map(async (pluginEntry) => {
            try {
                if (typeof pluginEntry === 'string') {
                    // External plugin (path provided)
                    const pluginPath = new URL(pluginEntry, import.meta.url)
                    const pluginModule = await import(pluginPath)

                    pluginModule.default.name = path.basename(fileURLToPath(pluginPath), '.js')
                    return pluginModule.default
                }
                else if (typeof pluginEntry === 'object' && pluginEntry.name) {
                    // Plugin constant (assume it has a 'name' property)
                    return pluginEntry
                }
                else {
                    console.error(`Invalid plugin entry: ${pluginEntry}`)
                    return null
                }
            }
            catch (e) { //>
                console.error(`Error loading plugin: ${pluginEntry}`, e)

                return null
            } //<
        }),
    )

    return loadedPlugins.filter(Boolean)
}

//<

const buildOptions = (async () => {
    const plugins = await loadPlugins()
    return {
        bundle: true,
        plugins,
        
        sourcemap: !production,
        minify: production,
        
        metafile: meta,
        
        sourcesContent: false,
        resolveExtensions: ['.js', '.ts'],
        format: 'cjs',
        platform: 'node',
        logLevel: 'info',

        external: ['vscode', 'typescript'],
        entryPoints: ['src/index.ts'],
        outfile: 'dist/index.cjs',
    
        logOverride: {
            'require-resolve-not-external': 'silent',
        },
    
    }
})()

async function main() {
    try {
        await rm('./dist', { recursive: true, force: true })
        await rm('./out', { recursive: true, force: true })
    }
    catch (e) { //>
        if (e.code !== 'ENOENT') {
            console.error('Error removing directory:', e)
        }
    } //<

    // if (test) { // Build *only* tests if --test is present
    //     const testCtx = await context(testOptions)
    //     await testCtx.rebuild()
    //     testCtx.dispose()
    // }
    // else { // Build main code and declaration files
    
    const options = await buildOptions
    
    const ctx = await context(options)

    if (watch) {
        await ctx.watch()
    }
    else {
        const result = await ctx.rebuild()
        
        if (options.metafile) {
            writeFile('dist/metafile.json', JSON.stringify(result.metafile, null, 2), (e) => {
                if (e)
                    console.error('Error writing metafile:', e)

                else console.log('Metafile written to dist/metafile.json') // Add this for confirmation
            })

        }
        
        await ctx.dispose()
        
        // const html = getEsbuildAnalyzerHtml(result.metafile);
        // await fs.writeFile('EsbuildAnalyzer.html', html)
    }
    // }
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})

