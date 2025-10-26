const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MasterVehicle = sequelize.define('MasterVehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    plate_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('ambulance', 'rescue', 'support', 'other'),
      allowNull: false,
      defaultValue: 'ambulance'
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'unavailable'),
      allowNull: false,
      defaultValue: 'available'
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'master_units',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'master_vehicles',
    timestamps: true,
    underscored: true
  });

  MasterVehicle.associate = (models) => {
    MasterVehicle.belongsTo(models.MasterUnit, { foreignKey: 'unit_id', as: 'unit' });
    MasterVehicle.hasMany(models.Assignment, { foreignKey: 'vehicle_id', as: 'assignments' });
  };

  return MasterVehicle;
};
