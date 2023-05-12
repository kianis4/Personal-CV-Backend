const express = require('express');
const mongodb = require('mongodb');
require('dotenv').config();


const app = express();
app.use(express.json());

const uri = process.env.MONGO_URI;

mongodb.MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        const db = client.db('myDatabase');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});


