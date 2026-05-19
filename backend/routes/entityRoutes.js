const express = require('express');
const router  = express.Router();
const Entity  = require('../models/Entity');
const { protect, authorize } = require('../middleware/authMiddleware');

/* ═══════════════════════════════════════
   PUBLIC — GET all entities (for dropdowns)
   GET /api/entities/public
═══════════════════════════════════════ */
router.get('/public', async (_req, res) => {
  try {
    const entities = await Entity.find({ isActive: true })
      .select('_id name shortName type colorVariant')
      .sort({ name: 1 });
    res.json({ success: true, entities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ═══════════════════════════════════════
   PROTECTED ROUTES
═══════════════════════════════════════ */

/* GET all entities */
router.get('/', protect, async (_req, res) => {
  try {
    const entities = await Entity.find({ isActive: true })
      .populate('createdBy', 'name initials')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: entities.length, entities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* POST create entity */
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const entity = await Entity.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, entity });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Entity name already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET single entity */
router.get('/:id', protect, async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id).populate('createdBy', 'name');
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });
    res.json({ success: true, entity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* PUT update entity */
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });
    res.json({ success: true, entity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* DELETE (deactivate) entity */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const entity = await Entity.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });
    res.json({ success: true, message: 'Entity removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
