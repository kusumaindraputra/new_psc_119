const { MasterCategory, MasterUnit, MasterVehicle } = require('../models');

class AdminController {
  // Categories
  async getAllCategories(req, res, next) {
    try {
      const categories = await MasterCategory.findAll({
        where: req.query.is_active !== undefined ? { is_active: req.query.is_active } : {}
      });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await MasterCategory.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await MasterCategory.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await category.update(req.body);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const category = await MasterCategory.findByPk(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Units
  async getAllUnits(req, res, next) {
    try {
      const units = await MasterUnit.findAll({
        where: req.query.is_active !== undefined ? { is_active: req.query.is_active } : {}
      });

      res.json({
        success: true,
        data: units
      });
    } catch (error) {
      next(error);
    }
  }

  async createUnit(req, res, next) {
    try {
      const body = { ...req.body };
      // Normalize optional coordinates GeoJSON -> latitude/longitude
      if (body.coordinates) {
        try {
          const coordObj = typeof body.coordinates === 'string' ? JSON.parse(body.coordinates) : body.coordinates;
          if (coordObj && coordObj.type === 'Point' && Array.isArray(coordObj.coordinates) && coordObj.coordinates.length === 2) {
            body.longitude = Number(coordObj.coordinates[0]);
            body.latitude = Number(coordObj.coordinates[1]);
          }
        } catch (_) {
          // ignore
        }
        delete body.coordinates;
      }

      const unit = await MasterUnit.create(body);

      res.status(201).json({
        success: true,
        message: 'Unit created successfully',
        data: unit
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUnit(req, res, next) {
    try {
      const { unitId } = req.params;
      const unit = await MasterUnit.findByPk(unitId);

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Unit not found'
        });
      }

      const body = { ...req.body };
      if (body.coordinates) {
        try {
          const coordObj = typeof body.coordinates === 'string' ? JSON.parse(body.coordinates) : body.coordinates;
          if (coordObj && coordObj.type === 'Point' && Array.isArray(coordObj.coordinates) && coordObj.coordinates.length === 2) {
            body.longitude = Number(coordObj.coordinates[0]);
            body.latitude = Number(coordObj.coordinates[1]);
          }
        } catch (_) {
          // ignore
        }
        delete body.coordinates;
      }

      await unit.update(body);

      res.json({
        success: true,
        message: 'Unit updated successfully',
        data: unit
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUnit(req, res, next) {
    try {
      const { unitId } = req.params;
      const unit = await MasterUnit.findByPk(unitId);

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Unit not found'
        });
      }

      await unit.destroy();

      res.json({
        success: true,
        message: 'Unit deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Vehicles
  async getAllVehicles(req, res, next) {
    try {
      const where = {};
      
      if (req.query.status) {
        where.status = req.query.status;
      }
      
      if (req.query.is_active !== undefined) {
        where.is_active = req.query.is_active;
      }

      const vehicles = await MasterVehicle.findAll({
        where,
        include: [{ model: MasterUnit, as: 'unit' }]
      });

      res.json({
        success: true,
        data: vehicles
      });
    } catch (error) {
      next(error);
    }
  }

  async createVehicle(req, res, next) {
    try {
      const vehicle = await MasterVehicle.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVehicle(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const vehicle = await MasterVehicle.findByPk(vehicleId);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      await vehicle.update(req.body);

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVehicle(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const vehicle = await MasterVehicle.findByPk(vehicleId);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      await vehicle.destroy();

      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
