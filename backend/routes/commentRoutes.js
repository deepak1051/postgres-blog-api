import express from 'express';
import {
  createComment,
  deleteComment,
  getComments,
} from '../controllers/commentController.js';
import protect from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/:blogId', protect, createComment);
router.get('/:blogId', protect, getComments);
router.delete('/:commentId', protect, deleteComment);
export default router;
