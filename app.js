require("dotenv").config()
const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const app = express(); 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
const db = process.env.DATABASE_URL;
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('Mongo connected...'))
    .catch(err => console.log(err));

app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));