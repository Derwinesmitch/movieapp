const express = require('express'),
    app = express(),
    uuid = require('uuid'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');

app.use(bodyParser.json());



app.use(morgan('common'));

let movies = [
    {
        "Title": 'Movie1',
        "Genre": {
            "Name":"Drama"},
        "Director": {
            "Name":'hector'
        } 
    },
    {
        "Title": 'Movie2',
        "Genre": {
            "Name":"Comedy"},
        "Director": {
            "Name":'Jorge',
            "Description":'He is a funny specialist'
        } 
    }
];


let users = [
    {
        id: 1,
        name: "Juan",
        favouriteMovies: ["The Fountain"]
    },
]


app.post('/users', (req, res) =>{
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('users need name')
    }

})


app.put('/users/:id', (req, res) =>{
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id ==id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user')
    }

})


app.post('/users/:id/:movieTitle', (req, res) =>{
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id ==id);

    if (user) {
        user.favouriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}s array`);
    } else {
        res.status(400).send('no such user')
    }

})

app.delete('/users/:id/:movieTitle', (req, res) =>{
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id ==id);

    if (user) {
        user.favouriteMovies = user.favouriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been deleted from user ${id}s array`);
    } else {
        res.status(400).send('no such user')
    }

})

app.delete('/users/:id', (req, res) =>{
    const { id } = req.params;

    let user = users.find( user => user.id ==id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`user ${id} has been deleted`);
    } else {
        res.status(400).send('no such user')
    }

})


app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
    const { title } =   req.params
    const movie = movies.find( movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('no movie found')  
    }
});

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } =   req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('no movie under that genre')  
    }
});

app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } =   req.params;
    const director = movies.find( movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('no director found')  
    }
});


app.use('/documentation', express.static('public'));

app.listen(8080, () => 
    console.log('Your app is listening on port 8080.'));
