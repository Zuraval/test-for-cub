import type {
  Order,
  OrderStatus,
  OrderFilters,
  OrderFormData,
} from "../../../types/order";

// validation

export const isValidStatus = (status: string): status is OrderStatus => {
  const validStatuses: OrderStatus[] = [
    "pending",
    "processing",
    "completed",
    "cancelled",
  ];
  return validStatuses.includes(status as OrderStatus);
};

export interface OrderFormErrors {
  customerName?: string;
  amount?: string;
  status?: string;
}

export const validateOrderForm = (
  data: Partial<OrderFormData>,
): OrderFormErrors => {
  const errors: OrderFormErrors = {};

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.customerName = "Имя клиента должно содержать минимум 2 символа";
  }

  if (!data.amount || data.amount <= 0) {
    errors.amount = "Сумма заказа должна быть больше 0";
  }

  if (data.amount && data.amount > 10_000_000) {
    errors.amount = "Сумма заказа не может превышать 10 000 000 ₽";
  }

  if (data.status && !isValidStatus(data.status)) {
    errors.status = "Некорректный статус заказа";
  }

  return errors;
};

export const isOrderFormValid = (data: OrderFormData): boolean => {
  const errors = validateOrderForm(data);
  return Object.keys(errors).length === 0;
};

// filters and search

export const filterOrders = (
  orders: Order[],
  filters: OrderFilters,
): Order[] => {
  return orders.filter((order) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!order.customerName.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filters.status && filters.status !== "all") {
      if (order.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// sort

export type SortField = keyof Pick<
  Order,
  "createdAt" | "amount" | "customerName"
>;
export type SortOrder = "ascend" | "descend";

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export const sortOrders = (
  orders: Order[],
  { field, order }: SortConfig,
): Order[] => {
  const sorted = [...orders];

  sorted.sort((a, b) => {
    let aValue: string | number = a[field];
    let bValue: string | number = b[field];

    if (field === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (aValue < bValue) return order === "ascend" ? -1 : 1;
    if (aValue > bValue) return order === "ascend" ? 1 : -1;
    return 0;
  });

  return sorted;
};

// pagination

export interface PaginationConfig {
  current: number;
  pageSize: number;
}

export const paginateOrders = (
  orders: Order[],
  { current, pageSize }: PaginationConfig,
): Order[] => {
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  return orders.slice(start, end);
};

export const getTotalPages = (total: number, pageSize: number): number => {
  return Math.ceil(total / pageSize);
};

// stats

export interface OrderStats {
  total: number;
  totalAmount: number;
  byStatus: Record<OrderStatus, number>;
  averageAmount: number;
}

export const calculateOrderStats = (orders: Order[]): OrderStats => {
  const stats: OrderStats = {
    total: orders.length,
    totalAmount: 0,
    byStatus: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    },
    averageAmount: 0,
  };

  orders.forEach((order) => {
    stats.totalAmount += order.amount;
    stats.byStatus[order.status]++;
  });

  stats.averageAmount =
    orders.length > 0 ? Math.round(stats.totalAmount / orders.length) : 0;

  return stats;
};

// recreate info

export const adaptApiOrder = (apiData: any): Order => {
  return {
    id: apiData.id,
    customerName:
      apiData.customerName ||
      apiData.title?.slice(0, 30) ||
      "Неизвестный клиент",
    status: isValidStatus(apiData.status) ? apiData.status : "pending",
    amount: apiData.amount || apiData.id * 1000,
    createdAt: apiData.createdAt || new Date().toISOString(),
  };
};

export const prepareOrderForSubmit = (
  formData: OrderFormData,
): Partial<Order> => {
  return {
    customerName: formData.customerName.trim(),
    status: formData.status,
    amount: Math.round(formData.amount),
  };
};

// help

export const generateOrderId = (): number => {
  return Date.now() % 1_000_000;
};

export const canChangeStatus = (
  currentStatus: OrderStatus,
  _newStatus: OrderStatus,
): boolean => {
  if (["cancelled", "completed"].includes(currentStatus)) {
    return false;
  }

  return true;
};

export const canDeleteOrder = (_status: OrderStatus): boolean => {
  return true;
};

export const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: "Новый",
    processing: "В работе",
    completed: "Завершен",
    cancelled: "Отменен",
  };
  return labels[status];
};

export const getStatusEmoji = (status: OrderStatus): string => {
  const emojis: Record<OrderStatus, string> = {
    pending: "🟡",
    processing: "🔵",
    completed: "🟢",
    cancelled: "🔴",
  };
  return emojis[status];
};

export const isFreshOrder = (createdAt: string, hours = 24): boolean => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursInMs = hours * 60 * 60 * 1000;
  return now - created < hoursInMs;
};

// const

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

export const DEFAULT_PAGINATION: PaginationConfig = {
  current: 1,
  pageSize: 10,
};

export const DEFAULT_FILTERS: OrderFilters = {
  search: "",
  status: "all",
};

export const STATUS_SELECT_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: `${getStatusEmoji(status)} ${getStatusLabel(status)}`,
}));
