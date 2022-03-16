require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const express = require('express');
const app = express();

// Maintenance mode
// app.use((req, res, next) => {
//     res.status(503).send('The site is under maintenance, pls try later.');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;