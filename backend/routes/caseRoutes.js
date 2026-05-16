const express = require('express');
const router = express.Router();
const {
  getCases, getCase, createCase, updateCase, deleteCase,
  addAdjournment, deleteAdjournment,
  uploadDocument, deleteDocument,
  getCaseStats,
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Stats must come before /:id
router.get('/stats', protect, getCaseStats);

router.route('/')
  .get(protect, getCases)
  .post(protect, authorize('admin', 'manager'), createCase);

router.route('/:id')
  .get(protect, getCase)
  .put(protect, authorize('admin', 'manager'), updateCase)
  .delete(protect, authorize('admin'), deleteCase);

// Adjournments
router.post('/:id/adjournments', protect, authorize('admin', 'manager'), addAdjournment);
router.delete('/:id/adjournments/:adjId', protect, authorize('admin', 'manager'), deleteAdjournment);

// Documents
router.post('/:id/documents', protect, upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docId', protect, authorize('admin', 'manager'), deleteDocument);

module.exports = router;
