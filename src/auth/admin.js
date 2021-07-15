import createError from 'http-errors';

export const adminOnly = (req, res, next) => {
  console.log('==================>', req.body, '<==================');
  if (req.role === 'Admin') {
    // if role is admin we can proceed to the request handler
    next();
  } else {
    // we trigger a 403 error
    next(createError(403, 'Admins only!'));
  }
};
