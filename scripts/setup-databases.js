const { Client } = require('pg');

async function createDatabases() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database first
  });

  const databases = [
    'ecommerce_catalog_db',
    'ecommerce_cart_db', 
    'ecommerce_order_db',
    'ecommerce_identity_db',
    'ecommerce_payment_db'
  ];

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL');

    for (const dbName of databases) {
      try {
        // Check if database exists
        const result = await client.query(
          'SELECT 1 FROM pg_database WHERE datname = $1',
          [dbName]
        );

        if (result.rows.length === 0) {
          // Database doesn't exist, create it
          await client.query(`CREATE DATABASE "${dbName}"`);
          console.log(`✅ Created database: ${dbName}`);
        } else {
          console.log(`⚡ Database already exists: ${dbName}`);
        }
      } catch (error) {
        console.error(`❌ Error creating database ${dbName}:`, error.message);
      }
    }

    console.log('🎉 Database setup completed!');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabases().catch(console.error);