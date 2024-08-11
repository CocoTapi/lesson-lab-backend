import express, { Request, Response, NextFunction } from 'express';
import bodyParser from "body-parser";
import authRoutes from './auth/authRoutes';
import activityRoutes from './activities/activityRoutes';
import tagRoutes from './tags/tagRoutes';
import userRoutes from './user/userRoutes';
import testRoutes from './test-routes/testRoutes';
const cors = require('cors');

const app = express();
const SERVER_PORT = process.env.SERVER_PORT;

const allowedOrigins = [
    'http://localhost:3000', // Development origin
    'https://cocotapi.github.io', // Production origin
];

const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Enable sending of cookies
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

//CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.use(authRoutes);
app.use('/activities', activityRoutes);
app.use('/tags', tagRoutes);
app.use('/user', userRoutes);
app.use('/test', testRoutes);

// Custom error handling middleware
app.use((error: any, _req: any, res: any, _next: any) => {
    console.log(error)
    const status = error.status || 500;
    const message = error.message || 'Something went wrong.';
    res.status(status).json({ error: message })
})

// Handle unknown routes
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`)
});
