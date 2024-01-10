const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const cors = require("cors");
const app = express();
const port = 5010;

// MySQL Connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3004" }));

// MySQL Table Schema
const todoTable = `
CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL
)
`;

connection.query(todoTable, (err, result) => {
  if (err) {
    console.error("Error creating todos table:", err);
    return;
  }
  console.log("Todos table created or exists");
});

// REST API Endpoints
// Get all todos

// Create a todo
app.post("/api/todos", (req, res) => {
  const { text } = req.body;
  connection.query("INSERT INTO todos SET ?", { text }, (err, result) => {
    if (err) {
      console.error("Error creating todo:", err);
      res.status(500).send("Error creating todo");
      return;
    }
    res.status(201).json({ id: result.insertId, text });
  });
});


app.get("/api/todos", (req, res) => {
  connection.query("SELECT * FROM todos", (err, rows) => {
    if (err) {
      console.error("Error fetching todos:", err);
      res.status(500).send("Error fetching todos");
      return;
    }
    res.json(rows);
  });
});

// Get a single todo by ID
app.get("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM todos WHERE id = ?", id, (err, rows) => {
    if (err) {
      console.error("Error fetching todo:", err);
      res.status(500).send("Error fetching todo");
      return;
    }
    if (rows.length === 0) {
      res.status(404).send("Todo not found");
      return;
    }
    res.json(rows[0]);
  });
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  connection.query("DELETE FROM todos WHERE id = ?", id, (err, result) => {
    if (err) {
      console.error("Error deleting todo:", err);
      res.status(500).send("Error deleting todo");
      return;
    }
    res.sendStatus(200);
  });
});

// Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
