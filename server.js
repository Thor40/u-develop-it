const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const sqlite3 = require('sqlite3').verbose();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Connect to database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to the election database.');
});


app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});

// Default response for any other request(Not Found) Catch all
app.use((req, res) => {
    res.status(404).end();
});

// captures err and rows db query response. If no errors in SQL query, err value is null
// returns whole table
// Get all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;
    const params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: rows
      });
    });
  });

// start by hardcoding an id (e.g. 1) tp test expression
// returns selected row id from table
db.get(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
    if(err) {
        console.log(err);
    }
    console.log(row);
});

// Delete candidate
// .run execute SQL query without retrievin data
// ? = placeholder (PREPARED STATEMENT: has a placeholder that can be dynamically filled with real values at runtime)
// `1` param argument provides values for prepared statement placeholders. Can be an array and hod multiple values
// ES5 function used for callback
db.run(`DELETE FROM candidates WHERE id = ?`, 1, function(err, result) {
    if(err) {
        console.log(err);
    }
    console.log(result, this, this.changes);
});

// Create a candidate
const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected) 
              VALUES (?,?,?,?)`;
const params = [1, 'Ronald', 'Firbank', 1];
// ES5 function, not arrow function, to use this
db.run(sql, params, function(err, result) {
  if (err) {
    console.log(err);
  }
  console.log(result, this.lastID);
});

// start server on port 3001
// Start server after DB connection
db.on('open', () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });