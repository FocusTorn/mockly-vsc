// .releaserc.js
export const branches = [
    'main', // Your primary release branch
    'master',
    { name: 'next', prerelease: true }, // Example: for pre-releases on a 'next' branch
    { name: 'beta', prerelease: true }, // Example: for beta pre-releases
    { name: 'alpha', prerelease: true }, // Example: for alpha pre-releases
];
export const plugins = [
    // 1. Analyze commits
    '@semantic-release/commit-analyzer',
    // 2. Generate release notes
    '@semantic-release/release-notes-generator',
    // 3. Update CHANGELOG.md
    [
        '@semantic-release/changelog',
        {
            changelogFile: 'CHANGELOG.md',
        },
    ],
    // 4. Update package.json version, and publish to npm
    //    (Handles both package.json and package-lock.json if present)
    [
        '@semantic-release/npm',
        {
            npmPublish: true, // Set to true to publish to npm, false for dry-run style local versioning
            pkgRoot: 'dist', // Uncomment if your built package is in a 'dist' folder
        },
    ],
    // 5. Create a GitHub release
    [
        '@semantic-release/github',
        {
            // assets: [ // Optional: define assets to upload to the GitHub release
            //   { path: 'dist/**/*', label: 'Distribution Files' },
            //   { path: 'coverage.zip', label: 'Coverage Report' }
            // ]
        },
    ],
    // 6. Commit changes (package.json, CHANGELOG.md, package-lock.json) and create a Git tag
    [
        '@semantic-release/git',
        {
            assets: [
                'package.json',
                'package-lock.json', // Make sure to include this if you use it
                'CHANGELOG.md',
            ],
            
            // eslint-disable-next-line no-template-curly-in-string
            message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
    ],
];
