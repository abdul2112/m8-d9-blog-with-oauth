import bcrypt from 'bcrypt';

const plainPassword = '0123456789';
const plainPassword2 = '1234';

console.time('bcrypt');
const hash = bcrypt.hashSync(plainPassword, 10);
console.timeEnd('bcrypt');

console.log(hash);

const isEqual = bcrypt.compareSync(plainPassword, hash);
const isEqual2 = bcrypt.compareSync(plainPassword2, hash);

console.log(isEqual);
console.log(isEqual2);
