const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create table
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY, col1 TEXT, col2 TEXT, col3 TEXT, col4 TEXT, col5 TEXT)");
  
  // Insert initial data
  const stmt = db.prepare("INSERT INTO data (col1, col2, col3, col4, col5) VALUES (?, ?, ?, ?, ?)");
  for (let i = 0; i < 30; i++) {
    stmt.run(`Item ${i+1}`, `Item ${i+1}`, `Item ${i+1}`, `Item ${i+1}`, `Item ${i+1}`);
  }
  stmt.finalize();
});

module.exports = db;
