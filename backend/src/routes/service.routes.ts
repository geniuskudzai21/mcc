import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { property_id, category, description, media_url } = req.body;

        const request = await prisma.serviceRequest.create({
            data: {
                user_id: req.user?.id as string,
                property_id,
                category,
                description,
                media_url
            }
        });

        res.status(201).json({
            message: 'Service request submitted successfully',
            request
        });
    } catch (err) {
        next(err);
    }
});

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const requests = await prisma.serviceRequest.findMany({
            where: { user_id: req.user?.id },
            include: {
                property: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
});

router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const id = req.params.id as string;
        const { category, description } = req.body;

        const request = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.user_id !== req.user?.id) return res.status(403).json({ message: 'Unauthorized' });

        // Only allow editing if pending
        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Cannot edit a request that is already being processed' });
        }

        const updated = await prisma.serviceRequest.update({
            where: { id },
            data: { category, description }
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const id = req.params.id as string;

        const request = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.user_id !== req.user?.id) return res.status(403).json({ message: 'Unauthorized' });

        // Only allow deleting if pending
        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: 'Cannot delete a request that is already being processed' });
        }

        await prisma.serviceRequest.delete({ where: { id } });
        res.json({ message: 'Request deleted successfully' });
    } catch (err) {
        next(err);
    }
});

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const request = await prisma.serviceRequest.findUnique({
            where: { id: req.params.id as string },
            include: {
                property: true
            }
        });

        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.user_id !== req.user?.id) return res.status(403).json({ message: 'Unauthorized' });

        res.json(request);
    } catch (err) {
        next(err);
    }
});

export default router;
