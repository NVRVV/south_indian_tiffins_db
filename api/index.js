const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config({ path: './.env' });

app.use(cors());
app.use(express.json());

console.log('MONGODB_URI:', process.env.MONGODB_URI);
const envPath = 'E:\\mystuff\\mongo_DB\\southIndianTiffins\\south_indian_tiffins_db\\.env';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Raw .env content:', envContent);
} catch (err) {
    console.error('Error reading .env file:', err);
}

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not defined. Check your .env file.');
    process.exit(1);
}

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

app.listen(port, () => console.log(`Server on port ${port}`));