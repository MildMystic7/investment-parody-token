import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import Proposal from './Proposal.js';
import Vote from './Vote.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    comment: "The user's X ID",
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: "The user's X handle (e.g., @username)",
  },
  displayName: {
    type: DataTypes.STRING,
    comment: "The user's display name on X",
  },
  photo: {
    type: DataTypes.STRING,
    comment: "URL to the user's profile picture",
  },
  followersCount: {
    type: DataTypes.INTEGER,
    comment: "The user's followers count on X",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: "User email for email/password login",
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Hashed password for email login",
  },
});

User.hasMany(Proposal, { foreignKey: 'proposedBy' });
User.hasMany(Vote);

export default User; 