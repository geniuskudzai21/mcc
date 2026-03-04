import { Router } from 'express';
import { prisma } from '../config/database';

const router = Router();

router.get('/announcements', async (req, res, next) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { created_at: 'desc' },
            take: 5
        });
        res.json(announcements);
    } catch (err) {
        next(err);
    }
});

export default router;
