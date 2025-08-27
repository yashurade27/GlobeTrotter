import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test' + Date.now() + '@test.com',
        password: 'testpass123'
      }
    });
    
    console.log('Successfully created test user:', testUser);
    
    // Fetch all users
    const allUsers = await prisma.user.findMany();
    console.log('All users in database:', allUsers);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
