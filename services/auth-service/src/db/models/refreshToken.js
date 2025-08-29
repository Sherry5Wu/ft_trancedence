import { DataTypes } from 'sequelize'

export default (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tokenHash: {
      type: DataTypes.STRING(64),
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
    replacedByTokenHash: {
      type: DataTypes.STRING(64), // Useful for token rotation tracking
       allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45), // track IP for security/audit, IPv6 max 45 chars
       allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(1024), // track device/browser info, Practical limit: 512–1024 chars
       allowNull: true,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['tokenHash'] }, // for quick lookup of token
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
