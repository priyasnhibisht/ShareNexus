const router = require('express').Router();

const auth = require('../middleware/auth');
const Request = require('../models/Request');
const Listing = require('../models/Listing');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ message: 'Missing listingId' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (String(listing.owner) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot request your own listing' });
    }

    // look up the owner's name so we can store it on the request
    const ownerUser = await User.findById(listing.owner);

    const request = await Request.create({
      listingId: listing._id,
      listingTitle: listing.title,
      requesterId: req.user.id,
      requesterName: req.user.name,
      ownerId: listing.owner,
      ownerName: ownerUser ? ownerUser.name : listing.ownerName,
      status: 'pending',
    });

    return res.status(201).json(request);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    console.log('GET /requests/mine - req.user:', req.user);
    const requests = await Request.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    console.log('GET /requests/mine - found requests count:', requests.length);
    console.log('GET /requests/mine - found requests:', requests);
    return res.status(200).json(requests);
  } catch (err) {
    console.error('GET /requests/mine - error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sent/:userId', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    console.log('GET /requests/sent/:userId - userId param (string):', req.params.userId);
    console.log('GET /requests/sent/:userId - userId as ObjectId:', new mongoose.Types.ObjectId(req.params.userId));
    
    const requests = await Request.find({ requesterId: new mongoose.Types.ObjectId(req.params.userId) }).sort({ createdAt: -1 });
    console.log('GET /requests/sent/:userId - found requests count:', requests.length);
    console.log('GET /requests/sent/:userId - found requests:', requests);
    
    return res.status(200).json(requests);
  } catch (err) {
    console.error('GET /requests/sent/:userId - error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/approve', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // only owner should be able to approve
    if (String(request.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    request.status = 'approved';
    await request.save();

    return res.status(200).json(request);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/reject', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (String(request.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    request.status = 'rejected';
    await request.save();

    return res.status(200).json(request);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// fetch contact info once request is approved
// both the requester and the owner can view contact details
router.get('/contact/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // allow both the owner and the requester to get contact info
    const userId = String(req.user.id);
    if (userId !== String(request.ownerId) && userId !== String(request.requesterId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (request.status !== 'approved') {
      return res.status(403).json({ message: 'Not approved yet' });
    }

    const listing = await Listing.findById(request.listingId).select('+ownerContact');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // look up both parties so we can return names + emails + phones
    const owner = await User.findById(request.ownerId);
    const requester = await User.findById(request.requesterId);

    return res.status(200).json({
      ownerName: owner?.name,
      ownerEmail: owner?.email,
      ownerPhone: owner?.phone || listing.ownerContact || '',
      requesterName: requester?.name,
      requesterEmail: requester?.email,
      requesterPhone: requester?.phone || '',
    });
  } catch (err) {
    console.error('Contact fetch error:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

