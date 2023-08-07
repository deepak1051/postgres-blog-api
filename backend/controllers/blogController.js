import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Blog from '../model/Blog.js';
import User from '../model/User.js';
import pool from '../db.js';

const getBlogsByUser = asyncHandler(async (req, res) => {
  const blogs = await pool.query('SELECT * FROM blogs WHERE user_id=$1', [
    req.user.id,
  ]);
  res.status(200).json(blogs.rows);
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const allBlogs = await pool.query(
    'SELECT username,title,body,imageurl,blogs.id FROM blogs JOIN users ON users.id=blogs.user_id'
  );

  res.status(200).json(allBlogs.rows);
});

const postBlog = asyncHandler(async (req, res) => {
  const { title, body, imageurl } = req.body;
  if (!title || !body || !imageurl) {
    res.status(400);
    throw new Error('Please add all fields.');
  }
  const blog = await pool.query(
    'INSERT INTO blogs(title,body,imageurl,user_id) VALUES($1,$2,$3,$4) RETURNING *',
    [title, body, imageurl, req.user.id]
  );

  res.status(201).json(blog.rows[0]);
});

const getSingleBlog = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const blog = await pool.query('SELECT * FROM blogs WHERE blogs.id=$1', [
    req.params.id,
  ]);

  if (!blog.rows.length) {
    res.status(400);
    throw new Error('The blog with the given ID was not found.');
  }
  res.status(200).json(blog.rows[0]);
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, body, imageurl } = req.body;
  if (!title || !body || !imageurl) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  const _blog = await pool.query('SELECT * FROM blogs WHERE blogs.id=$1', [id]);

  if (!_blog.rows.length) {
    res.status(401);
    throw new Error('The blog with the given ID was not found.');
  }

  if (_blog.rows[0].user_id !== req.user.id) {
    res.status(401);
    throw new Error('You are not authorized to do it');
  }

  const blog = await pool.query(
    'UPDATE blogs SET title=$1,body=$2,imageurl=$3 WHERE blogs.id=$4 RETURNING *',
    [title, body, imageurl, id]
  );

  if (!blog.rows.length) {
    res.status(404);
    throw new Error('The goal with the given ID was not found.');
  }

  res.status(200).json(blog.rows[0]);
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const _blog = await pool.query('SELECT * FROM blogs WHERE blogs.id=$1 ', [
    id,
  ]);

  if (!_blog.rows.length) {
    res.status(401);
    throw new Error('The goal with the given ID was not found.');
  }

  if (_blog.rows[0].user_id !== req.user.id) {
    res.status(401);
    throw new Error('You are not authorized to do it');
  }
  const blog = await pool.query(
    'DELETE FROM blogs WHERE blogs.id=$1 RETURNING *',
    [id]
  );

  if (!blog.rows.length) {
    res.status(400);
    throw new Error('The blog with the given ID was not found.');
  }
  res.status(200).json({ id: blog.rows[0].id });
});

const likeBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Please provide a valid mongoose ID');
  }

  const _blog = await Blog.findById(id);

  if (!_blog) {
    res.status(401);
    throw new Error('Blog not found');
  }

  const isLiked = _blog.likes.includes(req.user._id);
  if (isLiked) {
    const newBlog = _blog.filter((id) => id !== req.user._id);
    await newBlog.save();
  } else {
    const newBlog = _blog.likes.push(req.user._id);
    await newBlog.save();
  }

  res.status(200).json('liked blog');
});
export {
  getBlogsByUser,
  getAllBlogs,
  postBlog,
  updateBlog,
  deleteBlog,
  getSingleBlog,
  likeBlog,
};
