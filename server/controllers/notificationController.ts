import { Response } from 'express';
import { Notification } from '../models/Notification.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let notifications: any[] = [];
    try {
      notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(30);
    } catch {}

    if (!notifications || notifications.length === 0) {
      const all = await memoryStore.notifications.find({ recipient: req.user.id });
      notifications = all.reverse();
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      unreadCount,
      notifications: notifications.map(n => ({
        id: n._id || n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      try {
        await Notification.updateMany({ recipient: req.user?.id }, { $set: { read: true } });
      } catch {}
      const userNotifs = await memoryStore.notifications.find({ recipient: req.user?.id });
      for (const n of userNotifs) {
        await memoryStore.notifications.findByIdAndUpdate(n._id || n.id, { read: true });
      }
      res.json({ success: true, message: 'All notifications marked as read' });
      return;
    }

    try {
      await Notification.findByIdAndUpdate(id, { $set: { read: true } });
    } catch {}
    await memoryStore.notifications.findByIdAndUpdate(id, { read: true });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to mark notification', error: error.message });
  }
};
