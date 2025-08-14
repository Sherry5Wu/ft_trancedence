import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
       allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
       allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
       allowNull: true,
    },
    replacedByToken: {
      type: DataTypes.STRING, // Useful for token rotation tracking
       allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING, // track IP for security/audit
       allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING, // track device/browser info
       allowNull: true,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['token'] }, // for quick lookup of token
    ]
  });

  // It defines a Sequelize association between the RefreshToken model and the User model
  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId', // This links the RefreshToken record to a specific User record by its id
      as: 'user', // This creates an alias for the association when querying
    });
  };

  return RefreshToken;
};
