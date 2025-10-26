const reportService = require('../services/reportService');

class ReportController {
  async createReport(req, res, next) {
    try {
      const reportData = {
        ...req.body,
        photo_url: req.file ? `/uploads/reports/${req.file.filename}` : null
      };

      const report = await reportService.createReport(reportData);

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req, res, next) {
    try {
      const { reportId } = req.params;
      const report = await reportService.getReportById(reportId);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllReports(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        category_id: req.query.category_id,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo
      };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await reportService.getAllReports(filters, page, limit);

      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReportStatus(req, res, next) {
    try {
      const { reportId } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const report = await reportService.updateReportStatus(
        reportId,
        status,
        req.userId,
        notes
      );

      res.json({
        success: true,
        message: 'Report status updated successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async addReportLog(req, res, next) {
    try {
      const { reportId } = req.params;
      const { action, notes } = req.body;
      const photo_url = req.file ? `/uploads/proofs/${req.file.filename}` : null;

      const log = await reportService.addReportLog(
        reportId,
        req.userId,
        action,
        notes,
        photo_url
      );

      res.status(201).json({
        success: true,
        message: 'Report log added successfully',
        data: log
      });
    } catch (error) {
      next(error);
    }
  }

  async trackReportByPhone(req, res, next) {
    try {
      const { phone } = req.params;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required'
        });
      }

      const reports = await reportService.getReportsByPhone(phone);

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
