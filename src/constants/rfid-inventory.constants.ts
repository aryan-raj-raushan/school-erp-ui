import type { BadgeVariant } from '@/components/ui/badge';
import type { RfidDeviceStatus } from '@/types';

export const RFID_DEVICE_STATUS_BADGE: Record<RfidDeviceStatus, BadgeVariant> = {
  IN_STOCK: 'default',
  ASSIGNED: 'warning',
  INSTALLED: 'success',
  MAINTENANCE: 'warning',
  RETURNED: 'default',
  RETIRED: 'danger',
};

export const RFID_DEVICE_STATUS_OPTIONS = [
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'INSTALLED', label: 'Installed' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'RETIRED', label: 'Retired' },
] as const;

export const RFID_INVENTORY_PAGE = {
  title: 'RFID Inventory',
  description: 'Track RFID devices — stock, assignment and installation',
  addButton: 'Add Device',
  empty: 'No devices yet',
  table: {
    identifier: 'Device ID',
    model: 'Model',
    purchaseDate: 'Purchase Date',
    status: 'Status',
    school: 'Assigned School',
    installDate: 'Installation Date',
    warranty: 'Warranty Expiry',
    lastSeen: 'Last Tap',
  },
  discovered: {
    title: 'Discovered Devices',
    subtitle: 'Readers that sent taps in the last 30 days but are not mapped to a school. Their unknown card taps are hidden from every school until mapped.',
    empty: 'No unmapped devices have sent taps',
    refresh: 'Refresh',
    table: {
      identifier: 'Device ID',
      lastSeen: 'Last Tap',
      taps: 'Taps',
      lastCard: 'Last Card',
      inventory: 'Inventory',
    },
    notInInventory: 'New',
    map: 'Map to School',
  },
  actions: {
    assign: 'Assign',
    install: 'Mark Installed',
    return: 'Return to Stock',
  },
} as const;

export const CREATE_DEVICE_FORM = {
  title: 'Add Device',
  labels: {
    device_identifier: 'Device Identifier',
    device_model: 'Device Model',
    purchase_date: 'Purchase Date',
    warranty_expiry: 'Warranty Expiry',
    notes: 'Notes',
  },
  placeholders: {
    device_identifier: 'RFID-A1B2C3',
    device_model: 'ZKTeco K40',
  },
  submit: { idle: 'Add', loading: 'Adding…' },
  cancel: 'Cancel',
} as const;

export const ASSIGN_DEVICE_FORM = {
  title: 'Map Device to School',
  labels: {
    school: 'School',
    billable: 'Bill this assignment',
    charge_type: 'Charge Type',
    charge_amount: 'Charge Amount (₹)',
  },
  submit: 'Assign',
  cancel: 'Cancel',
} as const;
