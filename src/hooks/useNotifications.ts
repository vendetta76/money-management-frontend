import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { useAuth } from '../context/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'income' | 'outcome' | 'transfer' | 'achievement' | 'reminder' | 'warning' | 'info';
  read: boolean;
  createdAt: any;
  data?: any; // Additional data for the notification
  actionUrl?: string; // URL to navigate when clicked
}

export type NotificationType = Notification['type'];

// 🔔 Main notification hook
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 📡 Listen to notifications from Firebase
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // ✅ Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  // ✅ Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const batch = [];
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, 'users', user.uid, 'notifications', notification.id);
        batch.push(updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        }));
      }

      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user, notifications]);

  // 🔔 Create new notification
  const createNotification = useCallback(async (
    title: string,
    message: string,
    type: NotificationType,
    data?: any,
    actionUrl?: string
  ) => {
    if (!user) return;

    try {
      const notificationsRef = collection(db, 'users', user.uid, 'notifications');
      await addDoc(notificationsRef, {
        title,
        message,
        type,
        read: false,
        createdAt: serverTimestamp(),
        data: data || null,
        actionUrl: actionUrl || null
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification
  };
};

// 🚀 Auto-notification generator hook
export const useAutoNotifications = () => {
  const { createNotification } = useNotifications();
  
  // 💰 Transaction notifications
  const notifyTransaction = useCallback((
    type: 'income' | 'outcome' | 'transfer',
    amount: number,
    currency: string,
    description?: string
  ) => {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'USD',
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(amount);

    switch (type) {
      case 'income':
        createNotification(
          '💰 Pemasukan Baru',
          `Pemasukan sebesar ${formattedAmount}${description ? ` - ${description}` : ''}`,
          'income',
          { amount, currency, description }
        );
        break;
      case 'outcome':
        createNotification(
          '💸 Pengeluaran Baru', 
          `Pengeluaran sebesar ${formattedAmount}${description ? ` - ${description}` : ''}`,
          'outcome',
          { amount, currency, description }
        );
        break;
      case 'transfer':
        createNotification(
          '🔄 Transfer Berhasil',
          `Transfer sebesar ${formattedAmount}${description ? ` - ${description}` : ''}`,
          'transfer',
          { amount, currency, description }
        );
        break;
    }
  }, [createNotification]);

  // 🎯 Goal achievement notifications
  const notifyGoalAchievement = useCallback((goalName: string, amount: number, currency: string) => {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'USD',
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(amount);

    createNotification(
      '🎉 Target Tercapai!',
      `Selamat! Target ${goalName} sebesar ${formattedAmount} telah tercapai!`,
      'achievement',
      { goalName, amount, currency }
    );
  }, [createNotification]);

  // ⚠️ Budget warning notifications
  const notifyBudgetWarning = useCallback((category: string, spentPercent: number) => {
    if (spentPercent >= 90) {
      createNotification(
        '⚠️ Budget Hampir Habis',
        `Budget ${category} sudah terpakai ${spentPercent.toFixed(0)}%`,
        'warning',
        { category, spentPercent }
      );
    } else if (spentPercent >= 100) {
      createNotification(
        '🚨 Budget Terlampaui',
        `Budget ${category} sudah melebihi batas!`,
        'warning',
        { category, spentPercent }
      );
    }
  }, [createNotification]);

  // 📅 Reminder notifications
  const notifyReminder = useCallback((title: string, message: string, actionUrl?: string) => {
    createNotification(
      `📅 ${title}`,
      message,
      'reminder',
      null,
      actionUrl
    );
  }, [createNotification]);

  // 📊 Weekly/Monthly summary
  const notifySummary = useCallback((
    period: 'weekly' | 'monthly',
    totalIncome: number,
    totalOutcome: number,
    currency: string
  ) => {
    const income = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'USD',
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(totalIncome);

    const outcome = new Intl.NumberFormat('id-ID', {
      style: 'currency', 
      currency: currency === 'IDR' ? 'IDR' : 'USD',
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(totalOutcome);

    const net = totalIncome - totalOutcome;
    const netFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'USD', 
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(Math.abs(net));

    createNotification(
      `📊 Ringkasan ${period === 'weekly' ? 'Mingguan' : 'Bulanan'}`,
      `Pemasukan: ${income}, Pengeluaran: ${outcome}. ${net >= 0 ? `Surplus ${netFormatted}` : `Defisit ${netFormatted}`}`,
      'info',
      { period, totalIncome, totalOutcome, net, currency }
    );
  }, [createNotification]);

  return {
    notifyTransaction,
    notifyGoalAchievement, 
    notifyBudgetWarning,
    notifyReminder,
    notifySummary
  };
};

// 🎨 Notification icons and colors
export const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'income':
      return '💰';
    case 'outcome':
      return '💸';
    case 'transfer':
      return '🔄';
    case 'achievement':
      return '🎉';
    case 'reminder':
      return '📅';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '🔔';
  }
};

export const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'income':
      return '#4CAF50'; // Green
    case 'outcome':
      return '#F44336'; // Red
    case 'transfer':
      return '#2196F3'; // Blue
    case 'achievement':
      return '#FF9800'; // Orange
    case 'reminder':
      return '#9C27B0'; // Purple
    case 'warning':
      return '#FF5722'; // Deep Orange
    case 'info':
      return '#607D8B'; // Blue Grey
    default:
      return '#757575'; // Grey
  }
};