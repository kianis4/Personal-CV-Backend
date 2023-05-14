const express = require('express');
const cors = require("cors");

const mongodb = require('mongodb');
const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config();
const { fetchInstagramAndSaveToGridFS } = require('./instaFetch');

const app = express();
app.use(cors());

app.use(express.json());

const uri = process.env.MONGO_URI;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        const db = client.db('myDatabase');
        const gfs = new GridFSBucket(db); // Initialize GridFS

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });

        // Add the new endpoint to trigger fetchInstagramAndSaveToGridFS function
        app.get('/fetchInstagram', async (req, res) => {
            try {
                await fetchInstagramAndSaveToGridFS(gfs);
                res.status(200).json({ message: 'Instagram data fetched and saved successfully!' });
            } catch (error) {
                console.error('Error fetching and saving Instagram data:', error);
                res.status(500).json({ message: 'Error fetching and saving Instagram data', error: error.message });
            }
        });

        // Add the new /images endpoint here
        // app.get('/images', async (req, res) => {
        //     try {
        //         const files = await gfs.find({}).toArray();
        //         const filenames = files.map(file => file.filename);
        //         res.status(200).json({ filenames });
        //     } catch (error) {
        //         console.error('Error fetching image list:', error);
        //         res.status(500).json({ message: 'Error fetching image list', error: error.message });
        //     }
        // });
        app.get('/images', async (req, res) => {
            try {
                const files = await gfs.find({}).toArray();
                const imageFiles = files.filter(file => file.filename.endsWith('.jpg'));
                const filenames = imageFiles.map(file => file.filename);
                res.status(200).json({ filenames });
            } catch (error) {
                console.error('Error fetching image list:', error);
                res.status(500).json({ message: 'Error fetching image list', error: error.message });
            }
        });
        
        
        // Add the new /deleteAllImages endpoint here
        // Add the new /deleteAllImages endpoint here
        app.delete('/deleteAllImages', async (req, res) => {
            try {
                const bucket = new GridFSBucket(db);
                await bucket.drop();

                res.status(200).json({ message: 'All images deleted successfully' });
            } catch (error) {
                console.error('Error deleting all images:', error);
                res.status(500).json({ message: 'Error deleting all images', error: error.message });
            }
        });
        
        //Serve an image with a specific filename
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

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});