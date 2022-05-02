CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    salt TEXT,
    hash TEXT
);

CREATE TABLE data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    weight REAL
    owner INTEGER,
    FOREIGN KEY owner REFERENCES users (id) ON DELETE CASCADE
)