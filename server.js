// Including the necessary modules
const express = require('express');  // Express.js for creating the server
const cors = require("cors");  // CORS for handling Cross-Origin Requests
const https = require('https');
const fs = require('fs');

const mongodb = require('mongodb');  // MongoDB driver for Node.js
const { MongoClient, GridFSBucket } = require('mongodb');  // MongoClient for MongoDB connection, GridFSBucket for storing larger files
require('dotenv').config();  // For reading environment variables
const { fetchInstagramAndSaveToGridFS } = require('./instaFetch');  // Importing the function to fetch Instagram data and save to MongoDB

const app = express();
app.use(cors());  // Middleware to enable CORS

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
   
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// Basic endpoint to check if server is running
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});
