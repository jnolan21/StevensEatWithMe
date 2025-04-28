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

// Set up the handlebars instance
const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number')
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },

    // This just means that our handlebars partials are located in views/partials
    partialsDir: ['views/partials/']
  }
});

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Session middleware
app.use(
    session({
        name: "AuthenticationState", // Name of the session ID cookie
        secret: "some secret string!",
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 1000 * 60 * 60 * 1} // The session expires after 1 hour
    })
)


app.use(rewriteUnsupportedBrowserMethods);


/* ******************************* MIDDLEWARE ******************************* */
/* MIDDLEWARE FOR TESTING */
app.use((req, res, next) => {
  let date = new Date().toUTCString();
  let isLoggedIn;
  if (req.session.user) isLoggedIn = true;
  else isLoggedIn = false;

  if (isLoggedIn) {
      // User
      if (req.session.user.role === 'user')
          console.log(`[${date}]: ${req.method} ${req.path} (Authenticated User)`);
  }
  else console.log(`[${date}]: ${req.method} ${req.path} (Non-Authenticated)`);

  next();
});


/* GET users/profile */
app.use('/profile', (req, res, next) => {
  if (req.session.user) next(); // Authenticated user
  else return res.redirect('users/signup'); // Non-authenticated user
});

/* GET users/login */
app.use('/users/login', (req, res, next) => {
  if (req.session.user) return res.redirect('/profile'); // Authenticated user
  else next(); // Non-authenticated user
});

/* GET users/signup */
app.use('/users/signup', (req, res, next) => {
  if (req.session.user) return res.redirect('/profile'); // Authenticated user
  else next(); // Non-authenticated user
});

/* GET , POST /meetupPage */
app.use('/meetupPage', (req, res, next) => {
  if (!req.session.user) return res.redirect('/users/login'); // Non-authenticated user
  else next(); // Authenticated user
});

/* ******************************* MIDDLEWARE ******************************* */



app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log('Your routes will be running on http://localhost:3000');
});
