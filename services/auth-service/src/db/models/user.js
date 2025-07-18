import { DataTypes } from 'sequelize';

export default (sequelize) => {
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
      //sparse: true, // For optional Google OAuth users
    },
    twoFASecret: {
      type: DataTypes.STRING,
      allowNull: true, // Only set if 2FA is enabled
	    //encrypt: true, // Use sequelize encryption or HashiCorp Vault (Cybersecurity module)
    },
    backupCodes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is2FAEnalbed: {
      type: DataTypes.VIRTUAL,
      get() {
        return !!this.twoFASecret;
      }
    },
  }, {
    // timestamps: ture, it tells Sequelize to add createdAt and updatedAt two columns
    // into User table
    timestamps: true,
    // indexes option in a Sequelize model definition tells sequelize to add indexed to
    // specific columns in the User table when it creates or sycns the database schema.
    indexes: [
      { fields: ['email'] }, // Speed up email lookups
      { fields: ['googleId'] }, // Speed up OAuth lookups
    ],
  });

  return User;
};

