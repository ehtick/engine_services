import { Command } from 'commander';
import { writeConfig } from '../lib/config';
import { EngineServicesClient } from '../../core/client';

export const loginCommand = new Command('login')
  .description('Authenticate with the ThatOpen platform')
  .requiredOption('--token <token>', 'Access token from the dashboard')
  .option(
    '--api-url <url>',
    'API URL',
    'https://dev.api.thatopen.com',
  )
  .action(async (opts: { token: string; apiUrl: string }) => {
    const apiUrl = opts.apiUrl.replace(/\/$/, '');

    console.log('Validating token...');

    try {
      const client = new EngineServicesClient(opts.token, apiUrl);
      await client.listApps();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Token validation failed: ${msg}`);
      console.error('Check your token and API URL.');
      process.exit(1);
    }

    writeConfig({ accessToken: opts.token, apiUrl });
    console.log('Logged in successfully. Config saved to ~/.thatopen/config.json');
  });
