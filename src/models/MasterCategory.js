const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MasterCategory = sequelize.define('MasterCategory', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'master_categories',
    timestamps: true,
    underscored: true
  });

  MasterCategory.associate = (models) => {
    MasterCategory.hasMany(models.Report, { foreignKey: 'category_id', as: 'reports' });
  };

  return MasterCategory;
};
