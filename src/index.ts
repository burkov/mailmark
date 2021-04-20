import { createEmailsTable } from './create-table';
import { allSettled } from './helpers';
import { mysql, pg } from './init-connection';
import { populate as populateEmailsTable } from './populate';
import { report } from './report';
import { runTests } from './tests';

const main = async () => {
  const repopulate = true;
  if (repopulate) {
    await createEmailsTable(true, pg, mysql);
    await populateEmailsTable(60, pg, mysql);
  }

  await runTests();

  await allSettled([pg, mysql], (knex) => knex.destroy());
};

main().catch(console.error);
