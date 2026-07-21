import { Command } from 'commander';
import { requireResolvedConfig } from '../lib/config';
import { callAddin, configureAddin } from '../lib/revit-addin';

/**
 * `thatopen revit ...` — Revit collaboration commands. They drive the local
 * That Open Revit add-in (BT3): publish a shared central, join one, and sync.
 * Auth comes from `thatopen login` (~/.thatopen/config.json) and is forwarded to
 * the add-in, so the user never re-enters a token here.
 */
export const revitCommand = new Command('revit').description(
  'Revit collaboration — drive the That Open Revit add-in from the CLI',
);

async function connect() {
  const cfg = requireResolvedConfig();
  await configureAddin(cfg.apiUrl, cfg.accessToken);
  return cfg;
}

revitCommand
  .command('status')
  .description('Show the add-in status and the current project / central')
  .action(async () => {
    await connect();
    const r = await callAddin('status');
    console.log(JSON.stringify(r, null, 2));
  });

revitCommand
  .command('publish-central')
  .description('Turn a .rvt into a shared central and upload it to a project')
  .requiredOption('--project <id>', 'Platform project id')
  .requiredOption('--doc <name>', 'A short name for this central (e.g. tower-central)')
  .requiredOption('--file <path>', 'Absolute path to the source .rvt on this machine')
  .action(async (opts: { project: string; doc: string; file: string }) => {
    await connect();
    console.log(`Publishing "${opts.file}" as central "${opts.doc}"...`);
    console.log('(Revit is enabling worksharing and saving the central — this can take a bit.)');
    const r = await callAddin('publish-central', {
      project: opts.project,
      doc: opts.doc,
      file: opts.file,
    });
    console.log(`Published. Central: ${r.central} (version ${r.version}).`);
    console.log(`Collaborators can now join with:`);
    console.log(`  thatopen revit join --project ${opts.project} --doc ${opts.doc}`);
  });

revitCommand
  .command('join')
  .description('Download a shared central and create + open your local in Revit')
  .requiredOption('--project <id>', 'Platform project id')
  .requiredOption('--doc <name>', 'The central name to join (from whoever published it)')
  .action(async (opts: { project: string; doc: string }) => {
    await connect();
    console.log(`Joining "${opts.doc}"...`);
    const r = await callAddin('join', { project: opts.project, doc: opts.doc });
    console.log(`Joined. Your local was created and opened in Revit:`);
    console.log(`  ${r.local}`);
    console.log(`Model as usual, then run "thatopen revit sync" (or the "Sync to team" button).`);
  });

revitCommand
  .command('sync')
  .description('Synchronize your local with the team (queued, no divergence)')
  .action(async () => {
    await connect();
    console.log('Syncing with the team...');
    const r = await callAddin('sync');
    console.log(`Synced.  v${r.verB} → v${r.verA}.`);
  });
