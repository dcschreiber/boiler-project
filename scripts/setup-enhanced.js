#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { config } from 'dotenv';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log(chalk.bold.blue(`
🚀 SaaS Boilerplate Enhanced Setup
==================================
`));

// Check if prerequisites are installed
async function checkPrerequisites() {
  const spinner = ora('Checking prerequisites...').start();
  
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (majorVersion < 18) {
      spinner.fail(`Node.js version ${nodeVersion} is too old. Version 18+ required.`);
      console.log(chalk.yellow('\nPlease run: bash scripts/install-prerequisites.sh'));
      process.exit(1);
    }
    
    // Check Docker
    try {
      execSync('docker --version', { stdio: 'ignore' });
      execSync('docker info', { stdio: 'ignore' });
    } catch (error) {
      spinner.fail('Docker is not installed or not running');
      console.log(chalk.yellow('\nPlease run: bash scripts/install-prerequisites.sh'));
      console.log(chalk.yellow('Then start Docker Desktop'));
      process.exit(1);
    }
    
    spinner.succeed('Prerequisites checked');
  } catch (error) {
    spinner.fail('Failed to check prerequisites');
    throw error;
  }
}

// Create .env.local file if it doesn't exist
async function createEnvLocal() {
  const envPath = join(rootDir, '.env.local');
  
  if (!existsSync(envPath)) {
    const spinner = ora('Creating .env.local file...').start();
    
    // Generate a secure JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('base64');
    
    const envTemplate = `# Supabase Configuration (from Step 1)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Google OAuth (from Step 2)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Admin Configuration
ADMIN_EMAIL=
WHITELIST_MODE=false

# Security (auto-generated)
JWT_SECRET=${jwtSecret}

# Application
APP_NAME=My Awesome SaaS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Stripe Configuration
STRIPE_ENABLED=false
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=

# Optional: Analytics & Monitoring
GOOGLE_ANALYTICS_ID=
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
`;
    
    writeFileSync(envPath, envTemplate);
    spinner.succeed('.env.local created with auto-generated JWT secret');
    
    console.log(chalk.yellow('\n⚠️  Important: You need to fill in your Supabase and Google OAuth credentials'));
    console.log(chalk.yellow('Please complete SETUP_HUMAN_TASKS.md for detailed instructions\n'));
    
    return false; // Indicates setup is incomplete
  }
  
  return true; // .env.local already exists
}



// Create environment files for frontend and backend
async function createEnvFiles() {
  const spinner = ora('Creating environment files...').start();

  // Frontend .env
  const frontendEnv = `
VITE_SUPABASE_URL=${process.env.SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}
VITE_GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}
VITE_APP_URL=${process.env.APP_URL || 'http://localhost:5173'}
VITE_API_URL=${process.env.API_URL || 'http://localhost:8000'}
VITE_STRIPE_ENABLED=${process.env.STRIPE_ENABLED || 'false'}
VITE_STRIPE_PUBLISHABLE_KEY=${process.env.STRIPE_PUBLISHABLE_KEY || ''}
VITE_GOOGLE_ANALYTICS_ID=${process.env.GOOGLE_ANALYTICS_ID || ''}
VITE_SENTRY_DSN=${process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN || ''}
`.trim();

  writeFileSync(join(rootDir, 'frontend', '.env'), frontendEnv);

  // Backend .env
  const backendEnv = `
SUPABASE_URL=${process.env.SUPABASE_URL}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${process.env.SUPABASE_SERVICE_KEY}
GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET}
ADMIN_EMAIL=${process.env.ADMIN_EMAIL}
WHITELIST_MODE=${process.env.WHITELIST_MODE || 'false'}
JWT_SECRET=${process.env.JWT_SECRET}
CORS_ORIGINS=${process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000'}
STRIPE_ENABLED=${process.env.STRIPE_ENABLED || 'false'}
STRIPE_SECRET_KEY=${process.env.STRIPE_SECRET_KEY || ''}
STRIPE_WEBHOOK_SECRET=${process.env.STRIPE_WEBHOOK_SECRET || ''}
SENTRY_DSN=${process.env.SENTRY_DSN || ''}
`.trim();

  writeFileSync(join(rootDir, 'backend', '.env'), backendEnv);

  spinner.succeed('Environment files created');
}

// Setup Git hooks
async function setupGitHooks() {
  const spinner = ora('Setting up Git hooks...').start();

  try {
    // Create .husky directory and pre-commit hook
    const huskyDir = join(rootDir, '.husky');
    if (!existsSync(huskyDir)) {
      execSync('npx husky install', { cwd: rootDir });
      
      const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
      writeFileSync(join(huskyDir, 'pre-commit'), preCommitHook, { mode: 0o755 });
    }
    spinner.succeed('Git hooks configured');
  } catch (error) {
    spinner.warn('Git hooks setup skipped (not a git repository)');
  }
}

// Install dependencies
async function installDependencies() {
  const spinner = ora('Installing dependencies...').start();
  
  try {
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    console.log(chalk.yellow('Please run "npm install" manually'));
  }
}

// Check Python dependencies
async function checkPythonDependencies() {
  const spinner = ora('Checking Python dependencies...').start();
  
  try {
    // Check if Python 3.11+ is available
    const pythonVersion = execSync('python3 --version', { encoding: 'utf-8' }).trim();
    const versionMatch = pythonVersion.match(/Python (\d+)\.(\d+)/);
    
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      const minor = parseInt(versionMatch[2]);
      
      if (major < 3 || (major === 3 && minor < 11)) {
        spinner.warn(`Python ${major}.${minor} found. Python 3.11+ recommended.`);
        console.log(chalk.yellow('Run: bash scripts/install-prerequisites.sh to install via pyenv'));
      } else {
        spinner.succeed(`Python ${major}.${minor} found`);
      }
    }
  } catch (error) {
    spinner.warn('Python not found. It will be installed when you run Docker.');
  }
}

// Main function
async function main() {
  try {
    // Check prerequisites first
    await checkPrerequisites();
    
    // Create .env.local if needed
    const envExists = await createEnvLocal();
    if (!envExists) {
      console.log(chalk.cyan('\n📝 Created .env.local file with secure defaults'));
    }
    
    // Create env files for frontend and backend
    await createEnvFiles();
    
    // Setup git hooks
    await setupGitHooks();
    
    // Install dependencies
    await installDependencies();
    
    // Check Python
    await checkPythonDependencies();

    console.log(chalk.green.bold(`
🎉 Setup Complete!
==================

Your project structure is now ready!

Next steps:
1. ${chalk.yellow('Fill in your credentials')} in ${chalk.cyan('.env.local')}:
   • Supabase URL, anon key, and service key
   • Google OAuth Client ID and Client Secret  
   • Your admin email address

2. Run ${chalk.cyan('npm run validate-env')} to check your configuration

3. Run ${chalk.cyan('npm run dev')} to start the development servers

4. Visit ${chalk.cyan('http://localhost:5173')} to see your app

📋 Need help getting credentials?
   See ${chalk.cyan('SETUP_HUMAN_TASKS.md')} for step-by-step instructions

📍 Your app will be available at:
   • Frontend: ${chalk.cyan('http://localhost:5173')}
   • Backend API: ${chalk.cyan('http://localhost:8000')}
   • API Documentation: ${chalk.cyan('http://localhost:8000/api/docs')}

🚀 Optional next steps:
   • Set up Stripe payments
   • Configure analytics and monitoring
   • Customize your app name and branding

Happy coding! 🎉
`));
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error);
    console.log(chalk.yellow('\n💡 If you need help, check SETUP_HUMAN_TASKS.md for detailed instructions.'));
    process.exit(1);
  }
}

main();