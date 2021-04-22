import commander, { program } from 'commander';

export interface Options {
  truncate: boolean;
  populate: number;
}

const parseIntOption = (value: string) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) throw new commander.InvalidOptionArgumentError('Not a number.');
  return parsed;
};

export const parseOptions = (): Options => {
  program.option('--truncate', 'truncate tables', false);
  program.option('--populate <M records>', 'populate tables with random M million records', parseIntOption);
  program.parse();
  return program.opts() as Options;
};
