const express = require('express');
const bodyParser = require('body-parser');
const { db, createOriginalTable, originalTable } = require('./database');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/data', (req, res) => {
  db.all("SELECT * FROM data", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    db.all("PRAGMA table_info(data)", (err, columns) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      res.json({ rows, columns });
    });
  });
});

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

app.post('/add-row', (req, res) => {
  db.run("INSERT INTO data (col1, col2, col3, col4, col5) VALUES ('', '', '', '', '')", function(err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ id: this.lastID });
  });
});

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

app.post('/remove-column', (req, res) => {
  const { columnName } = req.body;
  db.serialize(() => {
    db.all("PRAGMA table_info(data)", (err, columns) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      const remainingColumns = columns.filter(col => col.name !== columnName).map(col => col.name);
      const remainingColumnsDefinition = remainingColumns.map(col => `${col} TEXT`).join(', ');
      const columnNames = remainingColumns.join(', ');

      db.run("ALTER TABLE data RENAME TO temp_data", err => {
        if (err) {
          res.status(500).send(err.message);
          return;
        }
        db.run(`CREATE TABLE data (${remainingColumnsDefinition})`, err => {
          if (err) {
            res.status(500).send(err.message);
            return;
          }
          db.run(`INSERT INTO data (${columnNames}) SELECT ${columnNames} FROM temp_data`, err => {
            if (err) {
              res.status(500).send(err.message);
              return;
            }
            db.run("DROP TABLE temp_data", err => {
              if (err) {
                res.status(500).send(err.message);
                return;
              }
              res.sendStatus(200);
            });
          });
        });
      });
    });
  });
});

app.post('/factory-reset', (req, res) => {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS data", (err) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }
      createOriginalTable().then(() => res.sendStatus(200)).catch(err => res.status(500).send(err.message));
    });
  });
});

createOriginalTable().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
