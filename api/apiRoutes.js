const express = require('express');
const router = express.Router();
const User = require('../models/mongo/user');
const Contact = require('../models/mongo/Contact');
const Package = require('../models/mongo/Package');
const HomeContent = require('../models/mongo/HomeContent');
const Booking = require('../models/mongo/Booking');
const Destination = require('../models/mongo/destination');
const About = require('../models/mongo/about');  // Import the About model
const Gallery = require('../models/mongo/gallery');
const Testimonial = require('../models/mongo/testimonial');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: "Invalid credentials" });
    }

    res.cookie('username', user.username, { httpOnly: true });
    return res.redirect('/api/home');

  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: "Username already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Contact form route
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.json({ success: true, message: 'Message stored successfully!' });
  } catch (err) {
    next(err);
  }
});

// Get all packages
router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    console.log(packages); 
    res.render('packages', { packages });
  } catch (err) {
    res.status(500).send('Error fetching packages');
  }
});

// Book a specific package by ID
router.get('/book/:id', async (req, res) => {
  try {
    const selectedPackage = await Package.findById(req.params.id);

    if (!selectedPackage) {
      return res.status(404).send('Package not found');
    }

    res.render('book', { package: selectedPackage });
  } catch (err) {
    console.error('Error fetching package:', err);
    res.status(500).send('Error reading package');
  }
});


router.post('/book', authMiddleware, async (req, res, next) => {
  try {
    const { 
      packageId,
      name,
      email,
      phone,
      people,
      date,
      specialRequests 
    } = req.body;

    // Input validation (basic checks)
    if (!packageId || !name || !email || !phone || !people || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a new booking document in MongoDB
    const booking = new Booking({
      packageId,
      name,
      email,
      phone,
      people,
      date,
      specialRequests
    });

    await booking.save();

    // Optionally fetch package info for confirmation page
    const selectedPackage = await Package.findById(packageId);

    // Render confirmation page with booking details and package information
    res.render('confirmation', { booking, package: selectedPackage });
  } catch (err) {
    next(err);
  }
});




// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
});

// Home route
router.get('/home', async (req, res) => {
  try {
    const data = await HomeContent.findOne();
    const username = req.cookies?.username || null;
    res.render('home', {
      username,
      about1: data?.about1 || '',
      about2: data?.about2 || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Error loading home content' });
  }
});

router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.render('destinations', { destinations });
  } catch (err) {
    console.error('Failed to load destinations:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/about', async (req, res) => {
  try {
    const team = await About.find();  // Fetch all team members from MongoDB
    res.render('about', { team });  // Render the about.ejs page and pass team data
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching team members');
  }
});

router.get('/gallery', async (req, res) => {
    try {
        const galleryItems = await Gallery.find({});
        res.render('gallery', { galleryItems });
    } catch (err) {
        res.status(500).send('Error loading gallery');
    }
});

// Testimonials route
router.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({});
        res.render('testimonials', { testimonials });
    } catch (err) {
        console.error("Error fetching testimonials:", err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
