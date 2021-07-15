import mongoose from 'mongoose';

// {
//   "category": "new article",
//   "title": "BLOG 10",
//   "cover":"something else",
//   "readTime": {
//     "value": 1,
//     "unit": "minute"
//   },
//   "author": {
//     "name": "new author",
//     "avatar":"something different"
//   },
//     "content": "HTML"
// }

const { Schema, model } = mongoose; // Schema is the structure, Model handles the interaction with db e.g. BlogModel.find()

const CommentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    comment: { type: String, required: true },
    rate: {
      type: Number,
      min: [1, 'Minimum rating of 1!'],
      max: [5, 'Maximum rating of 5!'],
      default: 1,
    },
  },
  { timestamps: true }
);

const BlogsSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    readTime: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Author',
    },
    content: {
      type: String,
      required: true,
    },
    comments: { default: [], type: [CommentSchema] },
  },
  { timestamps: true }
);

export default model('Blog', BlogsSchema);
