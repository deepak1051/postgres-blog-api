import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Blog from '../model/Blog.js';
import User from '../model/User.js';
import pool from '../db.js';

const getSingleBlogData = async (blog_id, user_id) => {
  const blog = await pool.query(
    'SELECT blogs.id,username,title,body,imageurl FROM blogs JOIN users ON users.id=blogs.user_id WHERE blogs.id=$1 ',
    [blog_id]
  );
  const _count_likes = await pool.query(
    'SELECT blog_id ,COUNT(*) FROM likes GROUP BY blog_id HAVING blog_id=$1;',
    [blog_id]
  );

  const isLiked = await pool.query(
    'SELECT * FROM likes WHERE blog_id=$1 AND user_id=$2',
    [blog_id, user_id]
  );

  const result = {
    ...blog.rows[0],
    like_count: parseInt(_count_likes.rows[0]?.count || 0),
    isLiked: isLiked.rows.length ? true : false,
  };

  return result;
};

const getBlogsByUser = asyncHandler(async (req, res) => {
  const blogs = await pool.query('SELECT * FROM blogs WHERE user_id=$1', [
    req.user.id,
  ]);
  res.status(200).json(blogs.rows);
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const allBlogs = await pool.query(
    'SELECT blogs.id,username,title,body,imageurl,created_at FROM blogs JOIN users ON users.id=blogs.user_id  '
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
  const result = await getSingleBlogData(req.params.id, req.user.id);

  res.status(200).json(result);
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
  const { blogId } = req.body;
  if (!blogId) {
    res.status(400);
    throw new Error('blogId is required');
  }

  const _blog = await pool.query('SELECT * FROM blogs WHERE id=$1', [blogId]);

  if (!_blog.rows.length) {
    res.status(401);
    throw new Error('Blog not found');
  }

  const isLiked = await pool.query(
    'SELECT * FROM likes WHERE blog_id=$1 AND user_id=$2',
    [blogId, req.user.id]
  );

  if (isLiked.rows.length) {
    // res.status(400);
    // throw new Error('Already liked blog by this user');
    await pool.query('DELETE FROM likes WHERE blog_id=$1 AND user_id=$2', [
      blogId,
      req.user.id,
    ]);
    return res.status(200).json('unliked blog');
  }

  const liked = await pool.query(
    'INSERT INTO likes (blog_id,user_id) VALUES($1,$2)',
    [blogId, req.user.id]
  );
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
