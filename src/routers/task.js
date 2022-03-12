const Task = require('./../models/task');
const auth = require('./../middleware/auth');
const express = require('express');
const router = new express.Router();

// create a task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }

    // task.save().then(() => {
    //     res.status(201).send(task);
    // }).catch(err => {
    //     res.status(400).send(err);
    // });
});

// read /tasks?completed=true       -> filtering data 
// read /tasks?limit=10&skip=10     -> paginating data
// read /tasks?sortBy=createdAt:asc -> sorting data
router.get('/tasks', auth, async (req, res) => {
    const match = { owner: req.user._id };
    const sort = {};

    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : null;
    const skip = parseInt(req.query.skip) ? parseInt(req.query.skip) : null;

    if (req.query.completed)
        match.completed = req.query.completed === 'true';

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
    }

    try {
        const tasks = await Task.find(match).limit(limit).skip(skip).sort(sort);
        // await req.user.populate({
        //     path: 'tasks',
        //     match,
        //     option: {
        //         limit: parseInt(req.query.limit),
        //         skip: parseInt(req.query.skip),
        //         sort
        //     }
        // }).execPopulate();
        res.send(tasks);
    } catch (err) {
        res.status(500).send(err);
    }

    // Task.find({}).then(tasks => {
    //     res.send(tasks);
    // }).catch(err => {
    //     res.status(500).send(err);
    // });
});

// read task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) 
            return res.status(404).send('Task not found!');

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }

    // Task.findById(_id).then(task => {
    //     if (!task)
    //         return res.status(404).send('Task not found!');
    //     res.send(task);
    // }).catch(err => {
    //     res.status(500).send(err);
    // });
});

// update task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [ 'description', 'completed' ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation)
        return res.status(400).send('Invalid update!');
    
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        const task = await Task.findOne({ 
            _id: req.params.id, 
            owner: req.user._id 
        });
        
        if (!task)
            return res.status(404).send('Task not found!');

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

// delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task)
            return res.status(404).send('Task not found!');

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;