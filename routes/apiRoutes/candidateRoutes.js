const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');


// captures err and rows db query response. If no errors in SQL query, err value is null
// db.all = returns whole table
// Get all candidates
router.get('/candidates', (req, res) => {
const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id`;
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
// db.get = returns selected row id from table
// Get single candidate
router.get('/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id 
                WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
    if (err) {
        res.status(400).json({ error: err.message });
        return;
    }

    res.json({
        message: 'success',
        data: row
        });
    });
});
  
// Delete candidate
// .run execute SQL query without retrievin data
// ? = placeholder (PREPARED STATEMENT: has a placeholder that can be dynamically filled with real values at runtime)
// `1` param argument provides values for prepared statement placeholders. Can be an array and hod multiple values
// ES5 function used for callback
router.delete('/candidate/:id', (req, res) => {
const sql = `DELETE FROM candidates WHERE id = ?`;
const params = [req.params.id];
db.run(sql, params, function(err, result) {
    if (err) {
    res.status(400).json({ error: res.message });
    return;
    }

    res.json({
    message: 'successfully deleted',
    changes: this.changes
        });
    });
});
  
// update candidates
router.put('/candidate/:id', (req, res) => {
const errors = inputCheck(req.body, 'party_id');

if (errors) {
res.status(400).json({ error: errors });
return;
}
const sql = `UPDATE candidates SET party_id = ? 
                WHERE id = ?`;
const params = [req.body.party_id, req.params.id];

db.run(sql, params, function(err, result) {
    if (err) {
    res.status(400).json({ error: err.message });
    return;
    }

    res.json({
    message: 'success',
    data: req.body,
    changes: this.changes
        });
    });
});

// Create a candidate
// object destructuring to pull body property out of request object ({ body }, res)
router.post('/candidate', ({ body }, res) => {
const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
if (errors) {
    res.status(400).json({ error: errors });
    return;
}
const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
                VALUES (?,?,?)`;
const params = [body.first_name, body.last_name, body.industry_connected];
// ES5 function, not arrow funciton, to use `this`
db.run(sql,params, function(err, result) {
    if (err) {
    res.status(400).json({ error: err.message });
    return;
    }
    res.json({
    message: 'success',
    data: body,
    id: this.lastID
        });
    });
});

module.exports = router;