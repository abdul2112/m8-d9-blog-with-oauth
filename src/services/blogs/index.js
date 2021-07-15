import express from 'express';
import createError from 'http-errors';
import BlogModel from './schema.js';

const blogsRouter = express.Router();

export default blogsRouter;

blogsRouter.post('/', async (req, res, next) => {
  try {
    const newBlog = new BlogModel(req.body); // validate body coming from postman
    console.log(req.body);

    const { _id } = await newBlog.save();

    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await BlogModel.find().populate({
      path: 'author',
      select: 'name surname avatar',
    });
    res.send(blogs);
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while getting blogs'));
  }
});

blogsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const blog = await BlogModel.findById(id).populate({
      path: 'author',
      select: 'name surname avatar',
    });
    if (blog) {
      res.send(blog);
    } else {
      next(createError(404, `blog ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while getting blog'));
  }
});

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const modifiedBlog = await BlogModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (modifiedBlog) {
      res.send(modifiedBlog);
    } else {
      next(createError(404, `blog ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while updating blog'));
  }
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleteBlog = await BlogModel.findByIdAndDelete(req.params.id);
    if (deleteBlog) {
      res.send('Blog has been DELETED');
    } else {
      next(createError(404, `blog ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while deleting blog'));
  }
});

////////////////
/// COMMENTS ///
////////////////

blogsRouter.post('/:id/comments', async (req, res, next) => {
  try {
    const commentToInsert = { ...req.body, date: new Date() };

    const updatedBlog = await BlogModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: commentToInsert,
        },
      },
      { runValidators: true, new: true }
    );
    if (updatedBlog) {
      res.send(updatedBlog.comments[updatedBlog.comments.length - 1]._id);
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogsRouter.get('/:id/comments', async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (blog) {
      res.send(blog.comments);
    } else {
      next(createError(404, `comments ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while getting comments'));
  }
});

blogsRouter.get('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogModel.findOne(
      {
        _id: req.params.id,
      },
      {
        comments: {
          $elemMatch: { _id: req.params.commentId },
        },
      }
    );
    if (blog) {
      const { comments } = blog;
      if (comments && comments.length > 0) {
        res.send(comments[0]);
      } else {
        next(
          createError(404, `Comment with id ${req.params.commentId} not found`)
        );
      }
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while getting comment'));
  }
});

blogsRouter.put('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogModel.findOneAndUpdate(
      {
        _id: req.params.id,
        'comments._id': req.params.commentId,
      },
      {
        $set: {
          'comments.$._id': req.params.commentId,
          'comments.$.author': req.body.author,
          'comments.$.comment': req.body.comment,
          'comments.$.rate': req.body.rate,
          'comments.$.date': new Date(),
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (blog) {
      res.send(
        blog.comments.find((c) => c._id.toString() === req.params.commentId)
      );
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogsRouter.delete('/:id/comments/:commentId', async (req, res, next) => {
  try {
    const blog = await BlogModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: { _id: req.params.commentId },
        },
      },
      {
        new: true,
      }
    );
    if (blog) {
      res.send(`Comment with id ${req.params.commentId} has been DELETED`);
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});
