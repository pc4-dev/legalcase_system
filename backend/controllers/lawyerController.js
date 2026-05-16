const Lawyer = require('../models/Lawyer');
const Case = require('../models/Case');

// @desc   Get all lawyers
// @route  GET /api/lawyers
// @access Private
const getLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({ isActive: true })
      .populate('activeCases')
      .populate('closedCases')
      .sort({ name: 1 });

    res.json({ success: true, count: lawyers.length, lawyers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single lawyer with their cases
// @route  GET /api/lawyers/:id
// @access Private
const getLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });

    const cases = await Case.find({ lawyer: req.params.id })
      .select('caseCode title status stage nextHearingDate entity')
      .sort({ nextHearingDate: 1 });

    res.json({ success: true, lawyer, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create lawyer
// @route  POST /api/lawyers
// @access Private (admin, manager)
const createLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.create(req.body);
    res.status(201).json({ success: true, lawyer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update lawyer
// @route  PUT /api/lawyers/:id
// @access Private (admin, manager)
const updateLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });
    res.json({ success: true, lawyer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete (deactivate) lawyer
// @route  DELETE /api/lawyers/:id
// @access Private (admin)
const deleteLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });
    res.json({ success: true, message: 'Lawyer deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get lawyer stats (fees summary across all)
// @route  GET /api/lawyers/stats
// @access Private
const getLawyerStats = async (req, res) => {
  try {
    const stats = await Lawyer.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalLawyers: { $sum: 1 },
          totalFeesYTD: { $sum: '$feesYTD' },
        },
      },
    ]);
    res.json({ success: true, stats: stats[0] || { totalLawyers: 0, totalFeesYTD: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLawyers, getLawyer, createLawyer, updateLawyer, deleteLawyer, getLawyerStats };
