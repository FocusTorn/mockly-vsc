// @ts-check

// TODO Logo for Mockly
// TODO GitHub links and copyright


/**
 * @type {import('vitepress').UserConfig}
 */
export default {
	// --- Site Metadata ---
	title: 'Mockly-VSC',
	description: 'Comprehensive VSCode API Mocking for Vitest. Test your VSCode extensions with ease and confidence.',
	lang: 'en-US',
	head: [
		// Optional: Add favicon links if you have them in docs/public/
		// ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
		// ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
	],
  
	// --- Build & Deployment ---
	// IMPORTANT: Adjust this to '/your-repo-name/' if deploying to GitHub Pages
	// For example, if your repo is https://github.com/FocusTorn/mockly-vsc
	// then base should be '/mockly-vsc/'
	base: '/mockly-vsc/',
	cleanUrls: true, // Generates clean URLs without .html extension
    
	// --- Theme Configuration ---
	themeConfig: {
		// --- Logo ---
		// Place your logo in `docs/public/logo.svg` or similar path
		// logo: '/logo.svg', 
  
		// --- Navigation Bar --- https://github.com/FocusTorn/mockly-vsc
		nav: [
			{ text: 'Guide', link: '/getting-started', activeMatch: '^/(getting-started|core-concepts|test-control|examples)' },
			{
				text: 'API Reference',
				link: '/api-reference/workspace', // Link to the first API page
				activeMatch: '^/api-reference/',
			},
			{ text: 'Changelog', link: 'https://github.com/FocusTorn/mockly-vsc/blob/main/CHANGELOG.md' }, // Assuming you have a CHANGELOG.md
			{
				text: 'Version', // Optional: If you want to display version or link to releases
				items: [
					{ text: 'GitHub Releases', link: 'https://github.com/FocusTorn/mockly-vsc/releases' },
					// Add other versions if needed
				],
			},
		],
  
		// --- Sidebar ---
		sidebar: [
			{
				text: 'Guide',
				collapsed: false, // Keep this section open by default
				items: [
					{ text: 'Introduction', link: '/getting-started' }, // This is your main "Getting Started" page
					{ text: 'Core Concepts', link: '/core-concepts' },
				],
			},
			{
				text: 'API Reference',
				collapsed: false,
				items: [
					// Optional: Add an overview page for API reference if you create one
					// { text: 'Overview', link: '/api-reference/' }, 
					{ text: '<code>mockly.workspace</code>', link: '/api-reference/workspace' },
					{ text: '<code>mockly.window</code>', link: '/api-reference/window' },
					{ text: '<code>mockly.commands</code>', link: '/api-reference/commands' },
					{ text: '<code>mockly.env</code>', link: '/api-reference/env' },
					{ text: '<code>mockly.extensions</code>', link: '/api-reference/extensions' },
					{ text: 'Core VSCode Types', link: '/api-reference/core-types' },
				],
			},
			{
				text: 'Advanced Usage',
				collapsed: true, // Collapse this by default
				items: [
					{ text: 'Test Control & State', link: '/test-control' },
					{ text: 'Practical Examples', link: '/examples' },
				],
			},
			// Optional: Add a "Contributing" section if you have a page for it
			// {
			//   text: 'Contributing',
			//   items: [
			//     { text: 'Contribution Guide', link: '/contributing' }, // If you create docs/contributing.md
			//   ]
			// }
		],
  
		// --- Social Links & Edit Links ---
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/FocusTorn/mockly-vsc' },
		],
		editLink: {
			pattern: 'https://github.com/FocusTorn/mockly-vsc/edit/main/docs/:path',
			text: 'Edit this page on GitHub',
		},
		lastUpdated: { // Uses git commit timestamp
			text: 'Last Updated',
			formatOptions: {
				dateStyle: 'medium',
				timeStyle: 'short',
			},
		},
  
  
		// --- Footer ---
		footer: {
			message: 'Mockly-VSC is released under the MIT License.',
			copyright: `Copyright © ${new Date().getFullYear()} FocusTorn / New Reality Designs`, // Replace
		},
  
		// --- Search (Optional - Algolia DocSearch) ---
		// You need to apply for DocSearch and get credentials
		// algolia: {
		//   appId: 'YOUR_ALGOLIA_APP_ID',
		//   apiKey: 'YOUR_ALGOLIA_API_KEY',
		//   indexName: 'mockly-vsc' // Or your chosen index name
		// },
  
		// --- Carbon Ads (Optional) ---
		// carbonAds: {
		//   code: 'YOUR_CARBON_CODE',
		//   placement: 'YOUR_CARBON_PLACEMENT'
		// }
	},
  
	// --- Markdown Processing ---
	markdown: {
		lineNumbers: true, // Show line numbers in code blocks
		// Optional: Configure markdown-it plugins if needed
		// config: (md) => {
		//   md.use(require('markdown-it-attrs')); // Example plugin
		// }
	},
  
	// --- Vite Specific Configurations (if needed) ---
	// vite: {
	//   // Vite config options
	// }
}
