import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getIndexHtml } from '../templates/index-html';
import { getMainTs } from '../templates/main-js';
import { getMainBim } from '../templates/main-bim';
import { getViteConfig } from '../templates/vite-config';
import { getPackageJson } from '../templates/package-json';

const TEMPLATES = ['default', 'bim'] as const;
type Template = (typeof TEMPLATES)[number];

export const createCommand = new Command('create')
  .argument('<app-name>', 'Name of the app to create')
  .option('-t, --template <template>', `App template (${TEMPLATES.join(', ')})`, 'bim')
  .description('Scaffold a new ThatOpen app project')
  .action(async (appName: string, opts: { template: string }) => {
    const template = opts.template as Template;

    if (!TEMPLATES.includes(template)) {
      console.error(`Unknown template "${opts.template}". Available: ${TEMPLATES.join(', ')}`);
      process.exit(1);
    }

    const targetDir = resolve(process.cwd(), appName);

    if (existsSync(targetDir)) {
      console.error(`Directory "${appName}" already exists.`);
      process.exit(1);
    }

    console.log(`Creating ThatOpen app "${appName}" (template: ${template})...`);

    mkdirSync(targetDir, { recursive: true });
    mkdirSync(join(targetDir, 'src'));

    writeFileSync(join(targetDir, 'index.html'), getIndexHtml());
    writeFileSync(
      join(targetDir, 'src', 'main.ts'),
      template === 'bim' ? getMainBim() : getMainTs(),
    );
    writeFileSync(join(targetDir, 'vite.config.js'), getViteConfig());
    writeFileSync(join(targetDir, 'package.json'), getPackageJson(appName, template));
    writeFileSync(
      join(targetDir, '.gitignore'),
      'node_modules\ndist\n*.zip\n.thatopen\n',
    );

    console.log('');
    console.log(`  Created ./${appName}`);
    console.log('');
    console.log('  Next steps:');
    console.log(`    cd ${appName}`);
    console.log('    npm install');
    console.log('    npm run dev                          # Start local dev server');
    console.log('    npm run login -- --token <token>     # Authenticate');
    console.log('    npm run publish                      # First publish (saves app ID)');
    console.log('    npm run update                       # Publish new version');
    console.log('');
  });
