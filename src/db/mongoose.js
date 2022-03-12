const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);

// const me = new User({
//     name: 'Test3',
//     email: 'test3@test.com ',
//     password: 'Test1234',
//     age: 25
// });
// me.save().then(() => {
//     console.log(me);
// }).catch(e => {
//     console.log(e);
// }).finally(() => {
//     mongoose.connection.close();
// });

// const myTask = new Task({
//     description: ' Read Bhagwad Gita'
// });
// myTask.save().then(() => {
//     console.log(myTask);
// }).catch(err => {
//     console.log(err);
// }).finally(() => {
//     mongoose.connection.close();
// });