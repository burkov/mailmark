import knexInit from 'knex';

const params = {
  host: 'localhost',
  password: 'mailmark',
  user: 'mailmark',
  database: 'mailmark',
};

export const pg = knexInit({
  client: 'pg',
  connection: {
    ...params,
    port: 5432,
  },
});

export const mysql = knexInit({
  client: 'mysql2',
  connection: {
    ...params,
    port: 3306,
  },
});
