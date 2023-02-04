const express = require('express');
const router = express.Router();
const User = require('../models/User');
const File = require('../models/File')

const multer = require("multer")
const upload = multer({ dest: "uploads" })
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));


router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/file', (req, res) => res.render('file'));
router.get('/upload', (req, res) => res.render('upload'));
router.get('/download', (req, res) => res.render('download'));


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
                res.redirect('/users/file')
            }
            else {
                res.redirect('/users/login')
            }
        }
    })
})


router.post("/upload", upload.single("file"), async (req, res) => {
    console.log(req.body)
    const fileData = {
        path: req.file.path,
        fileName: req.file.originalname
    }
    const file = await File.create(fileData)
    console.log(file._id)
    
    res.send(`<h1>Use this file id to download: <h2 style="color:blue">${file._id}</h2></h1>`)
})  
    

router.post("/download", async (req, res) => {
    const fileId = req.body.fileId
    if (fileId.length != 24) {
        res.send(`<h2 style="color:red">Wrong id</h2>`)
        return
    }
    else {
        const file = await File.findById(fileId)
        if (file != null) {
            await file.save()
            res.download(file.path, file.fileName)
        }
        else {
            res.send(`<h2 style="color:red">Wrong id</h2>`)
        }
    }
})

module.exports = router; 