import asyncHandler from 'express-async-handler';

import pool from '../db.js';

const createComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { blogId } = req.params;

  if (!text) {
    res.status(400);
    throw new Error('Please add a comment text.');
  }

  const comment = await pool.query(
    'INSERT INTO comments(text,user_id,blog_id) VALUES($1,$2,$3) RETURNING *',
    [text, req.user.id, blogId]
  );

  res.status(201).json(comment.rows[0]);
});

const getComments = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  const comments = await pool.query(
    'SELECT text,username,comments.blog_id,comments.id,created_at FROM comments  JOIN users ON users.id=comments.user_id  WHERE blog_id=$1',
    [blogId]
  );

  res.status(200).json(comments.rows);
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    console.log('first');
    res.status(404);
    throw new Error('comment id is not provided.');
  }
  console.log(commentId);

  const _comment = await pool.query('SELECT * FROM comments WHERE id=$1', [
    parseInt(commentId),
  ]);

  if (!_comment.rows.length) {
    res.status(401);
    throw new Error('comment not found');
  }

  console.log(_comment.rows);
  console.log(req.user);

  if (parseInt(_comment.rows[0].user_id) !== parseInt(req.user.id)) {
    res.status(401);
    throw new Error('You are not authorized to do it');
  }

  const comment = await pool.query(
    'DELETE FROM comments WHERE id=$1 RETURNING *',
    [commentId]
  );

  res.status(200).json({ id: comment.rows[0].id });
});

export { createComment, getComments, deleteComment };
