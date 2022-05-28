const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies =Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});

    
const express = require('express'),
    app = express(),
    uuid = require('uuid'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(morgan('common'));


app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if(user) {
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users
                .create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) =>{res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error:' + error);
    });
});

app.get('/users', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username})
    .then((user) => {
        res.json(user);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    })
});

app.get('/movies/genre/:Name', (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })   
   .then((genre) => {
       res.json(genre);
   })
   .catch((err) => {
       console.error(err);
       res.status(400).send('no movie under that genre')
   });
});

app.get('/movies', passport.authenticate('jwt', { session: false}), (req, res) => {
    Movies.find()
        .then((movies) => {
         res.status(200).json(movies);   
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        })
});

app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err)
    });
});


app.get('/movies/directors/:Name', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name})
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
    });    
});



app.put("/users/:Username", (req, res) => {
    Users.findOneAndUpdate(
        {Username: req.params.Username},
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birth: req.body.Birth,
            },
        },
        { new: true},
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error: " + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});



app.post("/users/:Username/Movies/:MovieID", (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $push: { FavouriteMovies: req.params.MovieID}
        },
        { new: true },
        (err, updateUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updateUser);
            }
        });
});

app.delete("/users/:Username/Movies/:MovieID", (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $pull: { FavouriteMovies: req.params.MovieID}
        },
        { new: true },
        (err, updateUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updateUser);
            }
        });
});

app.delete('/users/:Username', (req, res) =>{
    Users.findOneAndRemove({ Username: req.params.Username})
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + 'was deleted');
        }
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


app.use('/documentation', express.static('public'));

app.listen(8080, () => 
    console.log('Your app is listening on port 8080.'));
