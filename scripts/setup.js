#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { config } from 'dotenv';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load environment variables
config({ path: join(rootDir, '.env.local') });

console.log(chalk.bold.blue(`
🚀 SaaS Boilerplate Setup
========================
`));

async function checkEnvironmentVariables() {
  const spinner = ora('Checking environment variables...').start();
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'ADMIN_EMAIL',
    'JWT_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    spinner.fail('Missing required environment variables');
    console.log(chalk.red('\nMissing variables:'));
    missingVars.forEach(varName => {
      console.log(chalk.red(`  - ${varName}`));
    });
    console.log(chalk.yellow('\nPlease complete SETUP_HUMAN_TASKS.md first!'));
    process.exit(1);
  }

  spinner.succeed('All required environment variables are set');
}

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
VITE_SENTRY_DSN=${process.env.SENTRY_DSN || ''}
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

async function setupDatabase() {
  const spinner = ora('Setting up database...').start();
  
  try {
    // Check if Python and required packages are available
    try {
      execSync('python3 --version', { stdio: 'pipe' });
    } catch {
      spinner.fail('Python 3 is required for database setup');
      console.log(chalk.yellow('Please install Python 3 and run the setup again'));
      return false;
    }

    // Install required Python packages
    spinner.text = 'Installing Python dependencies...';
    try {
      execSync('pip install supabase python-dotenv requests', { 
        stdio: 'pipe',
        cwd: rootDir 
      });
    } catch (error) {
      spinner.warn('Could not install Python packages automatically');
      console.log(chalk.yellow('Please run: pip install supabase python-dotenv requests'));
    }

    // Run database setup
    spinner.text = 'Setting up database tables...';
    try {
      const setupOutput = execSync('python3 scripts/setup-database.py', { 
        cwd: rootDir,
        encoding: 'utf8'
      });
      
      if (setupOutput.includes('✅ Database setup completed successfully')) {
        spinner.succeed('Database setup completed');
        return true;
      } else {
        spinner.warn('Database setup needs manual intervention');
        console.log(chalk.yellow('\nDatabase setup output:'));
        console.log(setupOutput);
        return false;
      }
    } catch (error) {
      spinner.warn('Database setup encountered issues');
      console.log(chalk.yellow('\nDatabase setup output:'));
      console.log(error.stdout || error.message);
      console.log(chalk.yellow('\nThe application will still work with basic authentication.'));
      console.log(chalk.yellow('Run "python3 scripts/setup-database.py" manually to complete setup.'));
      return false;
    }
  } catch (error) {
    spinner.fail('Database setup failed');
    console.log(chalk.red('Error:', error.message));
    return false;
  }
}

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

async function main() {
  try {
    await checkEnvironmentVariables();
    await createEnvFiles();
    await setupGitHooks();
    await installDependencies();
    
    const databaseSetupSuccess = await setupDatabase();

    console.log(chalk.green.bold(`
✅ Setup Complete!
==================

Next steps:
1. ${databaseSetupSuccess ? '' : 'Complete database setup (see output above), then '}Run ${chalk.cyan('npm run dev')} to start the development servers
2. Visit ${chalk.cyan('http://localhost:5173')} to see your app
3. Sign up with the admin email: ${chalk.cyan(process.env.ADMIN_EMAIL)}

${databaseSetupSuccess ? '' : chalk.yellow('Note: Database setup needs completion. Check the output above for instructions.\n')}
API Documentation: ${chalk.cyan('http://localhost:8000/api/docs')}

Optional:
- Set up Stripe (see SETUP_HUMAN_TASKS.md)
- Configure custom domain
- Set up analytics

Happy coding! 🎉
`));
  } catch (error) {
    console.error(chalk.red('Setup failed:'), error);
    process.exit(1);
  }
}

main();