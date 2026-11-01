const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'books.db');

let db = null;

// Parse JSON request bodies.
app.use(express.json());

// Open SQLite before starting the server.
async function initializeDBAndServer() {
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    console.log('Database connected successfully.');

    // Create the table if needed.
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
}

// List all books.
app.get('/books/', async (req, res) => {
  try {
    const getBooksQuery = 'SELECT * FROM book ORDER BY id ASC';
    const booksArray = await db.all(getBooksQuery);
    res.status(200).json(booksArray);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Get one book by ID.
app.get('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = 'SELECT * FROM book WHERE id = ?';
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ error: 'Not Found', message: `Book with id ${bookId} not found.` });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Add a book.
app.post('/books/', async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'All fields (title, author, price, pages) are required.'
      });
    }

    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await db.run(addBookQuery, [title, author, price, pages]);

    res.status(201).json({
      message: 'Book added successfully',
      bookId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Update a book.
app.put('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    // Return 404 when the book does not exist.
    const existingBook = await db.get('SELECT * FROM book WHERE id = ?', [bookId]);
    if (!existingBook) {
      return res.status(404).json({ error: 'Not Found', message: `Book with id ${bookId} not found.` });
    }

    if (!title && !author && price === undefined && pages === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one field must be provided to update.'
      });
    }

    const updatedTitle = title !== undefined ? title : existingBook.title;
    const updatedAuthor = author !== undefined ? author : existingBook.author;
    const updatedPrice = price !== undefined ? price : existingBook.price;
    const updatedPages = pages !== undefined ? pages : existingBook.pages;

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;
    await db.run(updateBookQuery, [updatedTitle, updatedAuthor, updatedPrice, updatedPages, bookId]);

    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Delete a book.
app.delete('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;

    // Return 404 when the book does not exist.
    const existingBook = await db.get('SELECT * FROM book WHERE id = ?', [bookId]);
    if (!existingBook) {
      return res.status(404).json({ error: 'Not Found', message: `Book with id ${bookId} not found.` });
    }

    const deleteBookQuery = 'DELETE FROM book WHERE id = ?;';
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Return 404 for unknown routes.
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start the server after the database opens.
initializeDBAndServer();
