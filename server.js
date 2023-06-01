// Including the necessary modules
const express = require('express');  // Express.js for creating the server
const cors = require("cors");  // CORS for handling Cross-Origin Requests
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mongodb = require('mongodb');  // MongoDB driver for Node.js
const { MongoClient, GridFSBucket } = require('mongodb');  // MongoClient for MongoDB connection, GridFSBucket for storing larger files
require('dotenv').config();  // For reading environment variables
const { fetchInstagramAndSaveToGridFS } = require('./instaFetch');  // Importing the function to fetch Instagram data and save to MongoDB
const { getInsightData } = require('./ChessPage/fetchChessStats');
const { userInformation } = require('./ChessPage/getUserInfo');



const app = express();
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
app.use(express.json());  // Middleware to parse JSON bodies

// Connecting to MongoDB
const uri = process.env.MONGO_URI;  // Get MongoDB connection URI from environment variables
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        const db = client.db('myDatabase');  // Connect to 'myDatabase'
        const gfs = new GridFSBucket(db);  // Initialize GridFS for storing large files

        app.listen(3000, () => {  // Start the server on port 3000
            console.log('Server is running on port 3000');
        });

        // Endpoint to fetch Instagram data and save to MongoDB
        // app.get('/fetchInstagram', async (req, res) => {
        //     try {
        //         const posts = await fetchInstagramAndSaveToGridFS(gfs);
        //         console.log(posts)
        //         res.status(200).json({ message: 'Instagram data fetched and saved successfully!', posts });
        //     } catch (error) {
        //         console.error('Error fetching and saving Instagram data:', error);
        //         res.status(500).json({ message: 'Error fetching and saving Instagram data', error: error.message });
        //     }
        // });
        // Endpoint to fetch Instagram data and save to MongoDB
        app.get('/fetchInstagram', async (req, res) => {
            try {
                // const bucket = new GridFSBucket(db);
                // await bucket.drop();  // Delete all old images first

                const posts = await fetchInstagramAndSaveToGridFS(gfs);
                // console.log(posts)
                res.status(200).json({ message: 'Instagram data fetched and saved successfully!', posts });
            } catch (error) {
                console.error('Error fetching and saving Instagram data:', error);
                res.status(500).json({ message: 'Error fetching and saving Instagram data', error: error.message });
            }
        });

        // Endpoint to get list of images stored in MongoDB
        app.get('/images', async (req, res) => {
            try {
                const files = await gfs.find({}).toArray();  // Find all files
                const imageFiles = files.filter(file => file.filename.endsWith('.jpg'));  // Filter only images
                const filenames = imageFiles.map(file => file.filename);  // Map to file names
                res.status(200).json({ filenames });
            } catch (error) {
                console.error('Error fetching image list:', error);
                res.status(500).json({ message: 'Error fetching image list', error: error.message });
            }
        });

        // Endpoint to delete all images stored in MongoDB
        app.delete('/deleteAllImages', async (req, res) => {
            try {
                const bucket = new GridFSBucket(db);
                await bucket.drop();  // Drop the GridFS bucket, effectively deleting all files
                res.status(200).json({ message: 'All images deleted successfully' });
            } catch (error) {
                console.error('Error deleting all images:', error);
                res.status(500).json({ message: 'Error deleting all images', error: error.message });
            }
        });
        
        // Endpoint to serve an image with a specific filename
        app.get('/image/:filename', async (req, res) => {
            try {
                const filename = req.params.filename;
                const bucket = new GridFSBucket(db);
        
                const file = await db.collection('fs.files').findOne({ filename: filename });
        
                if (!file) {
                    res.status(404).json({ message: 'Image not found' });
                    return;
                }
        
                const contentType = file.contentType || 'application/octet-stream';
                res.set('Content-Type', contentType);
        
                const readStream = bucket.openDownloadStreamByName(filename);
                readStream.pipe(res);
        
                readStream.on('error', (error) => {
                    console.error('Error streaming image:', error);
                    res.status(500).json({ message: 'Error streaming image', error: error.message });
                });
            } catch (error) {
                console.error('Error fetching image:', error);
                res.status(500).json({ message: 'Error fetching image', error: error.message });
            }
        });

        // Endpoint to fetch user data and insights from chess.com
// Endpoint to fetch user data and insights from chess.com
    app.get('/userData/:username', async (req, res) => {
        try {
            const username = req.params.username; // Get username from URL parameters

            const userInfo = await userInformation(username);
            
            // If user is valid, then proceed to fetch insight data
            const insightData = await getInsightData(username);

            const data = {
                userInfo: userInfo,
                insightData: insightData,
            };

            res.status(200).json(data);  // Return data as JSON
        } catch (error) {
            // console.error('Error fetching user data and insights:', error);
            if (error.message.includes('Username not found')) {
                return res.status(404).json({ message: 'Username not found' });
            }
            res.status(500).json({ message: 'Error fetching user data and insights', error: error.code });
        }
    });

    app.post('/signup', async (req, res) => {
        try {
            console.log(req.body)
            const { username, password } = req.body;
    
            // Check if the username already exists
            const existingUser = await db.collection('users').findOne({ username });
    
            if (existingUser) {
                // If the username already exists, send a conflict error
                return res.status(409).json({ message: 'Username already exists' });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { 
                username, 
                hashedPassword, 
                puzzlesSolved: 0, 
                registrationDate: new Date(), 
                loginDates: []
            };            
            await db.collection('users').insertOne(newUser);
            res.status(201).json({ message: 'User created!' });
        } catch (err) {
            console.error('Error creating user:', err);
            res.status(500).json({ message: 'Error creating user', error: err.message });
        }
    });
    

    app.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await db.collection('users').findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const validPassword = await bcrypt.compare(password, user.hashedPassword);
            if (!validPassword) {
                return res.status(403).json({ message: 'Invalid password' });
            }
            const currentDate = new Date().toDateString();
            if (!user.loginDates.includes(currentDate)) {
                await db.collection('users').updateOne(
                    { username }, 
                    { $push: { loginDates: currentDate } }
                );
                user.loginDates.push(currentDate);
            }
            const token = jwt.sign({ userId: user._id }, 'HAHALOGIN');
            res.status(200).json({ 
                message: 'Logged in!', 
                token,
                userInfo: {
                    username: user.username,
                    puzzlesSolved: user.puzzlesSolved,
                    registrationDate: user.registrationDate,
                    loginDates: user.loginDates
                }
            });
        } catch (err) {
            console.error('Error logging in:', err);
            res.status(500).json({ message: 'Error logging in', error: err.message });
        }
    });
    
    

    // middleware to verify token
    const verifyToken = (req, res, next) => {
        const bearerHeader = req.headers['authorization'];
        if(typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(' ')[1];
            req.token = bearerToken;
            next();
        } else {
            res.sendStatus(403);
        }
    }

    app.get('/protected', verifyToken, (req, res) => {
        jwt.verify(req.token, 'HAHALOGIN', (err, authData) => {
            if(err) {
                res.sendStatus(403);
            } else {
                res.json({
                    message: 'Access granted',
                    authData
                });
            }
        });
    });

})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Basic endpoint to check if server is running
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});
