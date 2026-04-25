const router = require('express').Router();
const User = require('../models/User');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// POST /api/coins/tip - Tip a listing owner
router.post('/tip', auth, async (req, res) => {
  try {
    const { requestId, amount } = req.body;

    // 1. Validate amount
    if (![1, 2, 5].includes(amount)) {
      return res.status(400).json({ message: 'Invalid tip amount. Choose 1, 2, or 5.' });
    }

    // 2. Find request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // 3. Ensure requester is the one tipping
    if (request.requesterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the requester can tip' });
    }

    // 4. Ensure request is approved
    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Can only tip for approved requests' });
    }

    // 5. Get users
    const requester = await User.findById(req.user.id);
    const owner = await User.findById(request.ownerId);

    if (!requester || !owner) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 6. Check balance
    if (requester.coins < amount) {
      return res.status(400).json({ message: 'Not enough coins 🪙' });
    }

    // 7. Atomic-ish update
    requester.coins -= amount;
    owner.coins += amount;

    await requester.save();
    await owner.save();

    res.json({ 
      message: 'Tip sent! ✨',
      newBalance: requester.coins 
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
