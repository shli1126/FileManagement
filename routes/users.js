const express = require('express');
const router = express.Router();
const User = require('../models/User');
router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const newUser = new User({
        name: name,
        email: email,
        password: password
    })
    
    User.findOne({name: req.body.name}, (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data == null) {
            newUser.save((err, data) => {
                if (err) {
                    console.log(err)
                }
                console.log(data)
                console.log('new user')
                res.redirect('/users/login')
            })
        }
        else {
            console.log(data)
            console.log('name or email exist')
            res.redirect('/users/register')
        }
    })
})

router.post('/login', (req, res) => {
  
    User.findOne({name: req.body.name}, (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data == null) {
            res.redirect('/users/register')
        }
        else {
            if (data.password == req.body.password) {
                res.send('login successfully')
            }
            else {
                res.redirect('/users/login')
            }
        }
    })
})


module.exports = router; 