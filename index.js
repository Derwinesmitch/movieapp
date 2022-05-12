const express = require('express');
    morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser'),
    methodOverride = require('method-override');

let topMovies = [
    {
        title: 'Movie 1'
    },
    {
        title: 'Movie 2'
    },
    {
        title: 'Movie 3'
    },
    {
        title: 'Movie 4'
    },
    {
        title: 'Movie 5'
    },
    {
        title: 'Movie 6'
    },
    {
        title: 'Movie 7'
    },
];

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('stomething broke');
});

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Welcome to the app');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use('/documentation', express.static('public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
