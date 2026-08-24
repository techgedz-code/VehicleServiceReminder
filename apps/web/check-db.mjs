import { createClient } from '@libsql/client';

const client = createClient({
  url: 'libsql://vehicleservicereminder-techgedz.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODczMDEwMzUsImlkIjoiMDFhMDIzNDQtYTIwMS03MjY3LWEyZmQtOTU3YzI4NWUzMThhIiwia2lkIjoibi1HZ21uVnhxYXA4OGxiM1Joa3IxU3lveTJvNERqU1dHTG84aFFheENzMCIsInJpZCI6IjY3YzIzYTQ0LTQ1MjItNDBmZC04YTFhLTM5NTkzN2VhMWM1MCJ9.EOX-WhoPGtpbb8WzN94mXi2KZ1I9Vj2AcdEF4eytADEMplzR6uRNh1E5jr9yc9P51zIMCANWRS0CXl7Q2evwCg'
});

async function run() {
  try {
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
  await client.close();
}

run().catch(console.error);