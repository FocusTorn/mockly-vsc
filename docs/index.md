---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Mockly-VSC"
  text: "VSCode API Mocking for Vitest"
  tagline: Test your VSCode extensions with a comprehensive, in-memory simulation of the VSCode API. Designed for ease of use and reliability within your Vitest testing environment.
  
  #= Logo =================================================== 
  # image:
  #   src: /logo.svg 
  #   alt: Mockly-VSC Logo
  
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/FocusTorn/mockly-vsc
    - theme: alt
      text: API Reference
      link: /api-reference/workspace

features:
  - icon: 💡
    title: Comprehensive API Mocking
    details: Faithfully simulates `vscode.workspace`, `vscode.window`, `vscode.commands`, `vscode.env`, and `vscode.extensions`, providing a realistic testing ground.
  - icon: 📦
    title: Node.js Utilities
    details: Includes mocks for Node.js `path` and `fs` modules (`mockly.node.path`, `mockly.node.fs`) for testing extensions that use them directly.
  - icon: 🛠️
    title: Realistic Editor Simulation
    details: Features an in-memory file system with easy population (`vscodeSimulator.vfs.populateSync`), full text document and editor lifecycle management, and accurate event simulation.
  - icon: 🎮
    title: Robust Test Control
    details: Easily manage and reset the mock environment's state between tests using `vscodeSimulator.reset()` for perfect test isolation.
  - icon: 💬
    title: Interactive Element Mocking
    details: Simulate user inputs (quick picks, input boxes), messages, terminals, and output channels with fine-grained control over responses.
  - icon: 🧱
    title: Core VSCode Types
    details: Provides mock implementations for essential VSCode types like `Uri`, `Position`, `Range`, `Selection`, `Disposable`, and `EventEmitter`.
  - icon: ⚡️
    title: TypeScript First & Vitest Ready
    details: Built with TypeScript for strong typing and seamless integration with the Vitest testing framework.


#= Selling points =========================================== 
# ## Why Mockly-VSC?
#
# Testing VSCode extensions can be complex...
---