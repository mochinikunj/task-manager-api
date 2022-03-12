require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const express = require('express');
const app = express();

const port = process.env.PORT;

// Maintenance mode
// app.use((req, res, next) => {
//     res.status(503).send('The site is under maintenance, pls try later.');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server running at port:', port);
});