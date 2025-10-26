const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Assignment = sequelize.define('Assignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    report_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'reports',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'master_vehicles',
        key: 'id'
      }
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'master_units',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'assignments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['report_id']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['status']
      }
    ]
  });

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Report, { foreignKey: 'report_id', as: 'report' });
    Assignment.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
    Assignment.belongsTo(models.User, { foreignKey: 'assigned_by', as: 'assigner' });
    Assignment.belongsTo(models.MasterVehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
    Assignment.belongsTo(models.MasterUnit, { foreignKey: 'unit_id', as: 'unit' });
  };

  return Assignment;
};
