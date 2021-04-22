import knex, { Knex } from 'knex';
import { allSettled } from './helpers';
import { report } from './report';

/**
 * create table Emails (
 *     id             int auto_increment primary key,
 *     src            varchar(255)     not null,
 *     dest           varchar(255)     not null,
 *     subject        varchar(255)     not null,
 *     sent           datetime         not null,
 *     messageid      varchar(255)     not null,
 *     orderId        int              null,
 *     cssMailId      bigint           null,
 *     classification int              null,
 *     bounced        boolean          not null,
 *     bouncedReason  text             null,
 *     opened         datetime(6)      null,
 *     cc             text             null,
 *     threadId       varchar(8)       null,
 *     attachments    varchar(255)     null,
 * );
 *
 * create index Emails_sent on Emails (sent);
 *
 * create index Emails_src on Emails (src);
 *
 * create index classification on Emails (classification, sent);
 *
 * create index dest on Emails (dest, sent);
 *
 * create index threadId on Emails (threadId);
 */

export const truncateEmailsTable = async (...knexs: Knex[]) =>
  allSettled(knexs, async (knex) => {
    if (await knex.schema.hasTable('emails')) {
      report.ok(knex, `truncating table 'Emails'`);
      return knex('emails').truncate();
    }
  });

export const createEmailsTableIfNotExists = async (...knexs: Knex[]) =>
  allSettled(knexs, async (knex) => {
    if (await knex.schema.hasTable('emails')) return undefined;
    return knex.schema.createTable('emails', (t) => {
      report.ok(knex, `creating table 'Emails'`);

      t.increments('id').primary();
      t.string('src').notNullable();
      t.string('dest').notNullable();
      t.string('subject').notNullable();
      t.dateTime('sent').notNullable();
      t.string('messageId').notNullable();
      t.integer('orderId');
      t.bigInteger('cssMailId');
      t.integer('classification');
      t.boolean('bounced').notNullable();
      t.text('bouncedReason');
      t.date('opened');
      t.text('cc');
      t.string('threadId', 8);
      t.string('attachments');

      t.index('sent');
      t.index('dest');
      t.index(['classification', 'sent']);
      t.index(['dest', 'sent']);
    });
  });
