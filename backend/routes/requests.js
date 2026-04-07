const router = require('express').Router();

const auth = require('../middleware/auth');
const Request = require('../models/Request');
const Listing = require('../models/Listing');

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

    const request = await Request.create({
      listingId: listing._id,
      listingTitle: listing.title,
      requesterId: req.user.id,
      requesterName: req.user.name,
      ownerId: listing.owner,
      status: 'pending',
    });

    return res.status(201).json(request);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// get requests made to my items
router.get('/mine', auth, async (req, res) => {
  try {
    const requests = await Request.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (err) {
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
router.get('/contact/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (String(request.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (request.status !== 'approved') {
      return res.status(200).json('Not approved yet');
    }

    const listing = await Listing.findById(request.listingId).select('+ownerContact');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    return res.status(200).json({ ownerContact: listing.ownerContact });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

