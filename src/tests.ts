import knex, { Knex } from 'knex';
import fs from 'fs';
import { mysql, pg } from './init-connection';
import { report } from './report';
import chalk from 'chalk';

interface Record {
  query: string;
  results: {
    pg: number;
    mysql: number;
  };
}

const measure = async (block: () => Promise<any>): Promise<number> => {
  const start = new Date().getTime();
  await block();
  const took = new Date().getTime() - start;
  return took;
};

const runTest = async (results: Record[], query: string, block: (knex: Knex) => Promise<any>) => {
  const pgTook = await measure(() => block(pg));
  const mysqlTook = await measure(() => block(mysql));

  const withPercent = (n: number, m: number) => {
    const percent = n > m ? Math.ceil((n * 100) / m) : 0;
    const postfix = percent ? chalk.red(`+${percent}%`) : '';
    const colorFn = n > m ? chalk.red : chalk.green;
    return `${colorFn(n.toString().padStart(6, ' '))} ms ${postfix}`;
  };

  report.ok(pg, `${query} took ${withPercent(pgTook, mysqlTook)}`);
  report.ok(mysql, `${query} took ${withPercent(mysqlTook, pgTook)}`);

  results.push({
    query,
    results: {
      pg: pgTook,
      mysql: mysqlTook,
    },
  });
};

export const runTests = async (...knexs: Knex[]) => {
  const result: Record[] = [];
  
  await runTest(result, 'select count(*) from emails', async (knex: Knex) => {
    return knex('emails').count('*');
  });

  await runTest(result, 'select * from emails limit 500', async (knex: Knex) => {
    return knex('emails').select('*').limit(500);
  });

  await runTest(result, 'select * from emails limit 5000', async (knex: Knex) => {
    return knex('emails').select('*').limit(5000);
  });

  await runTest(result, 'select * from emails order by sent limit 500', async (knex: Knex) => {
    return knex('emails').select('*').orderBy('sent', 'desc').limit(500);
  });

  await runTest(result, "select * from emails where sent > '2018-01-01' limit 500", async (knex: Knex) => {
    return knex('emails').select('*').where("sent > '2018-01-01'").limit(500);
  });

  await runTest(result, "select count(*) from emails where src like '%@yahoo.com'", async (knex: Knex) => {
    return knex('emails').select('*').where("src like '%@yahoo.com'").limit(500);
  });

  await runTest(result, "select * from emails where sent > '2018-01-01' and classification = 13 order by sent limit 500", async (knex: Knex) => {
    return knex('emails').select('*').where("sent > '2018-01-01' and classification = 13").orderBy('sent', 'asc').limit(500);
  });

  fs.writeFileSync('results.json', JSON.stringify(result, null, '  '));
};
