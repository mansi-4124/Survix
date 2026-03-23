import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createCode = () => {
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

const findMissingPolls = async () => {
  const response = await prisma.$runCommandRaw({
    find: 'Poll',
    filter: {
      $or: [{ code: { $exists: false } }, { code: null }, { code: '' }],
    },
    projection: { _id: 1 },
    limit: 100000,
  });

  return response?.cursor?.firstBatch ?? [];
};

const codeExists = async (code) => {
  const response = await prisma.$runCommandRaw({
    find: 'Poll',
    filter: { code },
    projection: { _id: 1 },
    limit: 1,
  });

  const rows = response?.cursor?.firstBatch ?? [];
  return rows.length > 0;
};

const setCode = async (id, code) => {
  await prisma.$runCommandRaw({
    update: 'Poll',
    updates: [
      {
        q: { _id: id },
        u: { $set: { code } },
        upsert: false,
      },
    ],
  });
};

const main = async () => {
  const missingPolls = await findMissingPolls();

  if (missingPolls.length === 0) {
    console.log('No polls require backfill.');
    return;
  }

  console.log(`Backfilling codes for ${missingPolls.length} poll(s)...`);

  for (const poll of missingPolls) {
    let code = createCode();
    let attempts = 0;

    while (await codeExists(code)) {
      attempts += 1;
      if (attempts > 10) {
        throw new Error('Unable to allocate unique poll code during backfill');
      }
      code = createCode();
    }

    await setCode(poll._id, code);
  }

  console.log('Poll code backfill completed.');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
