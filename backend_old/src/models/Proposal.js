import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import User from './User.js';

const Proposal = sequelize.define('Proposal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  proposedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users', // 'Users' is the table name for the User model
      key: 'id',
    },
  },
  // Storing the avatar emoji directly as a string
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Proposal.belongsTo(User, { foreignKey: 'proposedBy' });

export default Proposal; 