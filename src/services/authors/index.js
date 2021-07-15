import express from 'express';
import createError from 'http-errors';
import AuthorsModel from './schema.js';
import { adminOnly } from '../../auth/admin.js';
import { JWTAuthMiddleware } from '../../auth/middlewares.js';
import { JWTAuthenticate } from '../../auth/tools.js';

const authorsRouter = express.Router();

authorsRouter.post('/register', async (req, res, next) => {
  try {
    const newAuthor = new AuthorsModel(req.body);
    const { _id } = await newAuthor.save();
    console.log(newAuthor);
    res.status(201).send({ _id });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      next(createError(400, error));
    } else {
      next(createError(500, 'An error occurred while saving author'));
    }
  }
});

authorsRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1. Verify credentials
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      // 2. Generate token if credentials are ok
      const accessToken = await JWTAuthenticate(author);
      // 3. Send token as a response
      res.send({ accessToken });
    } else {
      next(createError(401, 'You are unauthorized'));
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.get('/', JWTAuthMiddleware, adminOnly, async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get('/me', JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.body);
    // res.send(req.user);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put('/me', JWTAuthMiddleware, async (req, res, next) => {
  try {
    // const author = await AuthorsModel.findByIdAndUpdate(req.user._id, req.body, {
    //   runValidators: true,
    //   new: true,
    // });
    // if (author) {
    //   res.send(author);
    // } else {
    //   next(createError(404, `author ${req.params.id} not found`));
    // }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while modifying user'));
  }
});

authorsRouter.delete('/me', JWTAuthMiddleware, async (req, res, next) => {
  try {
    // await req.user.deleteOne();
  } catch (error) {
    next(error);
  }
});

// authorsRouter.post('/', async (req, res, next) => {
//   try {
//     const newAuthor = new AuthorsModel(req.body); // validate body coming from postman
//     console.log(req.body);

//     const { _id } = await newAuthor.save();

//     res.status(201).send(_id);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });

authorsRouter.get('/', async (req, res, next) => {
  try {
    const authors = await AuthorsModel.find();
    // .populate({
    //   path: 'author',
    //   select: 'name surname avatar',
    // });
    res.send(authors);
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while getting blogs'));
  }
});

authorsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const author = await AuthorsModel.findById(id).populate({
      path: 'author',
      select: 'name surname avatar',
    });
    if (author) {
      res.send(author);
    } else {
      next(createError(404, `blog ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while getting blog'));
  }
});

// authorsRouter.put('/:id', async (req, res, next) => {
//   try {
//     const modifiedAuthor = await AuthorsModel.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         runValidators: true,
//         new: true,
//       }
//     );
//     if (modifiedAuthor) {
//       res.send(modifiedAuthor);
//     } else {
//       next(createError(404, `blog ${req.params.id} not found`));
//     }
//   } catch (error) {
//     console.log(error);
//     next(createError(500, 'An error occurred while updating blog'));
//   }
// });

authorsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleteAuthor = await AuthorsModel.findByIdAndDelete(req.params.id);
    if (deleteAuthor) {
      res.send('Blog has been DELETED');
    } else {
      next(createError(404, `blog ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, 'An error occurred while deleting blog'));
  }
});

export default authorsRouter;
