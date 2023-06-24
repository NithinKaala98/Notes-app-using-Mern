const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost/notes-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Define Note schema
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Note = mongoose.model('Note', noteSchema);

app.use(cors());
app.use(bodyParser.json());

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, 'secretKey');

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secretKey');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Notes endpoints

// Get all notes for a user
app.get('/notes', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Create a new note
app.post('/notes', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = new Note({
      title,
      content,
      userId: req.userId,
    });

    await note.save();

    res.status(201).json({ message: 'Note created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Update a note
app.put('/notes/:id', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;

    await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content }
    );

    res.status(200).json({ message: 'Note updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Delete a note
app.delete('/notes/:id', authenticate, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
