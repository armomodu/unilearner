// Simple database schema checker
// Run with: node scripts/check-schema.js

const { Pool } = require('pg');

// Use your direct connection URL
const connectionString = "postgresql://postgres.iersezswbufuzdufxata:Winter2025!Pass.@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function checkSchema() {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Checking UniLearner Database Schema...\n');

    // Check if tables exist
    const tablesQuery = `
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tables = await pool.query(tablesQuery);
    console.log('📋 Existing Tables:');
    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name} (${row.table_type})`);
    });

    // Check blog_generations columns specifically
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'blog_generations' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const columns = await pool.query(columnsQuery);
    console.log('\n📊 blog_generations Table Columns:');
    
    if (columns.rows.length === 0) {
      console.log('  ❌ blog_generations table not found');
    } else {
      columns.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });

      // Check for performance metrics columns
      const performanceColumns = [
        'searchStartedAt', 'searchCompletedAt', 'searchDurationMs',
        'researchStartedAt', 'researchCompletedAt', 'researchDurationMs', 
        'writerStartedAt', 'writerCompletedAt', 'writerDurationMs',
        'totalDurationMs', 'completedAt'
      ];
      
      const existingColumns = columns.rows.map(row => row.column_name);
      const missingColumns = performanceColumns.filter(col => !existingColumns.includes(col));
      
      console.log('\n🎯 Performance Metrics Status:');
      if (missingColumns.length > 0) {
        console.log('❌ Missing performance columns:');
        missingColumns.forEach(col => console.log(`  - ${col}`));
        console.log('\n💡 Need to add these columns for full performance metrics.');
      } else {
        console.log('✅ All performance columns present!');
      }
    }

    // Check data counts
    console.log('\n📈 Table Record Counts:');
    const dataTables = ['users', 'blogs', 'blog_generations', 'sources'];
    
    for (const table of dataTables) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${countResult.rows[0].count} records`);
      } catch (err) {
        console.log(`  - ${table}: ❌ Error (${err.message})`);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('  - Check if Supabase project is paused');
      console.log('  - Verify connection credentials');
      console.log('  - Try accessing project in Supabase dashboard');
    }
  } finally {
    await pool.end();
  }
}

checkSchema();