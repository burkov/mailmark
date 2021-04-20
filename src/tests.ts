import knex, { Knex } from 'knex';
import fs from 'fs';
import { mysql, pg } from './init-connection';
import { report } from './report';

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
  report.ok(pg, `${query} took ${pgTook} ms`);
  const mysqlTook = await measure(() => block(mysql));
  report.ok(mysql, `${query} took ${mysqlTook} ms`);
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

  fs.writeFileSync('results.json', JSON.stringify(result, null, '  '));
};
