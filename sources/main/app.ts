import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
const bodyParser = require('body-parser');

dotenv.config();

const app: Express = express();
app.use(bodyParser.json());

app.get('/', async (req: Request, res: Response) => {
  	res.send('Books microservice');
});

import createRoute from './routes/Create';
app.use('/create', createRoute)
import utilityRoute from './routes/Utility';
app.use('/utility', utilityRoute)
import removeRoute from './routes/Remove';
app.use('/remove', removeRoute)


export = app;