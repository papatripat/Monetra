const express = require('express');
const router = express.Router();
const {
    getSummary,
    getExpenseByCategory,
    getMonthlyTrend,
    getBudgetStatus,
    getFiftyThirtyTwenty,
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/dashboard/summary
router.get('/summary', getSummary);

// GET /api/dashboard/expense-by-category
router.get('/expense-by-category', getExpenseByCategory);

// GET /api/dashboard/monthly-trend
router.get('/monthly-trend', getMonthlyTrend);

// GET /api/dashboard/budget-status
router.get('/budget-status', getBudgetStatus);

// GET /api/dashboard/fifty-thirty-twenty
router.get('/fifty-thirty-twenty', getFiftyThirtyTwenty);

module.exports = router;
