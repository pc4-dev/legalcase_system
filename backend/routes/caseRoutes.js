const express = require('express');
const router  = express.Router();
const {
  getCases, getCase, createCase, updateCase, deleteCase,
  addAdjournment, deleteAdjournment,
  uploadDocument, deleteDocument,
  getCaseStats,
} = require('../controllers/caseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/* ── Stats (must come before /:id) ── */
router.get('/stats', protect, getCaseStats);

/* ═══════════════════════════════════════
   PUBLIC ROUTE — no auth required
   POST /api/cases/public
═══════════════════════════════════════ */
router.post('/public', upload.array('documents', 10), async (req, res) => {
  try {
    const Case = require('../models/Case');

    const {
      caseCode, title, subtitle, entity, court, bench,
      opposingCounsel, status, stage,
      nextHearingDate, hearingType, filedDate,
      reliefByPlaintiff, ourPosition, strategyRemarks,
    } = req.body;

    if (!caseCode || !title || !court || !entity) {
      return res.status(400).json({
        success: false,
        message: 'Case code, title, court, and entity are required',
      });
    }

    /* Build documents array from uploaded files */
    const documents = (req.files || []).map((file) => ({
      name:         file.originalname,
      originalName: file.originalname,
      fileType:     'other',
      filePath:     `/uploads/${file.filename}`,
      fileSize:     `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType:     file.mimetype,
      status:       'uploaded',
    }));

    const caseDoc = await Case.create({
      caseCode:  caseCode.toUpperCase().trim(),
      title, subtitle, entity, court, bench,
      opposingCounsel,
      status:    status   || 'pending',
      stage:     stage    || 'filing',
      nextHearingDate: nextHearingDate || undefined,
      hearingType,
      filedDate: filedDate || new Date(),
      reliefByPlaintiff, ourPosition, strategyRemarks,
      documents,
    });

    res.status(201).json({
      success: true,
      message: 'Case submitted successfully',
      case: { _id: caseDoc._id, caseCode: caseDoc.caseCode, title: caseDoc.title },
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Case code already exists — please use a unique code' });
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════════════════════════════════
   PROTECTED ROUTES
═══════════════════════════════════════ */
router.route('/')
  .get(protect, getCases)
  .post(protect, authorize('admin', 'manager'), createCase);

router.route('/:id')
  .get(protect, getCase)
  .put(protect, authorize('admin', 'manager'), updateCase)
  .delete(protect, authorize('admin'), deleteCase);

/* Adjournments */
router.post('/:id/adjournments',          protect, authorize('admin', 'manager'), addAdjournment);
router.delete('/:id/adjournments/:adjId', protect, authorize('admin', 'manager'), deleteAdjournment);

/* Documents */
router.post('/:id/documents',         protect, upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docId',protect, authorize('admin', 'manager'), deleteDocument);

module.exports = router;
