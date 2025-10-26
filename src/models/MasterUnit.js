const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MasterUnit = sequelize.define('MasterUnit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'master_units',
    timestamps: true,
    underscored: true
  });

  MasterUnit.associate = (models) => {
    MasterUnit.hasMany(models.Assignment, { foreignKey: 'unit_id', as: 'assignments' });
  };

  return MasterUnit;
};
