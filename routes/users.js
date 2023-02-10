const express = require('express');
const router = express.Router();
const User = require('../models/User');
const File = require('../models/File');
const bcrypt = require('bcrypt')
const fs = require('fs');
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
var ObjectId = require('mongodb').ObjectID;

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
   
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword
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
                //console.log(data)
                console.log('new user')
                res.redirect('/users/login')
            })
        }
        else {
            //console.log(data)
            console.log('name or email exist')
            res.redirect('/users/register')
        }
    })
})


//***try to display all current user's file in the file.ejs page immediately after log in***
router.post('/login', (req, res) => {
    currentUsername = req.body.name;
    User.findOne({name: req.body.name}, async (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data == null) {
            res.redirect('/users/register')
        }
        else {
            if (await bcrypt.compare(req.body.password, data.password)) {
                let filesNames = []
                let fileIDs = []
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
    //console.log(currentUserDic)
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

// delete a file from the user's filelogs, delete a file from the file database
router.post("/file/delete", (req, res) => {
    const fileId = currentUserDic[req.body.fileName];
    File.findOne({ "_id" : fileId }, (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data.length == 0) {
            res.send("No such file")
            return
        }
        else {
            //console.log(data)
            fs.unlink(data.path, (err) => {
                if (err) {
                    console.log(err)
                }
                console.log("Delete from dir");
            });
        }
    })
    File.deleteOne({ "_id" : fileId }, (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data.deletedCount == 0) {
            console.log("No such file after using find to check")
        }
        else {
            User.find( {name: currentUsername }, async (err, result) => {
                if (err) {
                    console.log(err)
                }
                let fileIDs = []
                let user = result[0];
                let objectIdList = user['fileIDlogs']
                let updatedobjectIdList = []
                for (let i = 0; i < objectIdList.length; i++) {
                    fileIDs.push(objectIdList[i].toString())
                }
                for(let i = 0; i < fileIDs.length; i++){ 
                    if (fileIDs[i] === fileId) { 
                        fileIDs.splice(i, 1); 
                    }
                }
                for(let i = 0; i < fileIDs.length; i++){ 
                    updatedobjectIdList.push(new ObjectId(fileIDs[i]))
                }
                await User.updateOne({ name: currentUsername },{$set: {'fileIDlogs':  updatedobjectIdList }})
                res.send("Deleted successfully")
            })
        }
    })
})




module.exports = router; 