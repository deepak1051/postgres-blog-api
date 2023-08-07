import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please add a email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
});

const User = mongoose.model('User', userSchema);
export default User;
