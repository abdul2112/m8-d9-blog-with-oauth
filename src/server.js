import express from 'express';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';
import mongoose from 'mongoose';
import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  catchAllErrorHandler,
  unauthorizedHandler,
} from './errorHandlers.js';
import blogsRouter from './services/blogs/index.js';
import authorsRouter from './services/authors/index.js';

const server = express();

const port = process.env.PORT || 3001;

// ******** MIDDLEWARES ************

server.use(express.json());
server.use(cors());

// ******** ROUTES ************

server.use('/blogs', blogsRouter);
server.use('/authors', authorsRouter);

// ******** ERROR MIDDLEWARES ************

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(unauthorizedHandler);
server.use(catchAllErrorHandler);

console.table(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB 🌵');
    server.listen(port, () => {
      console.log('Server listening on port', port, '✅');
    });
  })
  .catch((err) => console.log(err));
