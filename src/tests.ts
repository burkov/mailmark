import knex, { Knex } from 'knex';
import fs from 'fs';
import { mysql, pg } from './init-connection';
import { report } from './report';
import chalk from 'chalk';
import faker, { fake } from 'faker';
import { fakeDate } from './faker';

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
    const delta = Math.abs(n - m);
    const percent = n > m && delta > 1000 ? Math.ceil((n * 100) / m) : 0;
    const postfix = percent ? chalk.red(`+${percent}%`) : '';
    const colorFn = n > m ? chalk.red : chalk.green;
    return `${colorFn(n.toString().padStart(6, ' '))} ms ${postfix}`;
  };

  console.log(query);
  console.log(`    ${chalk.blue('PGRES')}: ${withPercent(pgTook, mysqlTook).padEnd(40, ' ')}    ${chalk.magenta('MYSQL')}: ${withPercent(mysqlTook, pgTook)}`);
  console.log();

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

  // await runTest(result, 'select count(*) from emails', async (knex: Knex) => {
  //   return knex('emails').count('*');
  // });

  let randomInt = faker.datatype.number(35_000_000);
  await runTest(result, `select * from emails limit 500 offset ${randomInt}`, async (knex: Knex) => {
    return knex('emails').select('*').limit(500).offset(randomInt);
  });

  randomInt = faker.datatype.number(35_000_000);
  await runTest(result, `select * from emails limit 5000 offset ${randomInt}`, async (knex: Knex) => {
    return knex('emails').select('*').limit(5000).offset(randomInt);
  });

  randomInt = faker.datatype.number(35_000_000);
  await runTest(result, `select * from emails order by sent limit 500 offset ${randomInt}`, async (knex: Knex) => {
    return knex('emails').select('*').orderBy('sent', 'desc').limit(500).offset(randomInt);
  });

  let randomDate = fakeDate(faker.datatype.number(35_000_000));
  await runTest(result, `select * from emails where sent > ${randomDate.toISOString().slice(0, 10)} limit 500`, async (knex: Knex) => {
    return knex('emails').select('*').where('sent', '>', randomDate).limit(500);
  });

  let randomDomain = faker.internet.domainName();
  await runTest(result, `select count(*) from emails where src like '%@${randomDomain}'`, async (knex: Knex) => {
    return knex('emails').select('*').where('src', 'like', `%@${randomDomain}`).limit(500);
  });

  randomInt = faker.datatype.number(20);
  randomDate = fakeDate(faker.datatype.number(35_000_000));
  await runTest(
    result,
    `select * from emails where sent > ${randomDate.toISOString().slice(0, 10)} and classification = ${randomInt} order by sent limit 500`,
    async (knex: Knex) => {
      return knex('emails').select('*').where('sent', '>', randomDate).andWhere({ classification: randomInt }).orderBy('sent', 'asc').limit(500);
    },
  );

  await runTest(result, `select count(*) from emails group by EXTRACT(year from sent)`, async (knex: Knex) => {
    return knex('emails').count('*').groupByRaw('EXTRACT(year from sent)');
  });

  await runTest(result, `select count(*) from emails group by EXTRACT(year from sent), EXTRACT(month from sent)`, async (knex: Knex) => {
    return knex('emails').count('*').groupByRaw('EXTRACT(year from sent), EXTRACT(month from sent)');
  });

  await runTest(result, `select count(*) from emails group by dest`, async (knex: Knex) => {
    return knex('emails').count('*').groupBy('dest');
  });

  fs.writeFileSync('results.json', JSON.stringify(result, null, '  '));
};
