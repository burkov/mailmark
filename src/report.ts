import chalk from 'chalk';
import knex, { Knex } from 'knex';
import { mysql, pg } from './init-connection';

export enum ReportType {
  OK = 'OK',
  FAILURE = 'FAIL',
  SKIP = 'SKIP',
}

const ppType = (type: ReportType) =>
  ({
    [ReportType.OK]: chalk.green(' OK '),
    [ReportType.FAILURE]: chalk.red('FAIL'),
    [ReportType.SKIP]: chalk.yellow('SKIP'),
  }[type]);

const ppKnex = (knex?: Knex) => {
  if (!knex) return ' [ ALL ]';
  if (knex === pg) return ` [${chalk.blue('PGRES')}]`;
  if (knex === mysql) return ` [${chalk.magenta('MYSQL')}]`;
  throw new Error('unknown knex instance');
};

const reportInternal = (knex: Knex | undefined, type: ReportType, msg: string) => {
  console.log(`${ppType(type)}${ppKnex(knex)}: ${msg}`);
};

export const report = {
  ok: (knex: Knex | undefined, msg: string) => reportInternal(knex, ReportType.OK, msg),
  fail: (knex: Knex, msg: string) => reportInternal(knex, ReportType.FAILURE, msg),
  skip: (knex: Knex, msg: string) => reportInternal(knex, ReportType.SKIP, msg),
};
