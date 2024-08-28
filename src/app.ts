import express from 'express';
import dotenv from 'dotenv'

dotenv.config()

const app = express();
const port = 8080;

const {GEMINI_API_KEY} = process.env;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não foi definido');
}

const { Sequelize, DataTypes } = require('sequelize');

// Connect to the database
const sequelize = new Sequelize('mydatabase', 'root', 'rootpassword', {
    host: 'db',
    dialect: 'mysql',
});

// Define models
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});

// Establish model relationships
User.hasMany(Post);
Post.belongsTo(User);

// Sync database and create tables
sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
});


app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(port, () => {
  console.log(`http://localhost:80`);
});