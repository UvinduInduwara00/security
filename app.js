require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt, {
    secret: process.env.SECRET,
    encryptedFields: ["password"]
});




const User = mongoose.model('User', userSchema);

app.route('/')
    .get(function (req, res) {
        res.render('home');
    });
app.route('/register')
    .get(function (req, res) {
        res.render('register');
    })
    .post(function (req, res) {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        })
        newUser.save()
            .then(result => {
                    res.render('secrets');
            })
            .catch(err => {
                res.send(err);
            });
    });

app.route('/login')
    .get(function (req, res) {
        res.render('login');
    })
    .post(function (req, res) {
        User.findOne({ email: req.body.username })
            .then(result => {
                if (!result) {
                    res.send("username not found!");
                } else {
                    if (result.password === req.body.password) {
                        res.render('secrets');
                    } else {
                        res.send("wrong password!");
                    }
                }
            })
            .catch(err => {
                res.send(err);
            });
    });







app.listen(3000, function () {
    console.log("server is running on port 3000");
});