const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

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

const crypto = require('crypto');
app.post('/login', (req, res) => {
const username = req.body.username;
const hashedPassword = crypto
.createHash('sha256')
.update(req.body.password)
.digest('hex');
const sql = `
SELECT * FROM users
WHERE username = ? AND password = ?
`;
db.query(sql, [username, req.body.password], (err, results) => {
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

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
