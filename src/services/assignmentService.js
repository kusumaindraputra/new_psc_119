const { Assignment, Report, User, MasterVehicle, MasterUnit, ReportLog } = require('../models');
const eventEmitter = require('../events/eventEmitter');

class AssignmentService {
  async createAssignment(assignmentData) {
    const { report_id, assigned_to, assigned_by, vehicle_id, unit_id, notes } = assignmentData;

    // Verify report exists and is in correct status
    const report = await Report.findByPk(report_id);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    if (!['verified', 'pending'].includes(report.status)) {
      const error = new Error('Report must be verified before assignment');
      error.statusCode = 400;
      throw error;
    }

    // Verify assignee exists
    const assignee = await User.findByPk(assigned_to);
    if (!assignee) {
      const error = new Error('Assignee not found');
      error.statusCode = 404;
      throw error;
    }

    // Create assignment
    const assignment = await Assignment.create({
      report_id,
      assigned_to,
      assigned_by,
      vehicle_id,
      unit_id,
      notes,
      status: 'pending',
      assigned_at: new Date()
    });

    // Update report status
    await report.update({ status: 'assigned' });

    // Create log entry
    await ReportLog.create({
      report_id,
      actor_id: assigned_by,
      action: 'assigned_to_field_officer',
      notes: `Assigned to ${assignee.name}`
    });

    // Emit SSE event
    eventEmitter.emit('assigned_task', {
      assignmentId: assignment.id,
      reportId: report_id,
      assignedTo: assigned_to,
      assigneeName: assignee.name,
      assignedAt: assignment.assigned_at
    });

    return assignment;
  }

  async getAssignmentById(assignmentId) {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [
        { model: Report, as: 'report', include: ['category'] },
        { model: User, as: 'assignee' },
        { model: User, as: 'assigner' },
        { model: MasterVehicle, as: 'vehicle' },
        { model: MasterUnit, as: 'unit' }
      ]
    });

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    return assignment;
  }

  async getAssignmentsByUser(userId, status = null) {
    const where = { assigned_to: userId };
    
    if (status) {
      where.status = status;
    }

    const assignments = await Assignment.findAll({
      where,
      include: [
        { model: Report, as: 'report', include: ['category'] },
        { model: MasterVehicle, as: 'vehicle' },
        { model: MasterUnit, as: 'unit' }
      ],
      order: [['assigned_at', 'DESC']]
    });

    return assignments;
  }

  async getAllAssignments(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assigned_to) {
      where.assigned_to = filters.assigned_to;
    }

    if (filters.unit_id) {
      where.unit_id = filters.unit_id;
    }

    const assignments = await Assignment.findAll({
      where,
      include: [
        { model: Report, as: 'report', include: ['category'] },
        { model: User, as: 'assignee' },
        { model: User, as: 'assigner' },
        { model: MasterVehicle, as: 'vehicle' },
        { model: MasterUnit, as: 'unit' }
      ],
      order: [['assigned_at', 'DESC']]
    });

    return assignments;
  }

  async updateAssignmentStatus(assignmentId, status, actorId, notes = null, photo_url = null) {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Report, as: 'report' }]
    });

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData = { status };

    if (status === 'accepted') {
      updateData.accepted_at = new Date();
    } else if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await assignment.update(updateData);

    // Update report status accordingly
    let reportStatus = assignment.report.status;
    if (status === 'in_progress') {
      reportStatus = 'in_progress';
    } else if (status === 'completed') {
      reportStatus = 'closed';
    }

    await assignment.report.update({ 
      status: reportStatus,
      closed_at: status === 'completed' ? new Date() : assignment.report.closed_at
    });

    // Create log entry
    await ReportLog.create({
      report_id: assignment.report_id,
      actor_id: actorId,
      action: `assignment_${status}`,
      notes: notes || `Assignment status changed to ${status}`,
      photo_url
    });

    // Emit SSE event
    eventEmitter.emit('report_update', {
      reportId: assignment.report_id,
      assignmentId: assignment.id,
      status: reportStatus,
      assignmentStatus: status,
      updatedAt: new Date()
    });

    return assignment;
  }
}

module.exports = new AssignmentService();
