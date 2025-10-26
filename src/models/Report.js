const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reporter_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'assigned', 'in_progress', 'closed', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    source: {
      type: DataTypes.ENUM('web', 'mobile', 'phone', 'other'),
      defaultValue: 'web'
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'master_categories',
        key: 'id'
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'reports',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  Report.associate = (models) => {
    Report.hasMany(models.Assignment, { foreignKey: 'report_id', as: 'assignments' });
    Report.hasMany(models.ReportLog, { foreignKey: 'report_id', as: 'logs' });
    Report.belongsTo(models.MasterCategory, { foreignKey: 'category_id', as: 'category' });
  };

  return Report;
};
