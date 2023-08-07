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

  const comments = await pool.query('SELECT * FROM comments WHERE blog_id=$1', [
    blogId,
  ]);

  res.status(200).json(comments.rows);
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId, blogId } = req.params;

  const _comment = await pool.query('SELECT * FROM comments WHERE id=$1', [
    commentId,
  ]);

  if (!_comment.rows.length) {
    res.status(401);
    throw new Error('comment not found');
  }

  if (_comment.user_id !== req.user.id) {
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
