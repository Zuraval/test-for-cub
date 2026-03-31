import { api, adaptPostToOrder } from "./axios";
import type {
  Order,
  OrderFormData,
  OrderStatus,
  ApiOrderResponse,
} from "../types/order";

let createdOrders: Order[] = [];

let nextOrderId = 1001;

const generateNextId = (): number => {
  return nextOrderId++;
};

const getUniqueOrderId = (): number => {
  let id = generateNextId();
  while (createdOrders.some((o) => o.id === id)) {
    id = generateNextId();
  }
  return id;
};

export const ordersApi = {
  getAll: async (page = 1, limit = 10): Promise<ApiOrderResponse> => {
    const response = await api.get("/posts", {
      params: { _page: page, _limit: limit },
    });

    const apiOrders = response.data.map(adaptPostToOrder);
    const allData = [...createdOrders, ...apiOrders];

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: allData.slice(start, end),
      total: allData.length,
    };
  },

  getById: async (id: number): Promise<Order> => {
    const createdOrder = createdOrders.find((o) => o.id === id);
    if (createdOrder) {
      return createdOrder;
    }

    const response = await api.get(`/posts/${id}`);
    return adaptPostToOrder(response.data);
  },

  create: async (data: OrderFormData): Promise<Order> => {
    const newOrder: Order = {
      id: getUniqueOrderId(),
      customerName: data.customerName.trim(),
      status: data.status,
      amount: Math.round(data.amount),
      createdAt: new Date().toISOString(),
    };

    createdOrders.unshift(newOrder);

    return newOrder;
  },

  update: async (id: number, data: OrderFormData): Promise<Order> => {
    const index = createdOrders.findIndex((o) => o.id === id);
    if (index !== -1) {
      createdOrders[index] = {
        ...createdOrders[index],
        customerName: data.customerName.trim(),
        status: data.status,
        amount: Math.round(data.amount),
      };
      return createdOrders[index];
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          customerName: data.customerName,
          status: data.status,
          amount: data.amount,
          createdAt: new Date().toISOString(),
        } as Order);
      }, 200);
    });
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const index = createdOrders.findIndex((o) => o.id === id);
    if (index !== -1) {
      createdOrders[index] = { ...createdOrders[index], status };
      return createdOrders[index];
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          customerName: "",
          status,
          amount: 0,
          createdAt: "",
        } as Order);
      }, 200);
    });
  },

  delete: async (id: number): Promise<void> => {
    const index = createdOrders.findIndex((o) => o.id === id);
    if (index !== -1) {
      createdOrders = createdOrders.filter((o) => o.id !== id);
      return;
    }

    return new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  },

  clearCreatedOrders: () => {
    createdOrders = [];
    nextOrderId = 1001;
  },

  getCreatedOrders: (): Order[] => createdOrders,
};

export default ordersApi;
