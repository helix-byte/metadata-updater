# AGENTS.md - obsidian-metadata-updater

This document provides guidelines for AI agents working on the obsidian-metadata-updater codebase.

## Project Overview

Obsidian plugin that automatically extracts keywords from LLM conversation content and generates hierarchical tags with UTC timestamps. Built with TypeScript, uses esbuild for bundling, and integrates with Ollama for local LLM-powered keyword extraction.

## Build Commands

```bash
# Development mode (watch mode, hot reload)
npm run dev

# Production build (runs type check + esbuild)
npm run build

# Type check only
tsc -noEmit -skipLibCheck

# Version bump
npm run version
```

**Note:** This project has no automated tests. Manual testing in Obsidian is required after changes.

## Code Style Guidelines

### TypeScript Configuration

- Target: ES6
- Module: ESNext
- Strict mode enabled (`strictNullChecks: true`, `noImplicitAny: true`)
- Use explicit types for all function parameters and return values
- Avoid `any` type; use `unknown` or proper type definitions instead

### Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Classes | PascalCase | `MetadataUpdaterPlugin`, `OllamaExtractor` |
| Interfaces | PascalCase | `MetadataUpdaterSettings`, `ExtractionResult` |
| Functions | camelCase | `extractKeywordsAndTags`, `loadSettings` |
| Variables | camelCase | `statusBarItemEl`, `customConfigs` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_SETTINGS`, `TECH_KEYWORDS` |
| Settings fields | camelCase | Inside `MetadataUpdaterSettings` interface |

### Imports

```typescript
// 1. Obsidian API imports first
import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, Modal } from 'obsidian';

// 2. Local imports (relative paths, alphabetized)
import { extractKeywordsAndTags } from './metadataExtractor';
import { parseKeywordConfig } from './keywordConfigParser';
```

### Formatting

- **Indentation:** Tabs (EditorConfig: `indent_style = tab`, `indent_size = 4`)
- **Line endings:** LF (Unix-style)
- **Final newline:** Required
- **Character encoding:** UTF-8
- **Line length:** No strict limit, use reasonable wrap points

### Error Handling

```typescript
// Wrap async operations in try-catch
async function example(): Promise<void> {
    try {
        // async operation
    } catch (error) {
        console.error('Operation failed:', error);
        new Notice(`操作失败: ${error}`);
    }
}

// For recoverable errors, provide fallback behavior
const result = primaryMethod() ?? fallbackMethod();
```

### Obsidian Plugin Patterns

- Extend `Plugin` class, implement `onload()` and `onunload()`
- Use `addCommand()` for plugin commands with `checkCallback` for conditional availability
- Use `addSettingTab()` for settings UI
- Use `Notice` for user feedback (success/error)
- Use `console.log`/`console.error` for debugging

### Async/Await

- All file I/O and API calls must be async
- Never use `.then()` chains; prefer `async/await`
- Handle promises explicitly, avoid unawaited async calls

### Module Structure

- Main plugin logic in `main.ts`
- Dedicated modules for specific features:
  - `metadataExtractor.ts` - Rule-based keyword extraction
  - `llmExtractor.ts` - LLM-powered extraction with hybrid manager
  - `keywordConfigParser.ts` - Configuration file parsing
  - `filenameGenerator.ts` - (if exists) Filename utilities

### UI Components

- Use Obsidian's `Setting` class for settings UI
- Use `Modal` subclasses for complex dialogs
- Use `TextAreaComponent` for multi-line input
- Use `ButtonComponent` for actions with `setCta()` for primary actions

### Configuration

- Use `DEFAULT_SETTINGS` constant for default values
- Load settings with `Object.assign({}, DEFAULT_SETTINGS, await this.loadData())`
- Save settings with `await this.saveData(this.settings)`

### Frontmatter Handling

- Parse YAML frontmatter with regex: `/^---\n([\s\S]*?)\n---\n/`
- Use `updateMetadata()` function from `metadataExtractor.ts` for frontmatter updates
- Always preserve existing frontmatter fields when updating

### LLM Integration (Ollama)

- API endpoint: `/api/generate` for text generation
- API endpoint: `/api/tags` for availability check
- Use `stream: false` for synchronous responses
- Set `temperature: 0.3` for consistent outputs
- Parse JSON from response text with regex match

## ESLint Configuration

The project uses `@typescript-eslint` with these rules:
- Unused variables: Error (args: none)
- Empty functions: Allowed
- Type assertions: Allowed with `@ts-ignore` or `as any` when necessary

Run linting:
```bash
npx eslint main.ts metadataExtractor.ts llmExtractor.ts
```

## Release Process

1. Increment version in `package.json`
2. Run `npm run build`
3. Copy `main.js`, `styles.css`, `manifest.json` to plugin directory
4. Test manually in Obsidian
5. Create release artifacts with `prepare-release.bat` or `prepare-release.sh`
