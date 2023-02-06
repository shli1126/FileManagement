const express = require('express');
const router = express.Router();
const User = require('../models/User');
const File = require('../models/File');

const multer = require("multer")
const upload = multer({ dest: "uploads" })
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
//router.set('view engine', 'ejs');

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/file', (req, res) => res.render('file'));
router.get('/upload', (req, res) => res.render('upload'));
router.get('/download', (req, res) => res.render('download'));

var currentUsername;
var currentUserDic = {};


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


//***try to display all current user's file in the file.ejs page immediately after log in***
router.post('/login', (req, res) => {
    currentUsername = req.body.name;
    User.findOne({name: req.body.name}, (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data == null) {
            res.redirect('/users/register')
        }
        else {
            if (data.password == req.body.password) {
                var filesNames = []
                var fileIDs = []
                User.find( {name: req.body.name }, async (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                    let user = result[0];
                    let objectIdList = user['fileIDlogs']
                    for (let i = 0; i < objectIdList.length; i++) {
                        fileIDs.push(objectIdList[i].toString())
                    }
                    for (let j = 0; j < fileIDs.length; j++) {
                        let fileObject = await File.findById(fileIDs[j])
                        let name = fileObject['fileName']
                        currentUserDic[name] = fileIDs[j];
                        filesNames.push(name);
                    }
                    res.render("file", { userFileList: filesNames, userName: currentUsername })
                })
            }
            else {
                res.redirect('/users/login')
            }
        }
    })
})

//upload, submite current user's file
router.post("/file/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        fileName: req.file.originalname
    }
    const file = await File.create(fileData)
    User.findOneAndUpdate({ name: currentUsername }, 
        { $push: {fileIDlogs: file._id} }, (err, data) => {
        if (err){
          console.log(err);
        }
    });
    res.send('Uploaded successfully')
})  
    

// dowload, download the specificed file
router.post("/file/download", async (req, res) => {
    const fileId = currentUserDic[req.body.fileName];
    if (fileId.length != 24) {
        res.send(`<h2 style="color:red">Wrong id</h2>`)
        return
    }
    const file = await File.findById(fileId)
    if (file != null) {
        await file.save()
        res.download(file.path, file.fileName)
    }
    else {
        res.send(`<h2 style="color:red">Wrong id</h2>`)
    }
    
})

module.exports = router; 