const { Report, ReportLog, MasterCategory, Assignment } = require('../models');
const { Op } = require('sequelize');
const eventEmitter = require('../events/eventEmitter');

class ReportService {
  async createReport(reportData) {
    const { reporter_name, phone, description, coordinates, address, photo_url, source, category_id } = reportData;

    // Normalize coordinates from GeoJSON or raw values
    let latitude = null;
    let longitude = null;
    if (coordinates) {
      try {
        const coordObj = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        if (coordObj && coordObj.type === 'Point' && Array.isArray(coordObj.coordinates) && coordObj.coordinates.length === 2) {
          // GeoJSON order: [lng, lat]
          longitude = Number(coordObj.coordinates[0]);
          latitude = Number(coordObj.coordinates[1]);
        }
      } catch (e) {
        // ignore parse errors; validation below will handle missing values
      }
    }

    if (latitude == null || Number.isNaN(latitude) || longitude == null || Number.isNaN(longitude)) {
      const err = new Error('Valid coordinates are required');
      err.statusCode = 400;
      throw err;
    }

    const report = await Report.create({
      reporter_name,
      phone,
      description,
      latitude,
      longitude,
      address,
      photo_url,
      source: source || 'web',
      category_id,
      status: 'pending'
    });

    // Create log entry
    await ReportLog.create({
      report_id: report.id,
      action: 'report_created',
      notes: 'Report submitted by citizen'
    });

    // Emit SSE event
    eventEmitter.emit('new_report', {
      reportId: report.id,
      reporterName: reporter_name,
      status: 'pending',
      latitude,
      longitude,
      createdAt: report.created_at
    });

    return report;
  }

  async getReportById(reportId, includeRelations = true) {
    const options = {
      where: { id: reportId }
    };

    if (includeRelations) {
      options.include = [
        { model: MasterCategory, as: 'category' },
        { model: Assignment, as: 'assignments', include: ['assignee', 'vehicle', 'unit'] },
        { model: ReportLog, as: 'logs', include: ['actor'], order: [['created_at', 'ASC']] }
      ];
    }

    const report = await Report.findOne(options);

    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    return report;
  }

  async getAllReports(filters = {}, page = 1, limit = 20) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.category_id) {
      where.category_id = filters.category_id;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at[Op.gte] = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.created_at[Op.lte] = new Date(filters.dateTo);
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: MasterCategory, as: 'category' },
        { model: Assignment, as: 'assignments' }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      reports: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async updateReportStatus(reportId, status, actorId = null, notes = null) {
    const report = await Report.findByPk(reportId);

    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData = { status };

    if (status === 'verified') {
      updateData.verified_at = new Date();
    } else if (status === 'closed') {
      updateData.closed_at = new Date();
    }

    await report.update(updateData);

    // Create log entry
    await ReportLog.create({
      report_id: reportId,
      actor_id: actorId,
      action: `status_changed_to_${status}`,
      notes: notes || `Status changed to ${status}`
    });

    // Emit SSE event
    eventEmitter.emit('report_update', {
      reportId: report.id,
      status,
      updatedAt: new Date()
    });

    return report;
  }

  async addReportLog(reportId, actorId, action, notes, photo_url = null) {
    const log = await ReportLog.create({
      report_id: reportId,
      actor_id: actorId,
      action,
      notes,
      photo_url
    });

    return log;
  }

  async getReportsByPhone(phone) {
    const reports = await Report.findAll({
      where: { phone },
      order: [['created_at', 'DESC']],
      include: [
        { model: MasterCategory, as: 'category' },
        { 
          model: Assignment, 
          as: 'assignments',
          include: [
            { association: 'assignee' },
            { association: 'vehicle' },
            { association: 'unit' }
          ]
        }
      ]
    });

    return reports;
  }
}

module.exports = new ReportService();
