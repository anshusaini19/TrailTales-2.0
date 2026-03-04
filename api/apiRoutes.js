const express = require('express');
const router = express.Router();

const User = require('../models/mongo/user');
const Contact = require('../models/mongo/Contact');
const Package = require('../models/mongo/Package');
const HomeContent = require('../models/mongo/HomeContent');
const Booking = require('../models/mongo/Booking');
const Destination = require('../models/mongo/destination');
const About = require('../models/mongo/about');
const Gallery = require('../models/mongo/gallery');
const Testimonial = require('../models/mongo/testimonial');
const Wishlist = require('../models/mongo/Wishlist');

const authMiddleware = require('../middlewares/authMiddleware');


// =========================
// AUTH ROUTES
// =========================

// LOGIN
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

    res.cookie('username', user.username, {
      httpOnly: true,
      secure: false, // set true in production (HTTPS)
      sameSite: 'lax'
    });

    return res.redirect('/api/home');

  } catch (err) {
    next(err);
  }
});


// REGISTER
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: "Username already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // Auto login after register
    res.cookie('username', newUser.username, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });

    res.redirect('/api/home');

  } catch (err) {
    next(err);
  }
});


// LOGOUT
router.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
});


// =========================
// DASHBOARD (PROTECTED)
// =========================

router.get('/home', authMiddleware, async (req, res) => {
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


// =========================
// CONTACT
// =========================

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


// =========================
// PACKAGES
// =========================

router.get('/packages', async (req, res) => {
  try {
    const packages = await Package.find();
    res.render('packages', { packages });
  } catch (err) {
    res.status(500).send('Error fetching packages');
  }
});


// =========================
// BOOKING (PROTECTED)
// =========================

// View booking page (protected + track recently viewed)
router.get('/book/:id', authMiddleware, async (req, res) => {
  try {
    const packageId = req.params.id;

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).send('Package not found');
    }

    // =========================
    // Track Recently Viewed
    // =========================

    let viewed = req.cookies.recentlyViewed || [];

    // Ensure it's always an array
    if (!Array.isArray(viewed)) {
      viewed = [];
    }

    if (!viewed.includes(packageId)) {
      viewed.push(packageId);

      // Keep only last 5
      if (viewed.length > 5) {
        viewed.shift();
      }
    }

    res.cookie('recentlyViewed', viewed, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.render('book', { package: selectedPackage });

  } catch (err) {
    console.error('Error fetching package:', err);
    res.status(500).send('Error reading package');
  }
});


// Submit booking (protected)
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

    if (!packageId || !name || !email || !phone || !people || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

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

    const selectedPackage = await Package.findById(packageId);

    res.render('confirmation', { booking, package: selectedPackage });

  } catch (err) {
    next(err);
  }
});


// =========================
// OTHER PAGES
// =========================

router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.render('destinations', { destinations });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});


router.get('/about', async (req, res) => {
  try {
    const team = await About.find();
    res.render('about', { team });
  } catch (err) {
    res.status(500).send('Error fetching team members');
  }
});


router.get('/gallery', async (req, res) => {
  try {
    const galleryItems = await Gallery.find();
    res.render('gallery', { galleryItems });
  } catch (err) {
    res.status(500).send('Error loading gallery');
  }
});


router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.render('testimonials', { testimonials });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

router.post('/wishlist', authMiddleware, async (req, res) => {
  try {

    const { packageId } = req.body;
    const username = req.cookies.username;

    const existing = await Wishlist.findOne({
      username,
      packageId
    });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });

      return res.json({
        saved: false
      });
    }

    const wishlist = new Wishlist({
      username,
      packageId
    });

    await wishlist.save();

    res.json({
      saved: true
    });

  } catch (err) {
    res.status(500).json({ error: "Wishlist error" });
  }
});


module.exports = router;