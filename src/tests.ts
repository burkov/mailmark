import chalk from 'chalk';
import faker from 'faker';
import { fakeDate } from './faker';
import execa from 'execa';
import ora from 'ora';

interface Record {
  query: string;
  results: {
    pg: number;
    mysql: number;
  };
}

export const measure = async (block: () => Promise<any>): Promise<number> => {
  const start = new Date().getTime();
  await block();
  return new Date().getTime() - start;
};

const execMysql = (query: string): Promise<any> => {
  const process = execa('mysql', ['-h', '127.0.0.1', '--port', '3306', '-pmailmark', '-u', 'mailmark', 'mailmark'], {});
  process.stdin?.write(query);
  process.stdin?.end();

  return process;
};

const execPsql = (query: string): Promise<any> => {
  const process = execa('psql', ['-h', 'localhost', '-d', 'mailmark', '-U', 'mailmark'], {
    env: {
      PGPASSWORD: 'mailmark',
    },
  });
  process.stdin?.write(query);
  process.stdin?.end();

  return process;
};

const runTest = async (query: string) => {
  const spinner = ora(query).start();

  const pgTook = await measure(() => execPsql(query));
  spinner.text = `${query} (waiting MySQL)`;
  const mysqlTook = await measure(() => execMysql(query));

  const withPercent = (n: number, m: number) => {
    const delta = Math.abs(n - m);
    const percent = n > m && delta > 1000 ? Math.ceil((Math.abs(n - m) * 100) / Math.min(n, m)) : 0;
    const postfix = percent ? chalk.red(`+${percent.toString()}%`.padStart(7, ' ')) : '       ';
    const colorFn = n > m ? chalk.red : chalk.green;
    return `${colorFn(n.toString().padStart(6, ' '))} ms ${postfix}`;
  };

  spinner.stop();
  const pgres = chalk.blue('PGRES');
  const pgresStat = withPercent(pgTook, mysqlTook);
  const mysql = chalk.magenta('MYSQL');
  const mysqlStat = withPercent(mysqlTook, pgTook);

  console.log(`${pgres}: ${pgresStat} ${mysql}: ${mysqlStat} ${query}`);
};

const randomOffset = () => `offset ${faker.datatype.number(51_000_000)}`;
const randomDate = () => fakeDate(faker.datatype.number(51_000_000)).toISOString().slice(0, 10);
const randomClassification = () => faker.datatype.number(20);
const randomDomain = () => faker.internet.domainName();

export const runTests = async () => {
  await runTest(`select count(*) from emails`);
  await runTest(`select count(*) from emails`);
  await runTest(`select count(*) from emails`);
  await runTest(`select * from emails limit 500`);
  await runTest(`select * from emails limit 500`);
  await runTest(`select * from emails limit 500`);
  await runTest(`select * from emails limit 500 ${randomOffset()}`);
  await runTest(`select * from emails limit 500 ${randomOffset()}`);
  await runTest(`select * from emails limit 500 ${randomOffset()}`);
  await runTest(`select * from emails order by sent limit 500 ${randomOffset()}`);
  await runTest(`select * from emails order by sent limit 500 ${randomOffset()}`);
  await runTest(`select * from emails order by sent limit 500 ${randomOffset()}`);
  await runTest(`select * from emails where sent > ${randomDate()} limit 500`);
  await runTest(`select * from emails where sent > ${randomDate()} limit 500`);
  await runTest(`select * from emails where sent > ${randomDate()} limit 500`);
  await runTest(`select count(*) from emails where dest like '%@${randomDomain()}'`);
  await runTest(`select count(*) from emails where dest like '%@${randomDomain()}'`);
  await runTest(`select count(*) from emails where dest like '%@${randomDomain()}'`);
  await runTest(`select * from emails where sent > ${randomDate()} and classification = ${randomClassification()} order by sent limit 500`);
  await runTest(`select * from emails where sent > ${randomDate()} and classification = ${randomClassification()} order by sent limit 500`);
  await runTest(`select * from emails where sent > ${randomDate()} and classification = ${randomClassification()} order by sent limit 500`);
  await runTest(`select EXTRACT(year from sent), count(*) from emails group by EXTRACT(year from sent)`);
  await runTest(`select EXTRACT(year from sent), count(*) from emails group by EXTRACT(year from sent)`);
  await runTest(`select EXTRACT(year from sent), count(*) from emails group by EXTRACT(year from sent)`);
  await runTest(`select EXTRACT(year from sent), EXTRACT(month from sent), count(*) from emails group by EXTRACT(year from sent), EXTRACT(month from sent)`);
  await runTest(`select EXTRACT(year from sent), EXTRACT(month from sent), count(*) from emails group by EXTRACT(year from sent), EXTRACT(month from sent)`);
  await runTest(`select EXTRACT(year from sent), EXTRACT(month from sent), count(*) from emails group by EXTRACT(year from sent), EXTRACT(month from sent)`);
};
