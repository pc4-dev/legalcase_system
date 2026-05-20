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

/* Stats */
router.get('/stats', protect, getCaseStats);

/* ═══════════════════════════════════════
   PUBLIC ROUTE — POST /api/cases/public
═══════════════════════════════════════ */
router.post('/public', upload.array('documents', 10), async (req, res) => {
  try {
    const Case     = require('../models/Case');
    const mongoose = require('mongoose');

    const {
      caseCode, title, subtitle, entity, court, bench,
      lawyer, opposingCounsel, status, stage,
      nextHearingDate, hearingType, filedDate,
      petitionerName, respondentName,
      reliefByPlaintiff, ourPosition, strategyRemarks,
    } = req.body;

    if (!caseCode || !title || !court || !entity) {
      return res.status(400).json({
        success: false,
        message: 'Case code, title, court, and entity are required',
      });
    }

    /* Handle lawyer — valid ObjectId OR custom name string */
    const lawyerObjId  = mongoose.Types.ObjectId.isValid(lawyer) ? lawyer : undefined;
    const lawyerCustom = (!mongoose.Types.ObjectId.isValid(lawyer) && lawyer) ? lawyer : undefined;

    /* Build documents */
    const documents = (req.files || []).map((file) => ({
      name: file.originalname, originalName: file.originalname,
      fileType: 'other', filePath: `/uploads/${file.filename}`,
      fileSize: `${(file.size/(1024*1024)).toFixed(2)} MB`,
      mimeType: file.mimetype, status: 'uploaded',
    }));

    const caseDoc = await Case.create({
      caseCode:  caseCode.toUpperCase().trim(),
      title, subtitle, entity, court, bench,
      lawyer:         lawyerObjId,
      lawyerName:     lawyerCustom,
      opposingCounsel, petitionerName, respondentName,
      status:    (status || 'pending').toLowerCase(),
      stage:     (stage  || 'filing').toLowerCase(),
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
      return res.status(400).json({ success: false, message: 'Case code already exists' });
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
router.post('/:id/adjournments',          protect, authorize('admin','manager'), addAdjournment);
router.delete('/:id/adjournments/:adjId', protect, authorize('admin','manager'), deleteAdjournment);

/* Documents */
router.post('/:id/documents',          protect, upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docId', protect, authorize('admin','manager'), deleteDocument);

module.exports = router;
