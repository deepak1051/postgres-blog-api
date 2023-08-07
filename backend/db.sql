CREATE DATABASE pernblog;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE blogs(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  body TEXT,
  imageurl VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id)
);

CREATE TABLE comments(
  id SERIAL PRIMARY KEY,
  text VARCHAR(255),
  user_id INTEGER REFERENCES users(id),
  blog_id INTEGER REFERENCES blogs(id)
);