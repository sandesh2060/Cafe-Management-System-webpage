// File: backend/src/modules/report/report.routes.js

const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { protect } = require('../../auth/auth.middleware');
const { checkRole } = require('../../shared/middleware/roleCheck');

// All routes require authentication
router.use(protect);

// Generate reports
router.post(
  '/waiter/performance',
  reportController.generateWaiterReport
);

router.post(
  '/cook/performance',
  reportController.generateCookReport
);

router.post(
  '/cashier/performance',
  reportController.generateCashierReport
);

router.post(
  '/comparison/staff',
  checkRole(['admin', 'manager']),
  reportController.generateStaffComparisonReport
);

// Get reports
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);

// Export reports
router.get('/:id/export/pdf', reportController.exportReportPDF);
router.get('/:id/export/csv', reportController.exportReportCSV);

module.exports = router;