const express = require('express');
const session = require('express-session');
const routes = require('./routes');
const api_routes = require('./api-routes');
const PORT = 3000;

// configure express
const app = express();

// map the public static files such as js and css
app.use(express.static('public'));

// map the session middleware
app.use(session({
    secret: 'my super secret password',
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge: 120000, httpOnly: false, secure: false }
}));

// parse application/json
app.use(express.json());

// load the routes
app.use('/', routes);
app.use('/api', api_routes);

app.listen(PORT, () => {
  console.log(`Places To Stay Application is listening on port ${PORT} (http://localhost:${PORT})`)
})