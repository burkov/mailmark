import { createEmailsTableIfNotExists, truncateEmailsTable } from './create-table';
import { allSettled } from './helpers';
import { mysql, pg } from './init-connection';
import { populate as populateEmailsTable } from './populate';
import { runTests } from './tests';

import { parseOptions } from './options';

const main = async () => {
  const options = parseOptions();
  await createEmailsTableIfNotExists(pg, mysql);
  if (options.truncate) await truncateEmailsTable(pg, mysql);
  if (options.populate) await populateEmailsTable(options.populate, pg, mysql);
  await runTests();

  await allSettled([pg, mysql], (knex) => knex.destroy());
};

main().catch(console.error);
