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

router.post('/login', async (req, res, next) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect('/');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.redirect('/');
    }

    // create session
    req.session.user = {
      id: user._id,
      username: user.username,
      firstName: user.firstName
    };

    req.session.save(() => {
      res.redirect('/');
    });

  } catch (err) {
    next(err);
  }

});

router.post('/register', async (req, res, next) => {

  try {

    const { firstName, lastName, email, password } = req.body;

    const username = `${firstName}_${lastName}`;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect('/');
    }

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password
    });

    await newUser.save();

    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      firstName: newUser.firstName
    };

    req.session.save(() => {
      res.redirect('/');
    });

  } catch (err) {
    next(err);
  }

});

// LOGOUT
router.get('/logout', (req, res) => {

  req.session.destroy(() => {
    res.redirect('/');
  });

});


// =========================
// DASHBOARD (PROTECTED)
// =========================

router.get('/home', authMiddleware, async (req, res) => {

  try {

    const data = await HomeContent.findOne();

    const username = req.session?.user?.username || null;

    res.render('home', {
      username,
      about1: data?.about1 || '',
      about2: data?.about2 || ''
    });

  } catch (err) {

    res.status(500).json({
      error: 'Error loading home content'
    });

  }

});


// =========================
// CONTACT
// =========================

router.post('/contact', async (req, res, next) => {

  try {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    const contact = new Contact({
      name,
      email,
      message
    });

    await contact.save();

    res.json({
      success: true,
      message: 'Message stored successfully!'
    });

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

router.get('/book/:id', authMiddleware, async (req, res) => {

  try {

    const packageId = req.params.id;

    const selectedPackage = await Package.findById(packageId);

    if (!selectedPackage) {
      return res.status(404).send('Package not found');
    }

    let viewed = req.cookies.recentlyViewed || [];

    if (!Array.isArray(viewed)) {
      viewed = [];
    }

    if (!viewed.includes(packageId)) {

      viewed.push(packageId);

      if (viewed.length > 5) {
        viewed.shift();
      }

    }

    res.cookie('recentlyViewed', viewed, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.render('book', {
      package: selectedPackage
    });

  } catch (err) {

    console.error('Error fetching package:', err);

    res.status(500).send('Error reading package');

  }

});


// Submit booking
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
      return res.status(400).json({
        error: 'All fields are required'
      });
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

    res.render('confirmation', {
      booking,
      package: selectedPackage
    });

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

    res.render('destinations', {
      destinations
    });

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


// =========================
// WISHLIST (SESSION USER)
// =========================

router.post('/wishlist', authMiddleware, async (req, res) => {

  try {

    const { packageId } = req.body;

    const username = req.session.user.username;

    const existing = await Wishlist.findOne({
      username,
      packageId
    });

    if (existing) {

      await Wishlist.deleteOne({
        _id: existing._id
      });

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

    res.status(500).json({
      error: "Wishlist error"
    });

  }

});


module.exports = router;