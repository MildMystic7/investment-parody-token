import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';
import User from './User.js';
import Proposal from './Proposal.js';

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  choice: {
    type: DataTypes.ENUM('for', 'against'),
    allowNull: false,
  },
});

// Define relationships
User.hasMany(Vote);
Vote.belongsTo(User);

Proposal.hasMany(Vote);
Vote.belongsTo(Proposal);

// A user can only vote once on a single proposal
// We'll enforce this at the application level before saving,
// but a unique constraint is a good safeguard.
sequelize.sync().then(() => {
  sequelize.getQueryInterface().addConstraint('Votes', {
    fields: ['UserId', 'ProposalId'],
    type: 'unique',
    name: 'unique_user_proposal_vote'
  }).catch(err => {
    // Ignore error if constraint already exists
    if (err.name !== 'SequelizeUniqueConstraintError') {
      console.error('Failed to add unique constraint to Votes table:', err);
    }
  });
});


export default Vote; 