import { Knex } from 'knex';
import { report } from './report';

export const allSettled = (knexs: Knex[], block: (k: Knex) => Promise<any>) => {
  return Promise.allSettled(
    knexs.map(async (k) => {
      try {
        return await block(k);
      } catch (e) {
        report.fail(k, e.message);
        process.exit(1);
      }
    }),
  );
};
