import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import Vote from '../models/Vote.js';
import Proposal from '../models/Proposal.js';

const router = express.Router();

// Vote on a proposal
router.post('/:proposalId', isAuthenticated, async (req, res) => {
    const { proposalId } = req.params;
    const { choice } = req.body; // 'for' or 'against'
    const userId = req.user.id;

    if (!['for', 'against'].includes(choice)) {
        return res.status(400).json({ message: "Invalid vote choice. Must be 'for' or 'against'." });
    }

    try {
        const proposal = await Proposal.findByPk(proposalId);
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found.' });
        }

        // Check if the user has already voted on this specific proposal
        const existingVote = await Vote.findOne({
            where: {
                UserId: userId,
                ProposalId: proposalId,
            },
        });

        if (existingVote) {
            return res.status(409).json({ message: 'You have already voted on this proposal.' });
        }

        const vote = await Vote.create({
            choice,
            UserId: userId,
            ProposalId: proposalId,
        });

        res.status(201).json(vote);
    } catch (error) {
        // Handle potential unique constraint violation gracefully
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(409).json({ message: 'You have already voted on this proposal.' });
        }
        console.error('Failed to cast vote:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all votes for the currently logged-in user
router.get('/user-votes', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        const votes = await Vote.findAll({
            where: { UserId: userId },
            attributes: ['ProposalId', 'choice'], // Return only what's needed
        });
        // Respond with a map for easier lookup on the frontend, e.g., { proposalId: 'for' }
        const voteMap = votes.reduce((acc, vote) => {
            acc[vote.ProposalId] = vote.choice;
            return acc;
        }, {});
        res.json(voteMap);
    } catch (error) {
        console.error('Failed to fetch user votes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
