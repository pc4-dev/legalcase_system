const express = require('express');
const router  = express.Router();
const {
  getLawyers, getLawyer, createLawyer,
  updateLawyer, deleteLawyer, getLawyerStats,
} = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/authMiddleware');

/* Stats */
router.get('/stats', protect, getLawyerStats);

/* ═══════════════════════════════════════
   PUBLIC — GET lawyers list for dropdown
   GET /api/lawyers/public
═══════════════════════════════════════ */
router.get('/public', async (req, res) => {
  try {
    const Lawyer = require('../models/Lawyer');
    const lawyers = await Lawyer.find({ isActive: true })
      .select('_id name specialisation court phone initials colorVariant')
      .sort({ name: 1 });
    res.json({ success: true, lawyers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════════════════════════════════
   PUBLIC — POST register new lawyer
   POST /api/lawyers/public
═══════════════════════════════════════ */
router.post('/public', async (req, res) => {
  try {
    const Lawyer = require('../models/Lawyer');
    const { name, specialisation, court, phone, email, chamber, feesYTD, colorVariant } = req.body;

    if (!name || !specialisation || !court)
      return res.status(400).json({ success: false, message: 'Name, specialisation, and court are required' });

    const lawyer = await Lawyer.create({
      name: name.trim(), specialisation, court,
      phone, email, chamber,
      feesYTD:      feesYTD      || 0,
      colorVariant: colorVariant || 'orange',
    });

    res.status(201).json({
      success: true,
      message: 'Lawyer registered successfully',
      lawyer: { _id: lawyer._id, name: lawyer.name, specialisation: lawyer.specialisation },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════════════════════════════════
   PROTECTED ROUTES
═══════════════════════════════════════ */
router.route('/')
  .get(protect, getLawyers)
  .post(protect, authorize('admin', 'manager'), createLawyer);

router.route('/:id')
  .get(protect, getLawyer)
  .put(protect, authorize('admin', 'manager'), updateLawyer)
  .delete(protect, authorize('admin'), deleteLawyer);

module.exports = router;
