const router = require('express').Router();

const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, ownerContact } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      category,
      owner: req.user.id,
      ownerName: req.user.name,
      ownerContact: ownerContact ?? '',
    });

    return res.status(201).json(listing);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// get all listings, sorted by newest first
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    return res.status(200).json(listings);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// get listings by owner ID
router.get('/my/:userId', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    console.log('GET /listings/my/:userId - userId param (string):', req.params.userId);
    console.log('GET /listings/my/:userId - userId as ObjectId:', new mongoose.Types.ObjectId(req.params.userId));
    
    const listings = await Listing.find({ owner: new mongoose.Types.ObjectId(req.params.userId) }).sort({ createdAt: -1 });
    console.log('GET /listings/my/:userId - found listings count:', listings.length);
    console.log('GET /listings/my/:userId - found listings:', listings);
    
    return res.status(200).json(listings);
  } catch (err) {
    console.error('GET /listings/my/:userId - error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

