import knex, { Knex } from 'knex';
import { fakeDate, fakeRows } from './faker';
import { allSettled } from './helpers';
import { report } from './report';
import { measure } from './tests';

export const populate = async (nMillions: number, ...knexs: Knex[]) => {
  const maxDbId = Math.min(
    ...(
      await allSettled(knexs, async (knex) => {
        const query = await knex('emails').count('* as CNT').first();
        return parseInt(query!.CNT.toString());
      })
    ).map((e) => (e as PromiseFulfilledResult<number>).value),
  );
  report.ok(undefined, `generating ${nMillions}M emails (max id = ${maxDbId})...`);

  const batchSize = 100_000;
  const n = nMillions * 1_000_000;

  for (let i = 0; i < n; i += batchSize) {
    const startFromId = maxDbId + batchSize;
    const rows = fakeRows(batchSize, startFromId);
    await allSettled(knexs, async (knex) => {
      const took = await measure(() => knex.batchInsert('emails', rows, 1000));
      const step = (i / batchSize + 1).toString().padStart(3, '0');
      const totalSteps = n / batchSize;
      report.ok(knex, `${step} of ${totalSteps}: inserted ${batchSize / 1000}k record, took ${Math.ceil(took / 1000)} seconds`);
    });
  }
};
