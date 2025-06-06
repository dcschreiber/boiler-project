#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log(chalk.blue('\n📦 Running post-install setup...\n'));

// Check if .env.local exists
const envLocalPath = join(rootDir, '.env.local');
if (!existsSync(envLocalPath)) {
  console.log(chalk.yellow('📝 Creating .env.local from .env.example...'));
  
  const envExamplePath = join(rootDir, '.env.example');
  if (existsSync(envExamplePath)) {
    const envContent = readFileSync(envExamplePath, 'utf-8');
    writeFileSync(envLocalPath, envContent);
    console.log(chalk.green('✅ Created .env.local'));
    console.log(chalk.yellow('\n⚠️  Please edit .env.local with your actual values!'));
  }
}

// Check if this is first time setup
const setupCompleteMarker = join(rootDir, '.setup-complete');
if (!existsSync(setupCompleteMarker)) {
  console.log(chalk.bold.cyan(`
🎉 Welcome to SaaS Boilerplate!
================================

To get started:

1. ${chalk.yellow('Read SETUP_HUMAN_TASKS.md')} for step-by-step setup instructions
2. ${chalk.yellow('Edit .env.local')} with your Supabase and Google OAuth credentials
3. ${chalk.yellow('Run npm run setup')} to validate and complete the setup
4. ${chalk.yellow('Run npm run dev')} to start developing!

Happy coding! 🚀
`));
} else {
  console.log(chalk.green('✅ Dependencies installed successfully!\n'));
}