const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config({ path: './.env' });

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not defined. Check your .env file.');
    process.exit(1);
}

app.get('/tiffins/:name', async (req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('tiffins');
        const tiffins = db.collection('tiffin_name');
        const nameParam = req.params.name.replace(/_/g, ' '); // Convert underscores to spaces

        const tiffin = await tiffins.findOne({ name: nameParam });
        if (tiffin) {
            res.json({ name: tiffin.name, price: tiffin.price });
        } else {
            res.status(404).json({ error: "Tiffin not found" });
        }
    } catch (error) {
        console.error('Error in /tiffins/:name:', error);
        res.status(500).json({ error: "Failed to fetch tiffin." });
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
});

app.get('/tiffins', async (req, res) => {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('tiffins');
        const tiffins = db.collection('tiffin_name');
        const id = req.query.id;
        const name = req.query.name;

        if (id) {
            const tiffin = await tiffins.findOne({ _id: id });
            if (tiffin) res.json({ name: tiffin.name, price: tiffin.price });
            else res.status(404).json({ error: "Tiffin not found" });
        } else if (name) {
            const tiffin = await tiffins.findOne({ name: name });
            if (tiffin) res.json({ name: tiffin.name, price: tiffin.price });
            else res.status(404).json({ error: "Tiffin not found" });
        } else {
            const alltiffins = await tiffins.find({}).project({ name: 1, price: 1, _id: 0 }).toArray();
            res.json(alltiffins);
        }
    } catch (error) {
        console.error('Error in /tiffins:', error);
        res.status(500).json({ error: "Failed to fetch tiffins." });
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
});

app.get('/', (req, res) => res.json({ message: 'API running!' }));

// Keep the server alive
app.listen(port, () => {
    console.log(`Server on port ${port}`);
    setInterval(() => {}, 1000); // Prevent process from exiting
});