import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import mongooseUniqueValidator from 'mongoose-unique-validator';

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // dateOfBirth: { type: Date, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Admin', 'User'] },
    // avatar: {
    //   type: String,
    //   required: true,
    //   default: 'https://ui-avatars.com/api/?name=Unnamed+User',
    // },
  },
  { timestamps: true }
);
authorSchema.plugin(mongooseUniqueValidator);
authorSchema.pre('save', async function (next) {
  const newAuthor = this;

  const plainPassword = newAuthor.password;
  if (newAuthor.isModified('password')) {
    newAuthor.password = await bcrypt.hash(plainPassword, 10);
  }
  next();
});

authorSchema.methods.toJSON = function () {
  // toJSON is a method called every time express does a res.send

  const author = this;
  const authorObject = author.toObject();
  // delete authorObject.password;
  delete authorObject.__v;
  delete authorObject.avatar;
  delete authorObject.dateOfBirth;
  delete authorObject.createdAt;
  delete authorObject.updatedAt;
  return authorObject;
};

authorSchema.statics.checkCredentials = async function (email, plainPassword) {
  // 1. find user in db by email
  const author = await this.findOne({ email });
  if (author) {
    // 2. compare plainPassword with hashedPassword
    const hashedPassword = author.password;
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    // 3. return a meaningful response
    if (isMatch) return author;
    else return null;
  } else {
    return null;
  }
};

authorSchema.post('validate', function (error, doc, next) {
  if (error) {
    const err = createError(400, error);
    next(err);
  } else {
    next();
  }
});

export default model('Author', authorSchema);
