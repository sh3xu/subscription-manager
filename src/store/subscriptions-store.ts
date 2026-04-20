import { create } from 'zustand';

import {
  deleteSubscription,
  insertSubscription,
  listSubscriptions,
  updateSubscription,
} from '@/db/subscriptions';
import { Subscription, SubscriptionInput } from '@/types/subscription';

type SubscriptionState = {
  items: Subscription[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addSubscription: (payload: SubscriptionInput) => Promise<Subscription | null>;
  updateSubscriptionById: (id: string, payload: Partial<SubscriptionInput>) => Promise<Subscription | null>;
  removeSubscription: (id: string) => Promise<void>;
};

export const useSubscriptionsStore = create<SubscriptionState>((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: async () => {
    const items = await listSubscriptions();
    set({ items, hydrated: true });
  },
  addSubscription: async (payload) => {
    const subscription = await insertSubscription(payload);
    if (!subscription) return null;
    set({ items: [subscription, ...get().items] });
    return subscription;
  },
  updateSubscriptionById: async (id, payload) => {
    const updated = await updateSubscription(id, payload);
    if (!updated) return null;
    set({
      items: get().items.map((item) => (item.id === id ? updated : item)),
    });
    return updated;
  },
  removeSubscription: async (id) => {
    await deleteSubscription(id);
    set({ items: get().items.filter((item) => item.id !== id) });
  },
}));
