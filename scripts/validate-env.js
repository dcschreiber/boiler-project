#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load environment variables
const envPath = join(rootDir, '.env.local');
if (!existsSync(envPath)) {
  console.error(chalk.red('❌ .env.local file not found!'));
  console.log(chalk.yellow('Please create .env.local from .env.example and fill in your values.'));
  process.exit(1);
}

config({ path: envPath });

const validations = {
  SUPABASE_URL: {
    required: true,
    validate: (value) => {
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        return 'Must be a valid Supabase URL (https://xxx.supabase.co)';
      }
      return true;
    }
  },
  SUPABASE_ANON_KEY: {
    required: true,
    validate: (value) => {
      if (value.length < 100) {
        return 'Invalid Supabase anon key';
      }
      return true;
    }
  },
  SUPABASE_SERVICE_KEY: {
    required: true,
    validate: (value) => {
      if (value.length < 100) {
        return 'Invalid Supabase service key';
      }
      return true;
    }
  },
  GOOGLE_CLIENT_ID: {
    required: true,
    validate: (value) => {
      if (!value.endsWith('.apps.googleusercontent.com')) {
        return 'Invalid Google Client ID format';
      }
      return true;
    }
  },
  GOOGLE_CLIENT_SECRET: {
    required: true,
    validate: (value) => {
      if (value.length < 20) {
        return 'Invalid Google Client Secret';
      }
      return true;
    }
  },
  ADMIN_EMAIL: {
    required: true,
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email format';
      }
      return true;
    }
  },
  JWT_SECRET: {
    required: true,
    validate: (value) => {
      if (value.length < 32) {
        return 'JWT secret should be at least 32 characters';
      }
      return true;
    }
  },
  WHITELIST_MODE: {
    required: false,
    validate: (value) => {
      if (value && !['true', 'false'].includes(value)) {
        return 'Must be either "true" or "false"';
      }
      return true;
    }
  },
  STRIPE_ENABLED: {
    required: false,
    validate: (value) => {
      if (value && !['true', 'false'].includes(value)) {
        return 'Must be either "true" or "false"';
      }
      return true;
    }
  },
  STRIPE_SECRET_KEY: {
    required: false,
    validate: (value, allValues) => {
      if (allValues.STRIPE_ENABLED === 'true' && !value) {
        return 'Required when STRIPE_ENABLED is true';
      }
      if (value && !value.startsWith('sk_')) {
        return 'Invalid Stripe secret key format';
      }
      return true;
    }
  },
  STRIPE_PUBLISHABLE_KEY: {
    required: false,
    validate: (value, allValues) => {
      if (allValues.STRIPE_ENABLED === 'true' && !value) {
        return 'Required when STRIPE_ENABLED is true';
      }
      if (value && !value.startsWith('pk_')) {
        return 'Invalid Stripe publishable key format';
      }
      return true;
    }
  }
};

console.log(chalk.bold.blue('🔍 Validating environment variables...\n'));

let hasErrors = false;
const allValues = { ...process.env };

Object.entries(validations).forEach(([key, config]) => {
  const value = process.env[key];
  
  if (config.required && !value) {
    console.log(chalk.red(`❌ ${key}: Missing required variable`));
    hasErrors = true;
    return;
  }
  
  if (value && config.validate) {
    const result = config.validate(value, allValues);
    if (result !== true) {
      console.log(chalk.red(`❌ ${key}: ${result}`));
      hasErrors = true;
    } else {
      console.log(chalk.green(`✅ ${key}: Valid`));
    }
  } else if (!config.required && !value) {
    console.log(chalk.gray(`⏭️  ${key}: Optional (not set)`));
  }
});

console.log('');

if (hasErrors) {
  console.log(chalk.red.bold('❌ Validation failed! Please fix the errors above.'));
  process.exit(1);
} else {
  console.log(chalk.green.bold('✅ All environment variables are valid!'));
  
  // Check for warnings
  if (process.env.STRIPE_ENABLED !== 'true') {
    console.log(chalk.yellow('\n⚠️  Stripe is disabled. Payment features won\'t be available.'));
  }
  
  if (!process.env.GOOGLE_ANALYTICS_ID) {
    console.log(chalk.yellow('⚠️  Google Analytics is not configured.'));
  }
  
  if (!process.env.SENTRY_DSN) {
    console.log(chalk.yellow('⚠️  Sentry error tracking is not configured.'));
  }
}