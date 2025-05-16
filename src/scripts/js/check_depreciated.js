import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const deprecatedPackages = Object.entries(data.packages)
	.filter(([_, details]) => details.deprecated)
	.map(([name, details]) => `\x1B[38;5;179m${name}\x1B[0m:\n\t${details.deprecated}\n`)

console.log(deprecatedPackages.join(''))
