const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteExpiredUsers() {
  const now = new Date();

  const deletedUsers = await prisma.users.deleteMany({
    where: {
      deletedAt: { lte: now },
    },
  });

  // DELETE THIS CONSOLE LOG IN PRODUCTION
  console.log(`Deleted users count: ${deletedUsers.count}`);
}

cron.schedule('0 3 * * *', () => {
  console.log('Delete user process starting...');
  deleteExpiredUsers();
});
