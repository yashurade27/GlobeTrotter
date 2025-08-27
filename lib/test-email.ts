// // Used to test email configuration
// // Run with: npx tsx lib/test-email.ts

// import { sendMail } from './mail';

// async function testEmail() {
//   console.log('Testing email configuration...');
//   console.log('SMTP_HOST:', process.env.SMTP_HOST);
//   console.log('SMTP_PORT:', process.env.SMTP_PORT);
//   console.log('SMTP_USER:', process.env.SMTP_USER);
  
//   try {
//     const result = await sendMail({
//       to: 'test@example.com', // Change to your email for testing
//       subject: 'Globetrotter Email Test',
//       text: 'This is a test email to verify SMTP configuration',
//       html: '<h1>Email Test</h1><p>If you receive this, the email configuration is working correctly.</p>',
//     });
    
//     console.log('Email test result:', result);
//   } catch (error) {
//     console.error('Email test failed:', error);
//   }
// }

// // Only run if executed directly (not imported)
// if (require.main === module) {
//   // Load environment variables if not in Next.js context
//   require('dotenv').config();
//   testEmail()
//     .then(() => console.log('Email test completed'))
//     .catch(console.error);
// }