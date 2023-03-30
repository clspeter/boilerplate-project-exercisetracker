const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
require('dotenv').config()

const MONGO_URI = 'mongodb+srv://mustpe:4BgeMplFr4oRIsvi@cluster0.dswholm.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const exerciseSessionSchema = new mongoose.Schema({
  description: {type:String, required:true},
  duration: {type:Number, required:true},
  date: {type:Date, required:false}
});

const userSchema = new mongoose.Schema({
  username: {type:String, required:true},
  log: [exerciseSessionSchema]
});









