import faker from 'faker';

const MIN_DATE = new Date(2014, 7, 8).getTime();
const MAX_DATE = new Date().getTime();
const step = Math.ceil((MAX_DATE - MIN_DATE) / 60_000_000);

const fakeDate = (id: number): Date => faker.date.between(new Date(MIN_DATE + step * id), new Date(MIN_DATE + step * (id + 1)));

export const fakeRows = (n: number, startFromId: number) => {
  const result = [];
  for (let i = 0; i < n; i++) {
    const bounced = faker.datatype.boolean();
    result.push({
      src: faker.internet.email(),
      dest: faker.internet.email(),
      subject: faker.lorem.sentence(),
      sent: fakeDate(startFromId),
      messageId: faker.datatype.uuid(),
      orderId: faker.datatype.number(),
      cssMailId: faker.datatype.number(),
      classification: faker.datatype.number(40),
      bounced,
      bouncedReason: bounced ? faker.lorem.sentence() : null,
      opened: fakeDate(startFromId),
      cc: faker.lorem.sentence(),
      threadId: faker.random.alphaNumeric(8),
      attachments: faker.lorem.sentence(),
    });
  }
  return result;
};
