require('dotenv').config();
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const cors = require('cors');

const authRoutes = require('./endpoints/auth');

const db = require('./db/database');

const path = require('path');
const { FORCE } = require('sequelize/lib/index-hints');

// app.use(express.static(path.join(__dirname, 'views')))

app.use(cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); 

app.use('/api/user', authRoutes);

const PORT = 3000|| 5000;
db.sync({force: false}).then(() => {
    app.listen(PORT, () => {
        console.log('Server is running on port',{PORT});
    });
}).catch(err => console.log('Error: ' + err));
