import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI(): Promise<boolean> {
  console.log(
    'Step 1: Checking if Stripe CLI is installed and authenticated...'
  );
  try {
    await execAsync('stripe --version');
    console.log('Stripe CLI is installed.');

    try {
      await execAsync('stripe config --list');
      console.log('Stripe CLI is authenticated.');
      return true;
    } catch (error) {
      console.log(
        'Stripe CLI is not authenticated or the authentication has expired.'
      );
      console.log('Please run: stripe login');
      const answer = await question(
        'Have you completed the authentication? (y/n): '
      );
      if (answer.toLowerCase() !== 'y') {
        console.warn(
          'Skipping Stripe CLI setup. You can set STRIPE_WEBHOOK_SECRET manually in .env later.'
        );
        return false;
      }

      try {
        await execAsync('stripe config --list');
        console.log('Stripe CLI authentication confirmed.');
        return true;
      } catch (error) {
        console.warn(
          'Failed to verify Stripe CLI authentication. Skipping webhook secret generation.'
        );
        return false;
      }
    }
  } catch (error) {
    console.warn(
      'Stripe CLI is not installed. Skipping webhook secret generation.'
    );
    console.log('To install Stripe CLI later, visit: https://docs.stripe.com/stripe-cli');
    return false;
  }
}

async function getPostgresURL(): Promise<string> {
  console.log('Step 2: Setting up Postgres');
  const dbChoice = await question(
    'Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): '
  );

  if (dbChoice.toLowerCase() === 'l') {
    console.log('Setting up local Postgres instance with Docker...');
    await setupLocalPostgres();
    return 'postgres://postgres:postgres@localhost:54322/postgres';
  } else {
    console.log(
      'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
    );
    return await question('Enter your POSTGRES_URL: ');
  }
}

async function setupLocalPostgres() {
  console.log('Checking if Docker is installed...');
  try {
    await execAsync('docker --version');
    console.log('Docker is installed.');
  } catch (error) {
    console.error(
      'Docker is not installed. Please install Docker and try again.'
    );
    console.log(
      'To install Docker, visit: https://docs.docker.com/get-docker/'
    );
    process.exit(1);
  }

  const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
  try {
    await fs.access(dockerComposePath);
    const overwrite = await question(
      'docker-compose.yml already exists. Overwrite? (y/n): '
    );
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Keeping existing docker-compose.yml.');
      return;
    }
  } catch {
    // File doesn't exist, proceed
  }

  console.log('Creating docker-compose.yml file...');
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(dockerComposePath, dockerComposeContent);
  console.log('docker-compose.yml file created.');

  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
    console.log('Docker container started successfully.');
  } catch (error) {
    console.error(
      'Failed to start Docker container. Please check your Docker installation and try again.'
    );
    process.exit(1);
  }
}

async function getStripeSecretKey(): Promise<string> {
  console.log('Step 3: Getting Stripe Secret Key');
  console.log(
    'You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys'
  );
  return await question('Enter your Stripe Secret Key: ');
}

async function createStripeWebhook(): Promise<string> {
  console.log('Step 4: Creating Stripe webhook...');
  try {
    const { stdout } = await execAsync('stripe listen --print-secret');
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error('Failed to extract Stripe webhook secret');
    }
    console.log('Stripe webhook created.');
    return match[0];
  } catch (error) {
    console.error(
      'Failed to create Stripe webhook. Check your Stripe CLI installation and permissions.'
    );
    if (os.platform() === 'win32') {
      console.log(
        'Note: On Windows, you may need to run this script as an administrator.'
      );
    }
    throw error;
  }
}

function generateAuthSecret(): string {
  console.log('Step 5: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 6: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.join(process.cwd(), '.env');

  try {
    await fs.access(envPath);
    // .env already exists — write to .env.generated instead
    const generatedPath = path.join(process.cwd(), '.env.generated');
    await fs.writeFile(generatedPath, envContent);
    console.warn(
      '.env already exists. Generated values written to .env.generated — merge manually.'
    );
  } catch {
    // .env doesn't exist, safe to write
    await fs.writeFile(envPath, envContent);
    console.log('.env file created with the necessary variables.');
  }
}

async function main() {
  const hasStripeCLI = await checkStripeCLI();

  const POSTGRES_URL = await getPostgresURL();
  const STRIPE_SECRET_KEY = await getStripeSecretKey();

  let STRIPE_WEBHOOK_SECRET = '';
  if (hasStripeCLI) {
    STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  }

  const BASE_URL = 'http://localhost:3000';
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    POSTGRES_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
    AUTH_SECRET,
    RESEND_API_KEY: '',
    EMAIL_FROM: '',
  });

  console.log('Setup completed successfully. Next: run pnpm db:migrate then pnpm db:seed.');
}

main().catch(console.error);
