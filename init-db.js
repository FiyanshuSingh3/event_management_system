const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // Allow multiple SQL statements
});

const sql = fs.readFileSync('database.sql', 'utf8');

pool.execute(sql, (err, results) => {
    if (err) {
        console.error('Error executing SQL:', err);
    } else {
        console.log('Database schema created successfully');
    }
    pool.end();
});