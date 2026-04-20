import Constants from 'expo-constants';

import { getNextBillingDate } from '@/lib/billing';
import { addDays, formatMonthDay } from '@/lib/date-utils';
import { Subscription } from '@/types/subscription';

// NOTE: expo-notifications remote/push APIs were removed from Expo Go on SDK 53+ for Android.
// Loading the module at top-level crashes the JS bundle in that environment, so we lazy-require
// it and wrap every access with a try/catch. In Expo Go notifications become no-ops.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

type NotificationsModule = typeof import('expo-notifications');

let cachedModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

function loadNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (cachedModule !== undefined) return cachedModule;
  try {
    // HACK: require() on purpose so the bundler never eagerly loads expo-notifications.
    // In Expo Go on Android (SDK 53+) the native module is missing and a top-level
    // `import` evaluates to undefined, crashing the whole file.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as NotificationsModule;
    cachedModule = mod;
    if (!handlerConfigured && mod?.setNotificationHandler) {
      mod.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      handlerConfigured = true;
    }
    return mod;
  } catch {
    cachedModule = null;
    return null;
  }
}

export function areNotificationsAvailable() {
  return loadNotifications() !== null;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = loadNotifications();
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    const currentGranted = Boolean(
      (current as any).granted ?? (current as any).status === 'granted'
    );
    if (currentGranted) return true;
    const next = await Notifications.requestPermissionsAsync();
    return Boolean((next as any).granted ?? (next as any).status === 'granted');
  } catch {
    return false;
  }
}

export async function cancelForSubscription(subscription: Subscription): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  try {
    await Promise.all(
      subscription.notificationIds.map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)
      )
    );
  } catch {
    // swallow scheduler errors; UI flow should never break because of notifications
  }
}

export async function scheduleForSubscription(subscription: Subscription): Promise<string[]> {
  const Notifications = loadNotifications();
  if (!Notifications) return [];
  try {
    const nextBilling = getNextBillingDate(subscription);
    const dayBefore = addDays(nextBilling, -1);

    const reminderId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming charge: ${subscription.name}`,
        body: `You will be billed ${subscription.amount} ${subscription.currency} tomorrow.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dayBefore,
      },
    });

    const billingId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Billing day: ${subscription.name}`,
        body: `${subscription.amount} ${subscription.currency} is scheduled today.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextBilling,
      },
    });

    return [reminderId, billingId];
  } catch {
    return [];
  }
}

export async function scheduleWeeklySummary(): Promise<string | null> {
  const Notifications = loadNotifications();
  if (!Notifications) return null;
  try {
    const now = new Date();
    const mondayAtNine = getNextMondayAtNine(now);
    const startDate = mondayAtNine > now ? mondayAtNine : addDays(mondayAtNine, 7);

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly subscription summary',
        body: `Review upcoming recurring charges for week of ${formatMonthDay(startDate)}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2,
        hour: 9,
        minute: 0,
      },
    });
  } catch {
    return null;
  }
}

function getNextMondayAtNine(reference: Date) {
  const next = new Date(reference);
  const day = next.getDay();
  const delta = day === 1 ? 0 : (8 - day) % 7;
  next.setDate(next.getDate() + delta);
  next.setHours(9, 0, 0, 0);
  return next;
}
