// ============================================================================
// Stream Management API Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { StreamLink } from '../models/StreamLink';
import { Task } from '../models/Task';
import { StreamManagementService } from '../services/streamManagementService';

const router = Router();

// Initialize service
const getStreamService = () => {
  const contractId = process.env.STELLAR_CONTRACT_ID || 'mock-contract-id';
  const networkPassphrase = process.env.STELLAR_NETWORK || 'Test SDF Network ; September 2015';
  const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
  return new StreamManagementService(contractId, networkPassphrase, rpcUrl);
};

// ============================================================================
// POST /api/streams/create
// Creates initial stream(s) when assignment starts
// Body: { assignmentId, employerAddress, ambassadorAddress, streamModel }
// ============================================================================
router.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, employerAddress, ambassadorAddress, streamModel } = req.body;

    if (!assignmentId || !employerAddress || !ambassadorAddress) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const task = await Task.findOne({ taskId: assignment.taskId });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const streamService = getStreamService();
    const model = streamModel || 'HYBRID';

    const config = {
      model,
      upfrontPercentage: 30,
      remainingPercentage: 70,
      upfrontDurationHours: 1,
      linearDurationDays: 7,
      postEventDurationDays: 1,
    };

    const streams: any[] = [];

    if (model === 'HYBRID' || model === 'UPFRONT_CHUNK') {
      const upfront = await streamService.createUpfrontStream(
        assignmentId,
        config,
        employerAddress,
        ambassadorAddress,
      );
      streams.push(upfront);
    }

    if (model === 'LINEAR_DURING_EVENT') {
      const linear = await streamService.createLinearStream(
        assignmentId,
        config,
        employerAddress,
        ambassadorAddress,
      );
      streams.push(linear);
    }

    res.status(201).json({
      message: 'Streams created successfully',
      assignmentId,
      streams,
    });
  } catch (error: any) {
    console.error('Error creating streams:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// POST /api/streams/:streamLinkId/pause
// ============================================================================
router.post('/:streamLinkId/pause', async (req: Request, res: Response): Promise<void> => {
  try {
    const { streamLinkId } = req.params;
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    const streamService = getStreamService();
    const updatedStream = await streamService.pauseStream(streamLinkId);

    res.json({
      message: 'Stream paused',
      streamLinkId,
      status: updatedStream.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// POST /api/streams/:streamLinkId/resume
// ============================================================================
router.post('/:streamLinkId/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const { streamLinkId } = req.params;
    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    const streamService = getStreamService();
    const updatedStream = await streamService.resumeStream(streamLinkId);

    res.json({
      message: 'Stream resumed',
      streamLinkId,
      status: updatedStream.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// POST /api/streams/:streamLinkId/top-up
// Body: { additionalAmount, employerAddress }
// ============================================================================
router.post('/:streamLinkId/top-up', async (req: Request, res: Response): Promise<void> => {
  try {
    const { streamLinkId } = req.params;
    const { additionalAmount, employerAddress } = req.body;

    if (!additionalAmount || additionalAmount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    if (!employerAddress) {
      res.status(400).json({ error: 'employerAddress required' });
      return;
    }

    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    const streamService = getStreamService();
    const updatedStream = await streamService.topUpStream(
      streamLinkId,
      additionalAmount,
      employerAddress,
    );

    res.json({
      message: 'Stream topped up',
      streamLinkId,
      newTotal: updatedStream.totalAmount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// POST /api/streams/:streamLinkId/extend
// Body: { newEndTime }
// ============================================================================
router.post('/:streamLinkId/extend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { streamLinkId } = req.params;
    const { newEndTime } = req.body;

    if (!newEndTime) {
      res.status(400).json({ error: 'newEndTime required' });
      return;
    }

    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    const newEndDate = new Date(newEndTime);
    if (isNaN(newEndDate.getTime())) {
      res.status(400).json({ error: 'Invalid date' });
      return;
    }

    const streamService = getStreamService();
    const updatedStream = await streamService.extendStream(streamLinkId, newEndDate);

    res.json({
      message: 'Stream extended',
      streamLinkId,
      newEndTime: updatedStream.streamEndTime,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// POST /api/streams/:streamLinkId/cancel
// Body: { reason }
// ============================================================================
router.post('/:streamLinkId/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const { streamLinkId } = req.params;
    const { reason } = req.body;

    const streamLink = await StreamLink.findOne({ streamLinkId });
    if (!streamLink) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }

    const streamService = getStreamService();
    const updatedStream = await streamService.cancelStream(
      streamLinkId,
      reason || 'Cancelled by admin',
    );

    res.json({
      message: 'Stream cancelled',
      streamLinkId,
      status: updatedStream.status,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GET /api/streams/assignment/:assignmentId
// ============================================================================
router.get('/assignment/:assignmentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const streams = await StreamLink.find({ assignmentId }).sort({ createdAt: -1 });

    res.json({
      assignmentId,
      streams,
      count: streams.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// GET /api/streams/:streamLinkId
// ============================================================================
router.get('/:streamLinkId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { streamLinkId } = req.params;
    const stream = await StreamLink.findOne({ streamLinkId });
    if (!stream) {
      res.status(404).json({ error: 'Stream not found' });
      return;
    }
    res.json({ stream });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
