# Lab 2: SQLite database and CRUD routes

**Pinisetti Sai Babu** • **252U1R1192** • **Section: S-019**  
**Course:** Backend Development Fundamentals (Year II Term II) • Aurora  
**Faculty:** Joel Prashanth D  

---

## Live link
*Not applicable (Local database server)*  
**GitHub Repository:** [https://github.com/Twilight-X9/backend-lab2](https://github.com/Twilight-X9/backend-lab2)

---

## Objective
I connected an Express server to `books.db` and added routes to list, add, update, and delete books. The queries use `?` placeholders for values from requests.

---

## Database Schema & Seed Data

The application uses an embedded SQLite database with the following table schema:

```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);
```

The database is pre-seeded with 10 standard computer science and software engineering books.

---

## How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (v9+)

### 1. Installation
Navigate into the `lab-02` directory and install dependencies:
```bash
cd lab-02
npm install
```

### 2. Environment Variables
No required external environment variables. Optionally customize the listening port:
```env
PORT=3000
```

### 3. Execution Commands
* **Start Primary Server:**
  ```bash
  npm start
  # or: node server.js
  ```
  Runs at `http://localhost:3000`

* **Development Mode (Auto-reload on code change via Nodemon):**
  ```bash
  npm run dev
  ```

* **Reset / Seed Database:**
  ```bash
  npm run seed
  ```

---

## Endpoints Table

| Method | Endpoint | Description | Status Code | Request Body / Parameters |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/books/` | Returns an array of all books. | `200 OK` | None |
| `GET` | `/books/:bookId/` | Returns a single book by ID. | `200 OK` / `404 Not Found` | Route param: `bookId` |
| `POST` | `/books/` | Creates a new book record. | `201 Created` / `400 Bad Request` | JSON: `{ title, author, price, pages }` |
| `PUT` | `/books/:bookId/` | Updates an existing book. | `200 OK` / `404 Not Found` | Route param: `bookId`<br>JSON: Partial or full fields |
| `DELETE` | `/books/:bookId/` | Deletes a book record by ID. | `200 OK` / `404 Not Found` | Route param: `bookId` |
| `ALL` | `/*` (Unknown) | Catch-all handler for undefined routes. | `404 Not Found` | Any invalid URL |

---

## Screenshots

### 1. `GET /books/` – Retrieve All Books (Status 200 OK)
![GET All Books](screenshots/Screenshot%202026-10-31%20153706.png)

---

### 2. `GET /books/1/` – Retrieve Single Book by ID (Status 200 OK)
![GET Single Book](screenshots/Screenshot%202026-10-31%20153707.png)

---

### 3. `GET /books/999/` – Book Not Found Error (Status 404 Not Found)
![Book Not Found](screenshots/Screenshot%202026-10-31%20153706-2.png)

---

### 4. `POST /books/` – Add New Book (Status 201 Created)
![POST Create Book](screenshots/Screenshot%202026-10-31%20153810.png)

---

### 5. `PUT /books/:bookId/` – Update Book Details (Status 200 OK)
![PUT Update Book](screenshots/Screenshot%202026-10-31%20153810-2.png)

---

### 6. `DELETE /books/:bookId/` – Delete Book by ID (Status 200 OK)
![DELETE Book](screenshots/Screenshot%202026-10-31%20153810-3.png)

---

## Viva notes

### Q1: Why await the database call?
* Database read and write operations are **asynchronous I/O operations** that interact with the file system or network. If we do not use `await`, JavaScript returns an unresolved `Promise` immediately instead of waiting for the database to complete the operation. Using `await` halts the execution of that specific `async` function until the database query resolves with actual rows or writes, ensuring consistency and preventing race conditions.

### Q2: What is SQL injection and how do placeholders (`?`) prevent it?
* **SQL Injection:** A critical security vulnerability where untrusted client input (such as a string containing `'; DROP TABLE book; --`) is concatenated directly into a SQL query string. The database interprets the attacker's input as executable SQL commands.
* **How Placeholders Prevent It:** By using parameterised queries (`WHERE id = ?`, `[bookId]`), the database driver separates query code from data. The database compiles the SQL structure first, and treats the placeholder values purely as literal data, rendering malicious SQL commands harmless.

### Q3: When is `PUT` used instead of `POST`?
* **`POST`**: Used to **create** a new subordinate resource. The server determines the URL/ID of the newly created entity (e.g., `POST /books/` creates a new book and assigns an ID). `POST` requests are typically **not idempotent** (sending the same POST request twice creates two separate records).
* **`PUT`**: Used to **replace or update** an existing resource identified by a specific URL (e.g., `PUT /books/5/`). `PUT` is designed to be **idempotent** (sending the exact same PUT request multiple times leaves the resource in the identical state).

---

## Problems I faced

1. **Native Addon Compilation on Windows & Node 26**:
   * *Problem:* `sqlite3` relies on a C++ native addon (`node_sqlite3.node`). Under newer Node runtimes, prebuild auto-detection occasionally requires explicit N-API prebuild installation.
   * *Solution:* Leveraged `prebuild-install -r napi` to download and unpack the prebuilt binary directly, preventing prolonged C++ compilation times.

2. **Server Lifecycle Synchronization**:
   * *Problem:* If the Express server begins accepting HTTP requests before the SQLite database connection finishes opening, initial requests will encounter a `db is null` runtime crash.
   * *Solution:* Implemented `initializeDBAndServer()` to sequentially `await open(...)` before invoking `app.listen(...)`. If the database fails to open, the process logs an error and exits gracefully without leaving an unstable server running.

3. **Data Validation for Mutations**:
   * *Problem:* Unchecked `POST` requests could insert empty or `null` records into SQLite.
   * *Solution:* Added request body verification to ensure required fields (`title`, `author`, `price`, `pages`) exist before triggering database execution, returning standard `400 Bad Request` responses on invalid payloads.
