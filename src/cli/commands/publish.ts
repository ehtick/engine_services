import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execSync } from 'node:child_process';
import {
  requireResolvedConfig,
  readLocalConfig,
  updateLocalConfig,
} from '../lib/config';
import { createBundleZip } from '../lib/zip';
import { EngineServicesClient } from '../../core/client';

export const publishCommand = new Command('publish')
  .description('Build and publish the app to the ThatOpen platform')
  .option('--name <name>', 'App name (defaults to package.json name)')
  .option(
    '--version-tag <tag>',
    'Version tag (defaults to package.json version)',
  )
  .option('--app-id <id>', 'Existing app ID to publish a new version for')
  .option('--skip-build', 'Skip the build step')
  .action(
    async (opts: {
      name?: string;
      versionTag?: string;
      appId?: string;
      skipBuild?: boolean;
    }) => {
      const cwd = process.cwd();
      const config = requireResolvedConfig(cwd);

      // Resolve appId: CLI flag > local config > none (new app)
      const localConfig = readLocalConfig(cwd);
      const appId = opts.appId || localConfig?.appId;

      // Read project package.json
      const pkgPath = join(cwd, 'package.json');
      if (!existsSync(pkgPath)) {
        console.error(
          'No package.json found. Run this from a ThatOpen app project.',
        );
        process.exit(1);
      }
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const appName = opts.name || pkg.name || basename(cwd);
      const versionTag = opts.versionTag || pkg.version || '1.0.0';

      // Build
      if (!opts.skipBuild) {
        console.log('Building...');
        execSync('npm run build', { cwd, stdio: 'inherit' });
      }

      // Check build output
      const bundlePath = join(cwd, 'dist', 'bundle.js');
      if (!existsSync(bundlePath)) {
        console.error(
          'Build output not found at dist/bundle.js. Make sure your vite.config outputs dist/bundle.js.',
        );
        process.exit(1);
      }

      // Create ZIP
      const zipPath = join(cwd, 'dist', 'bundle.zip');
      console.log('Creating bundle ZIP...');
      await createBundleZip(bundlePath, zipPath);

      // Read ZIP as Blob for the client
      const zipBuffer = readFileSync(zipPath);
      const zipBlob = new Blob([zipBuffer]);

      // Upload
      const client = new EngineServicesClient(
        config.accessToken,
        config.apiUrl,
      );

      if (appId) {
        console.log(
          `Publishing new version (${versionTag}) for app ${appId}...`,
        );
        const result = await client.createVersion(
          appId,
          zipBlob,
          versionTag,
          {}, // extraProps required by backend for APP items
        );
        console.log('Version created:', JSON.stringify(result, null, 2));
      } else {
        console.log(`Publishing new app "${appName}" (${versionTag})...`);
        const result = await client.createApp({
          file: zipBlob,
          name: appName,
          versionTag,
        });
        console.log('App created:', JSON.stringify(result, null, 2));

        // Auto-save appId to local config for future updates
        const newAppId = result.item?._id;
        if (newAppId) {
          updateLocalConfig({ appId: String(newAppId) }, cwd);
          console.log(`App ID saved to .thatopen (${newAppId})`);
        }
      }

      console.log('Published successfully!');
    },
  );
