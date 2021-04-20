import knex, { Knex } from 'knex';
import { fakeRows } from './faker';
import { allSettled } from './helpers';
import { report } from './report';

export const populate = async (nMillions: number, ...knexs: Knex[]) => {
  const batchSize = 100_000;
  const iterations = (nMillions * 1_000_000) / batchSize;
  report.ok(undefined, `generating ${nMillions}M emails...`);
  // const query = await knex('emails').count('* as CNT').first();
  // const alreadyHasN = parseInt(query!.CNT.toString());
  for (let i = 0; i < iterations; i++) {
    const startFrom = i * batchSize;
    const rows = fakeRows(batchSize, startFrom);
    await allSettled(knexs, async (knex) => {
      await knex.batchInsert('emails', rows, 3_000);
      report.ok(knex, `${(i + 1).toString().padStart(3, '0')} of ${iterations}: inserted ${batchSize / 1000}k record strating from id = ${startFrom}`);
    });
  }
};
