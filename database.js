const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const originalTable = {
  columns: ['id', 'col1', 'col2', 'col3', 'col4', 'col5'],
  data: Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    col1: `Item ${i + 1}`,
    col2: `Item ${i + 1}`,
    col3: `Item ${i + 1}`,
    col4: `Item ${i + 1}`,
    col5: `Item ${i + 1}`
  }))
};

function createOriginalTable() {
  return new Promise((resolve, reject) => {
    const columns = originalTable.columns.map(col => {
      if (col === 'id') return `${col} INTEGER PRIMARY KEY`;
      return `${col} TEXT`;
    }).join(', ');

    db.run(`CREATE TABLE data (${columns})`, (err) => {
      if (err) return reject(err);

      const stmt = db.prepare(`INSERT INTO data (${originalTable.columns.join(', ')}) VALUES (?, ?, ?, ?, ?, ?)`);
      for (let i = 0; i < 30; i++) {
        stmt.run(
          originalTable.data[i].id,
          originalTable.data[i].col1,
          originalTable.data[i].col2,
          originalTable.data[i].col3,
          originalTable.data[i].col4,
          originalTable.data[i].col5
        );
      }
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

module.exports = { db, createOriginalTable, originalTable };
