const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      sparse: true, // For optional Google OAuth users
    },
    twoFASecret: {
      type: DataTypes.STRING,
      allowNull: true, // Only set if 2FA is enabled
	  encrypt: true, // Use sequelize encryption or HashiCorp Vault (Cybersecurity module)
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // For email verification (optional)
    },
  }, {
    timestamps: true, // Adds createdAt/updatedAt
    indexes: [
      { fields: ['email'] }, // Speed up email lookups
      { fields: ['googleId'] }, // Speed up OAuth lookups
    ],
  });

  return User;
};
