const Case = require('../models/Case');
const Notification = require('../models/Notification');
const path = require('path');

// ── Helpers ──────────────────────────────────────────────────
const paginate = (query, page = 1, limit = 20) =>
  query.skip((page - 1) * limit).limit(limit);

// @desc   Get all cases (with search, filter, pagination)
// @route  GET /api/cases
// @access Private
const getCases = async (req, res) => {
  try {
    const { search, status, entity, stage, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (entity) filter.entity = entity;
    if (stage) filter.stage = stage;
    if (search) {
      filter.$or = [
        { caseCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { court: { $regex: search, $options: 'i' } },
        { entity: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Case.countDocuments(filter);
    const cases = await paginate(
      Case.find(filter)
        .populate('lawyer', 'name initials colorVariant phone email')
        .sort({ nextHearingDate: 1, createdAt: -1 }),
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      cases,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single case
// @route  GET /api/cases/:id
// @access Private
const getCase = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('lawyer', 'name initials colorVariant phone email chamber')
      .populate('createdBy', 'name initials');

    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, case: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create case
// @route  POST /api/cases
// @access Private (admin, manager)
const createCase = async (req, res) => {
  try {
    const caseDoc = await Case.create({ ...req.body, createdBy: req.user._id });

    // Auto-create notification for urgent cases
    if (caseDoc.status === 'urgent' && caseDoc.nextHearingDate) {
      await Notification.create({
        title: `Urgent case filed — ${caseDoc.caseCode}`,
        body: `New urgent case "${caseDoc.title}" has been added. Next hearing: ${new Date(caseDoc.nextHearingDate).toDateString()}.`,
        type: 'urgent',
        icon: 'ti-alarm',
        relatedCase: caseDoc._id,
        dueDate: caseDoc.nextHearingDate,
        createdBy: req.user._id,
      });
    }

    res.status(201).json({ success: true, case: caseDoc });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Case code already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update case
// @route  PUT /api/cases/:id
// @access Private (admin, manager)
const updateCase = async (req, res) => {
  try {
    const caseDoc = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('lawyer', 'name initials colorVariant phone email');

    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, case: caseDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete case
// @route  DELETE /api/cases/:id
// @access Private (admin only)
const deleteCase = async (req, res) => {
  try {
    const caseDoc = await Case.findByIdAndDelete(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Adjournments ─────────────────────────────────────────────
// @route  POST /api/cases/:id/adjournments
const addAdjournment = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });

    caseDoc.adjournments.unshift(req.body); // newest first
    await caseDoc.save();
    res.json({ success: true, adjournments: caseDoc.adjournments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/cases/:id/adjournments/:adjId
const deleteAdjournment = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });

    caseDoc.adjournments = caseDoc.adjournments.filter(
      (a) => a._id.toString() !== req.params.adjId
    );
    await caseDoc.save();
    res.json({ success: true, adjournments: caseDoc.adjournments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Documents ────────────────────────────────────────────────
// @route  POST /api/cases/:id/documents
const uploadDocument = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const docData = {
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      fileType: req.body.fileType || 'other',
      filePath: `/uploads/${req.file.filename}`,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: req.file.mimetype,
      status: 'uploaded',
      uploadedBy: req.user._id,
    };

    caseDoc.documents.push(docData);
    await caseDoc.save();
    res.status(201).json({ success: true, document: caseDoc.documents[caseDoc.documents.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/cases/:id/documents/:docId
const deleteDocument = async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });

    caseDoc.documents = caseDoc.documents.filter(
      (d) => d._id.toString() !== req.params.docId
    );
    await caseDoc.save();
    res.json({ success: true, documents: caseDoc.documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Dashboard stats ──────────────────────────────────────────
// @route  GET /api/cases/stats
const getCaseStats = async (req, res) => {
  try {
    const [total, urgent, active, pending, closed, pendingDocs, upcoming] = await Promise.all([
      Case.countDocuments(),
      Case.countDocuments({ status: 'urgent' }),
      Case.countDocuments({ status: 'active' }),
      Case.countDocuments({ status: 'pending' }),
      Case.countDocuments({ status: 'closed' }),
      Case.countDocuments({ 'documents.status': 'pending' }),
      Case.find({
        nextHearingDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        status: { $ne: 'closed' },
      })
        .sort({ nextHearingDate: 1 })
        .limit(5)
        .populate('lawyer', 'name initials'),
    ]);

    res.json({ success: true, stats: { total, urgent, active, pending, closed, pendingDocs }, upcoming });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  addAdjournment,
  deleteAdjournment,
  uploadDocument,
  deleteDocument,
  getCaseStats,
};
