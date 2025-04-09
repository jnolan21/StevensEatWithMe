import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import {config} from 'dotenv';

// Set up .env file for use
config();

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.metho = req.body._method;
        delete req.body._method;
    }
    // Run the next middleware
    next();
}

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  
});