const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config(); 

app.use(cors());
app.use(express.json());

// Debug: Log the MONGODB_URI to check if it's loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const uri = process.env.MONGODB_URI;

app.get('/tiffins', async (req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('tiffins');
        const tiffins = db.collection('tiffin_name');
        const alltiffins = await tiffins.find({}).toArray();
        res.json(alltiffins);
    } catch (error) {
        console.error('Error fetching tiffins:', error);
        res.status(500).json({ error: "Failed to fetch the tiffins Names and prices from the database." });
    } finally {
        await client.close();
    }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Tiffin Store API is running!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on the port of ${port}`);
});