import express from 'express';
import { Op } from 'sequelize';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import Proposal from '../models/Proposal.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';

const router = express.Router();

// GET all proposals
router.get('/', async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      include: [
        {
          model: User,
          attributes: ['username', 'photo'],
        },
        {
          model: Vote,
          attributes: ['choice', 'UserId'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(proposals);
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a new proposal
// Protected route, requires user to be logged in.
router.post('/', isAuthenticated, async (req, res) => {
  const { title, description, avatar } = req.body;
  const userId = req.user.id;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  try {
    // Rule: One proposal per user per day.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await Proposal.count({
      where: {
        proposedBy: userId,
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    if (count > 0) {
      return res.status(429).json({ message: 'You can only submit one proposal per day.' });
    }

    const newProposal = await Proposal.create({
      title,
      description,
      avatar,
      proposedBy: userId,
    });

    res.status(201).json(newProposal);
  } catch (error) {
    console.error('Failed to create proposal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 