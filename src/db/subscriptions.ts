import { getDb } from '@/db';
import { Subscription, SubscriptionInput } from '@/types/subscription';

function mapRow(row: any): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    currency: row.currency,
    billingCycle: row.billing_cycle,
    customCycleDays: row.custom_cycle_days,
    startDate: row.start_date,
    status: row.status,
    serviceKey: row.service_key,
    color: row.color,
    notificationIds: row.notification_ids ? JSON.parse(row.notification_ids) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSubscriptions() {
  const rows = await getDb().getAllAsync('SELECT * FROM subscriptions ORDER BY created_at DESC');
  return rows.map(mapRow);
}

export async function getSubscriptionById(id: string) {
  const row = await getDb().getFirstAsync('SELECT * FROM subscriptions WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

export async function insertSubscription(payload: SubscriptionInput) {
  const now = Date.now();
  const id = payload.id ?? `${now}-${Math.random().toString(36).slice(2, 10)}`;
  await getDb().runAsync(
    `INSERT INTO subscriptions
      (id, name, amount, currency, billing_cycle, custom_cycle_days, start_date, status, service_key, color, notification_ids, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.name,
      payload.amount,
      payload.currency,
      payload.billingCycle,
      payload.customCycleDays,
      payload.startDate,
      payload.status,
      payload.serviceKey,
      payload.color,
      JSON.stringify(payload.notificationIds ?? []),
      now,
      now,
    ]
  );
  return getSubscriptionById(id);
}

export async function updateSubscription(id: string, payload: Partial<SubscriptionInput>) {
  const current = await getSubscriptionById(id);
  if (!current) return null;

  const merged = { ...current, ...payload };
  await getDb().runAsync(
    `UPDATE subscriptions
      SET name = ?, amount = ?, currency = ?, billing_cycle = ?, custom_cycle_days = ?, start_date = ?, status = ?, service_key = ?, color = ?, notification_ids = ?, updated_at = ?
      WHERE id = ?`,
    [
      merged.name,
      merged.amount,
      merged.currency,
      merged.billingCycle,
      merged.customCycleDays,
      merged.startDate,
      merged.status,
      merged.serviceKey,
      merged.color,
      JSON.stringify(merged.notificationIds ?? []),
      Date.now(),
      id,
    ]
  );
  return getSubscriptionById(id);
}

export async function deleteSubscription(id: string) {
  await getDb().runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
}
