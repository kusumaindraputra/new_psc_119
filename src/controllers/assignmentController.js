const assignmentService = require('../services/assignmentService');

class AssignmentController {
  async createAssignment(req, res, next) {
    try {
      const assignmentData = {
        ...req.body,
        assigned_by: req.userId
      };

      const assignment = await assignmentService.createAssignment(assignmentData);

      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentById(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const assignment = await assignmentService.getAssignmentById(assignmentId);

      res.json({
        success: true,
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAssignments(req, res, next) {
    try {
      const status = req.query.status;
      const assignments = await assignmentService.getAssignmentsByUser(req.userId, status);

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAssignments(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        assigned_to: req.query.assigned_to,
        unit_id: req.query.unit_id
      };

      const assignments = await assignmentService.getAllAssignments(filters);

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAssignmentStatus(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const { status, notes } = req.body;
      const photo_url = req.file ? `/uploads/proofs/${req.file.filename}` : null;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const assignment = await assignmentService.updateAssignmentStatus(
        assignmentId,
        status,
        req.userId,
        notes,
        photo_url
      );

      res.json({
        success: true,
        message: 'Assignment status updated successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();
