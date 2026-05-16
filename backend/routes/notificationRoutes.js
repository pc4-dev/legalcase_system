// notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET all notifications
router.get('/', protect, async (req, res) => {
  try {
    const { type, isRead, isResolved } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

    const notifications = await Notification.find(filter)
      .populate('relatedCase', 'caseCode title')
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create notification
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const notification = await Notification.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH mark as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH resolve
router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, isRead: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE notification
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
