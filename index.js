const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
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
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exerciseSessionSchema]
});

const User = mongoose.model('User', userSchema);

app.post('/api/users', (req, res) => {
  const handelUser = async () => {
    const findUser = await User.findOne({ username: req.body.username });
    if (findUser) {
      res.json({ username: findUser.username, _id: findUser._id });
    } else {
      const newUser = new User({ username: req.body.username });
      const data = await newUser.save();
      res.json({ username: data.username, _id: data._id });
    }
  }
  handelUser();
});

app.get('/api/users', (req, res) => {
  const getAllUsers = async () => {
    try {
      const data = await User.find({});
      res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  getAllUsers();
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const addExercise = async () => {
    try {
      const findUser = await User.findById(req.params._id);
      const newExercise = {
        description: req.body.description,
        duration: Number(req.body.duration),
        date: req.body.date ? new Date(req.body.date) : new Date()
      }
      findUser.log.push(newExercise);
      const saveUser = await findUser.save();
      const resObj = {
        _id: saveUser._id,
        username: saveUser.username,
        date: newExercise.date.toDateString(),
        duration: newExercise.duration,
        description: newExercise.description
      }
      res.json(resObj);
    } catch (err) {
      console.error(err);
    }
  }
  addExercise();
});

app.get('/api/users/:_id/logs', (req, res) => {
  const getExerciseLog = async () => {
    const id = req.params._id;
    const fromDate = req.query.from ? new Date(req.query.from) : null;
    const toDate = req.query.to ? new Date(req.query.to) : null;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    try {
      const findUser = await User.findById(id);
      const userData = {
        _id: findUser._id,
        username: findUser.username,
        count: findUser.log.length,
        log: findUser.log.sort((a, b) => a.date - b.date)
      }
      if(userData.count === 0) {
        res.json(userData);
        return
      }
      if (fromDate) {
        userData.log = userData.log.filter(exercise => exercise.date >= fromDate);
      }
      if (toDate) {
        userData.log = userData.log.filter(exercise => exercise.date <= toDate);
      }
      if (limit) {
        userData.log = userData.log.slice(0, limit);
      }
      const resObj = {
        ...userData,
        log: userData.log.map(exercise => {
          return {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString()
          }
        })
      }
      res.json(resObj);
    }
    catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
  getExerciseLog();
});
