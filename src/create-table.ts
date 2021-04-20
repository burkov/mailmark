import { Knex } from 'knex';
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

export const createEmailsTable = async (truncate: boolean, ...knexs: Knex[]) => {
  return allSettled(knexs, async (knex) => {
    if (await knex.schema.hasTable('emails')) {
      report.skip(knex, `already has table 'Emails'`);
      if (truncate) {
        report.ok(knex, `truncating table 'Emails'`);
        await knex('emails').truncate();
      }
      return undefined;
    }
    report.ok(knex, `creating table 'Emails'`);

    await knex.schema.createTable('emails', (t) => {
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
      t.string('threadId', 8), t.string('attachments');

      t.index('sent');
      t.index('src');
      t.index('dest');
      t.index(['classification', 'sent']);
      t.index(['dest', 'sent']);
      t.index('threadId');
    });
  });
};
