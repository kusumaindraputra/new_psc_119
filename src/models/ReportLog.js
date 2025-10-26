const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReportLog = sequelize.define('ReportLog', {
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
    actor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    tableName: 'report_logs',
    timestamps: true,
    underscored: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['report_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  ReportLog.associate = (models) => {
    ReportLog.belongsTo(models.Report, { foreignKey: 'report_id', as: 'report' });
    ReportLog.belongsTo(models.User, { foreignKey: 'actor_id', as: 'actor' });
  };

  return ReportLog;
};
