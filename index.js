const express = require('express'),
    bodyParser = require('body-parser'),   
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    Models = require('./models.js');    

const { check, validationResult } = require('express-validator');

const Movies =Models.Movie,
      Users = Models.User,
      app = express();

const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(morgan('common'));
const Genres = Models.Genre;
const Directors = Models.Director; 

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect( process.env.CONNECTION_URI, {  useNewUrlParser: true, useUnifiedTopology: true });

app.post('/users', 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not apepar to be valid').isEmail()
], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if(user) {
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users
                .create({
                    Username: req.body.Username,
                    Password: hashedPassword,
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

app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOne({ Username: req.params.Username})
    .then((user) => {
        res.json(user);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    })
});

app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
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

app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err)
    });
});


app.get('/movies/directors/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name})
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
    });    
});



app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
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
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        }
    );
});



app.post('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
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

app.delete('/users/:Username/Movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
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

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) =>{
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' +port);
});
