const express = require('express');
const router = express.Router();
const { MasterCategory } = require('../models');

// Public: Get all categories (no auth)
router.get('/', async (req, res, next) => {
  try {
    const categories = await MasterCategory.findAll({
      where: req.query.is_active !== undefined ? { is_active: req.query.is_active } : {}
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
