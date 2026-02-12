import { Command } from 'commander';
import { loginCommand } from './commands/login';
import { createCommand } from './commands/create';
import { publishCommand } from './commands/publish';
import { devCommand } from './commands/dev';

const program = new Command();

program
  .name('thatopen')
  .description('CLI for ThatOpen Engine Services')
  .version('0.6.1');

program.addCommand(loginCommand);
program.addCommand(createCommand);
program.addCommand(publishCommand);
program.addCommand(devCommand);

program.parse(process.argv);
