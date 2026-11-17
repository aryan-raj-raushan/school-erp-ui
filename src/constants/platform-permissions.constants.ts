export const PLATFORM_PERMISSIONS = {
  dashboard: "platform.dashboard.view",
  schools: "platform.schools.view",
  subscriptions: "platform.subscriptions.view",
  subscriptionsManage: "platform.subscriptions.manage",
  plans: "platform.plans.manage",
  billing: "platform.billing.view",
  approvePayments: "platform.billing.approve_payments",
  rfidInventory: "platform.rfid_inventory.manage",
} as const;

export type PlatformPermissionSlug = (typeof PLATFORM_PERMISSIONS)[keyof typeof PLATFORM_PERMISSIONS];
