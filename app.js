import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import {config} from 'dotenv';

// Set up .env file for use
config();

// Middleware that supports form overrides
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }
    // Run the next middleware
    next();
}

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Session middleware
app.use(
    session({
        name: "AuthCookie", // Name of the session ID cookie
        secret: process.env.SESSION_SECRET || "some secret string!",
        resave: false,
        saveUninitialized: true,
        cookie: {maxAge: 1000 * 60 * 60 * 1} // The session expires after 1 hour
    })
)


app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log('Your routes will be running on http://localhost:3000');
});
