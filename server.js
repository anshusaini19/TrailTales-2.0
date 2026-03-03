const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();
const PORT = 3000;

// DB Connection
const connectDB = require('./config/db');
connectDB();

// Models
const Package = require('./models/mongo/Package');
const Booking = require('./models/mongo/Booking');

// Custom Middlewares
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// --------------------
// Security & Middleware Setup
// --------------------
app.use(compression({ threshold: 0 }));
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// --------------------
// View Engine Setup
// --------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --------------------
// Routes
// --------------------

app.get('/', async (req, res) => {
  try {
    const username = req.cookies?.username || null;

    // Trending: Most booked packages
    const trending = await Booking.aggregate([
      { $group: { _id: "$packageId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const trendingIds = trending.map(t => t._id);
    const trendingPackages = await Package.find({ _id: { $in: trendingIds } });

    // Top Rated (if rating exists)
    const topRated = await Package.find().sort({ rating: -1 }).limit(3);

    // Recently viewed (cookie-based)
    const recentlyViewedIds = req.cookies.recentlyViewed || [];
    const recentlyViewed = await Package.find({ _id: { $in: recentlyViewedIds } });

    res.render('landing', {
      username,
      trendingPackages,
      topRated,
      recentlyViewed
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading landing page");
  }
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Register Page
app.get('/register', (req, res) => {
  res.render('register');
});

// Mount API Routes
const apiRoutes = require('./api/apiRoutes');
app.use('/api', apiRoutes);

// --------------------
// Error Handling
// --------------------
app.use(errorHandler);

// --------------------
// Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});