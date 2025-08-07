const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'rentman.db');
const db = new sqlite3.Database(dbPath);

console.log('🏠 Rentman Database Viewer');
console.log('========================\n');

// Function to display table data
function displayTable(tableName, title) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${title}`);
    console.log('─'.repeat(50));
    
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.error(`Error reading ${tableName}:`, err.message);
        resolve();
        return;
      }
      
      if (rows.length === 0) {
        console.log(`No data in ${tableName}`);
      } else {
        console.table(rows);
      }
      resolve();
    });
  });
}

// Function to show table schemas
function showSchema(tableName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Schema for ${tableName}:`);
    console.log('─'.repeat(50));
    
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        console.error(`Error reading schema for ${tableName}:`, err.message);
        resolve();
        return;
      }
      
      console.table(rows.map(row => ({
        column: row.name,
        type: row.type,
        notNull: row.notnull,
        primaryKey: row.pk,
        defaultValue: row.dflt_value
      })));
      resolve();
    });
  });
}

async function main() {
  try {
    // Show all tables
    console.log('📊 Available Tables:');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('Error reading tables:', err.message);
        return;
      }
      
      tables.forEach(table => {
        console.log(`  • ${table.name}`);
      });
      
      // Display data from each table
      displayTable('tenants', 'Tenants');
      displayTable('rent_logs', 'Rent Logs');
      displayTable('rent_collectors', 'Rent Collectors');
      displayTable('app_settings', 'App Settings');
      displayTable('uploaded_files', 'Uploaded Files');
      
      // Show schemas
      setTimeout(async () => {
        await showSchema('tenants');
        await showSchema('rent_logs');
        await showSchema('rent_collectors');
        await showSchema('app_settings');
        await showSchema('uploaded_files');
        
        console.log('\n✅ Database viewing complete!');
        db.close();
      }, 1000);
    });
    
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

main();
