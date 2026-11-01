# Lab 2: SQLite database and CRUD routes

**Pinisetti Sai Babu** • **252U1R1192** • **Section: S-019**  
**Course:** Backend Development Fundamentals (Year II Term II) • Aurora  

---

## Live link
Deployment: add the Render URL here after creating the web service.  
**GitHub Repository:** [https://backend-lab2-2.onrender.com/books/](https://backend-lab2-2.onrender.com/books/)

---

## Objective
I connected an Express server to `books.db` and added routes to list, add, update, and delete books. The queries use `?` placeholders for values from requests.

---

## Database table

I store the books in a local SQLite database. The `book` table has these columns:

```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);
```

The seed script inserts ten books when the table is empty.

---

## How to run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (v9+)

### Install dependencies
Navigate into the `lab-02` directory and install dependencies:
```bash
cd lab-02
npm install
```

### Port
No required external environment variables. Optionally customize the listening port:
```env
PORT=3000
```

### Start the server
* **Start Primary Server:**
  ```bash
  npm start
  ```
  Runs at `http://localhost:3000`

* **Development mode (restarts after code changes):**
  ```bash
  npm run dev
  ```

* **Reset / Seed Database:**
  ```bash
  npm run seed
  ```

---

## Endpoints

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

## Problems I faced

1. `sqlite3` uses a native addon. On Node 26, I installed its N-API prebuilt binary with `prebuild-install -r napi` to avoid building it locally.
2. The server needs an open database before requests arrive. `initializeDBAndServer()` waits for SQLite to open before calling `app.listen()`; it exits if opening the database fails.
3. I check for all four required fields before inserting a book. Incomplete POST requests receive a 400 response.
