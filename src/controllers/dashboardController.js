const { Report, Assignment, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

class DashboardController {
  async getMetrics(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const dateFilter = {};
      if (dateFrom || dateTo) {
        dateFilter.created_at = {};
        if (dateFrom) dateFilter.created_at[Op.gte] = new Date(dateFrom);
        if (dateTo) dateFilter.created_at[Op.lte] = new Date(dateTo);
      }

      // Total reports by status
      const reportsByStatus = await Report.findAll({
        where: dateFilter,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Total reports by priority
      const reportsByPriority = await Report.findAll({
        where: dateFilter,
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority']
      });

      // Response time metrics (average time from pending to assigned)
      const responseTimeQuery = await sequelize.query(`
        SELECT 
          AVG(EXTRACT(EPOCH FROM (verified_at - created_at))/60) as avg_verification_minutes,
          AVG(EXTRACT(EPOCH FROM (closed_at - created_at))/3600) as avg_closure_hours
        FROM reports
        WHERE verified_at IS NOT NULL
        ${dateFrom ? `AND created_at >= '${dateFrom}'` : ''}
        ${dateTo ? `AND created_at <= '${dateTo}'` : ''}
      `, { type: sequelize.QueryTypes.SELECT });

      // Assignment metrics
      const assignmentsByStatus = await Assignment.findAll({
        where: dateFilter,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Active field officers
      const activeFieldOfficers = await User.count({
        where: {
          role: 'field_officer',
          is_active: true
        }
      });

      // SLA metrics (reports closed within 24 hours)
      const slaMetrics = await sequelize.query(`
        SELECT 
          COUNT(CASE WHEN closed_at - created_at <= INTERVAL '24 hours' THEN 1 END) as within_sla,
          COUNT(CASE WHEN closed_at - created_at > INTERVAL '24 hours' THEN 1 END) as exceeded_sla,
          COUNT(*) as total_closed
        FROM reports
        WHERE status = 'closed'
        ${dateFrom ? `AND created_at >= '${dateFrom}'` : ''}
        ${dateTo ? `AND created_at <= '${dateTo}'` : ''}
      `, { type: sequelize.QueryTypes.SELECT });

      res.json({
        success: true,
        data: {
          reportsByStatus: reportsByStatus.map(r => ({
            status: r.status,
            count: parseInt(r.dataValues.count)
          })),
          reportsByPriority: reportsByPriority.map(r => ({
            priority: r.priority,
            count: parseInt(r.dataValues.count)
          })),
          assignmentsByStatus: assignmentsByStatus.map(a => ({
            status: a.status,
            count: parseInt(a.dataValues.count)
          })),
          responseTime: {
            avgVerificationMinutes: parseFloat(responseTimeQuery[0]?.avg_verification_minutes || 0).toFixed(2),
            avgClosureHours: parseFloat(responseTimeQuery[0]?.avg_closure_hours || 0).toFixed(2)
          },
          sla: {
            withinSLA: parseInt(slaMetrics[0]?.within_sla || 0),
            exceededSLA: parseInt(slaMetrics[0]?.exceeded_sla || 0),
            totalClosed: parseInt(slaMetrics[0]?.total_closed || 0),
            slaPercentage: slaMetrics[0]?.total_closed > 0 
              ? ((parseInt(slaMetrics[0].within_sla) / parseInt(slaMetrics[0].total_closed)) * 100).toFixed(2)
              : 0
          },
          activeFieldOfficers
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const recentReports = await Report.findAll({
        order: [['created_at', 'DESC']],
        limit,
        include: ['category']
      });

      const recentAssignments = await Assignment.findAll({
        order: [['assigned_at', 'DESC']],
        limit,
        include: ['report', 'assignee']
      });

      res.json({
        success: true,
        data: {
          recentReports,
          recentAssignments
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPerformanceByOfficer(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      
      let dateCondition = '';
      if (dateFrom || dateTo) {
        dateCondition = 'WHERE ';
        if (dateFrom) dateCondition += `a.assigned_at >= '${dateFrom}'`;
        if (dateTo) dateCondition += `${dateFrom ? ' AND ' : ''}a.assigned_at <= '${dateTo}'`;
      }

      const performanceQuery = await sequelize.query(`
        SELECT 
          u.id,
          u.name,
          COUNT(a.id) as total_assignments,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assignments,
          COUNT(CASE WHEN a.status = 'in_progress' THEN 1 END) as in_progress_assignments,
          AVG(EXTRACT(EPOCH FROM (a.completed_at - a.assigned_at))/3600) as avg_completion_hours
        FROM users u
        LEFT JOIN assignments a ON u.id = a.assigned_to
        ${dateCondition}
        WHERE u.role = 'field_officer' AND u.is_active = true
        GROUP BY u.id, u.name
        ORDER BY total_assignments DESC
      `, { type: sequelize.QueryTypes.SELECT });

      res.json({
        success: true,
        data: performanceQuery.map(p => ({
          id: p.id,
          name: p.name,
          totalAssignments: parseInt(p.total_assignments),
          completedAssignments: parseInt(p.completed_assignments),
          inProgressAssignments: parseInt(p.in_progress_assignments),
          avgCompletionHours: parseFloat(p.avg_completion_hours || 0).toFixed(2)
        }))
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
