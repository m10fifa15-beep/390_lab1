const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

//crypto
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const app = express();
const port = 3000;



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'test123', // use your MySQL password if needed
  database: 'userDB'
});

//1st new code for homework 1 (changed with something originally given in lab 1)
app.post('/login', (req, res) => {
  const username = req.body.username;
  const hashedPassword = hashPassword(req.body.password);

  const sql = `
    SELECT * FROM users
    WHERE username = ? AND password = ?
  `;

  db.query(sql, [username, hashedPassword], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      res.send(`Welcome back, ${results[0].first_name}!`);
    } else {
      res.send('Invalid username or password.');
    }
  });
});



app.get('/hello-user', (req, res) => {
  const sql = 'SELECT * FROM users LIMIT 1';

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.send('No users found');
    }

    const user = results[0];
    res.send(`Hello, ${user.first_name}!`);
  });
});

//second new code for homework 1

app.post('/create-user', (req, res) => {
  const { username, password, first_name, last_name, birthday } = req.body;

  if (!username || !password || !first_name || !last_name || !birthday) {
    return res.status(400).send('All fields are required.');
  }

  const hashedPassword = hashPassword(password);

  //prevents duplicate usernames 
  const checkSql = `SELECT id FROM users WHERE username = ? LIMIT 1`;
  db.query(checkSql, [username], (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send('Server error');
    }

    if (checkResults.length > 0) {
      return res.status(409).send('That username is already taken.');
    }

    const insertSql = `
      INSERT INTO users (username, password, first_name, last_name, birthday)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [username, hashedPassword, first_name, last_name, birthday],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Database insert error');
        }

        res.send(`User created successfully! New user id: ${result.insertId}`);
      }
    );
  });
});


app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
