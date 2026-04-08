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

const mongoose = require('mongoose');

// get listings by owner ID
router.get('/my/:userId', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const listings = await Listing.find({ owner: userId }).sort({ createdAt: -1 });
    return res.status(200).json(listings);
  } catch (err) {
    console.error('Error in /listings/my/:userId:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

// delete a listing (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.owner.toString() !== req.user.id && listing.owner.toString() !== req.user._id)
      return res.status(403).json({ message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

