const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Get all data
app.get('/data', (req, res) => {
  db.all("SELECT * FROM data", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

// Update data
app.post('/update', (req, res) => {
  const { id, ...columns } = req.body;
  const query = `UPDATE data SET ${Object.keys(columns).map(col => `${col} = ?`).join(', ')} WHERE id = ?`;
  const values = [...Object.values(columns), id];
  db.run(query, values, function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.sendStatus(200);
  });
});

// Add a new row
app.post('/add-row', (req, res) => {
  db.run("INSERT INTO data (col1, col2, col3, col4, col5) VALUES ('', '', '', '', '')", function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Remove a row
app.post('/remove-row', (req, res) => {
  const { id } = req.body;
  db.run("DELETE FROM data WHERE id = ?", id, function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.sendStatus(200);
  });
});

// Add a new column
app.post('/add-column', (req, res) => {
  const { columnName } = req.body;
  db.run(`ALTER TABLE data ADD COLUMN ${columnName} TEXT`, function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.sendStatus(200);
  });
});

// Remove a column
app.post('/remove-column', (req, res) => {
  res.status(501).send('Removing columns is not directly supported by SQLite.');
});

// Factory reset endpoint
app.post('/factory-reset', (req, res) => {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS data", (err) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      db.run("CREATE TABLE data (id INTEGER PRIMARY KEY, col1 TEXT, col2 TEXT, col3 TEXT, col4 TEXT, col5 TEXT)", (err) => {
        if (err) {
          res.status(500).send(err.message);
          return;
        }
        const stmt = db.prepare("INSERT INTO data (col1, col2, col3, col4, col5) VALUES (?, ?, ?, ?, ?)");
        for (let i = 0; i < 30; i++) {
          stmt.run(`Item ${i+1}`, `Item ${i+1}`, `Item ${i+1}`, `Item ${i+1}`, `Item ${i+1}`);
        }
        stmt.finalize();
        res.sendStatus(200);
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
