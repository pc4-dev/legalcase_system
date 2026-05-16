// lawyerRoutes.js
const express = require('express');
const router = express.Router();
const { getLawyers, getLawyer, createLawyer, updateLawyer, deleteLawyer, getLawyerStats } = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, getLawyerStats);

router.route('/')
  .get(protect, getLawyers)
  .post(protect, authorize('admin', 'manager'), createLawyer);

router.route('/:id')
  .get(protect, getLawyer)
  .put(protect, authorize('admin', 'manager'), updateLawyer)
  .delete(protect, authorize('admin'), deleteLawyer);

module.exports = router;
