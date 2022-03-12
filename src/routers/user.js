const User = require('./../models/user');
const auth = require('./../middleware/auth');
const { sendWelcomeEmail, sendCancelationMail } = require('./../emails/account');
const multer = require('multer');
const sharp = require('sharp');
const express = require('express');
const router = new express.Router();

// create a user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }

    // user.save().then(() => {
    //     res.status(201).send(user);
    // }).catch((err) => {
    //     res.status(400).send(err);
    // });
});

// login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }
});

// logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();

        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
}); 

// logout user from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
}); 

// read profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

// update profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [ 'name', 'email', 'password', 'age' ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation)
        return res.status(400).send('Invalid updates!');

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(400).send(err);
    }
});

// delete profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationMail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (err) {
        res.status(500).send(err);
    }
});

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload an image'));
        
        cb(undefined, true);
    }
});
// upload avatar
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
                    .resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    
    await req.user.save();
    res.send(req.user);
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

// get avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar)
            throw new Error('Not found!');

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (err) {
        res.status(404).send(err);
    }
});

// delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(req.user);
});

// read users
// router.get('/users', auth, async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.send(users);
//     } catch (err) {
//         res.status(500).send(err);
//     }
//     // User.find({}).then(users => {
//     //     res.send(users);
//     // }).catch(err => {
//     //     res.status(500).send(err);
//     // });
// });

// read user
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user)
//             return res.status(404).send('User not found!');
//         res.send(user);
//     } catch (err) {
//         res.status(500).send(err);
//     }
//     // User.findById(_id).then(user => {
//     //     if (!user)
//     //         return res.status(404).send('User not found!');
//     //     res.send(user);
//     // }).catch(err => {
//     //     res.status(500).send(err);
//     // });
// });

// update user
// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = [ 'name', 'email', 'password', 'age' ];
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update));
//     if (!isValidOperation)
//         return res.status(400).send('Invalid updates!');
//     try {
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//         const user = await User.findById(req.params.id);
//         if (!user) 
//             return res.status(404).send('User not found!');
//         updates.forEach(update => user[update] = req.body[update]);
//         await user.save();
//         res.send(user);
//     } catch (err) {
//         res.status(400).send(err);
//     }
// });

// delete user
// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if (!user) 
//             return res.status(404).send('User not found!');
//         res.send(user);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// });

module.exports = router;