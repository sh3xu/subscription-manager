export type BillingCycle = 'monthly' | 'yearly' | 'custom';
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  customCycleDays: number | null;
  startDate: string;
  status: SubscriptionStatus;
  serviceKey: string | null;
  color: string | null;
  notificationIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'notificationIds'> & {
  id?: string;
  notificationIds?: string[];
};

export type TimelineCharge = {
  subscriptionId: string;
  subscriptionName: string;
  date: string;
  amount: number;
  currency: string;
};

export type AppThemePreference = 'system' | 'light' | 'dark';
