import axios from "axios";
import type { Order, OrderStatus } from "../types/order";

export const api = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const adaptPostToOrder = (post: unknown): Order => {
  const p = post as {
    id: number;
    title?: string;
    userId?: number;
  };

  const statuses: OrderStatus[] = [
    "pending",
    "processing",
    "completed",
    "cancelled",
  ];

  return {
    id: p.id,
    customerName: p.title?.slice(0, 30) || `Клиент ${p.id}`,
    status: statuses[(p.userId || 0) % 4] as OrderStatus,
    amount: p.id * 1000 + Math.floor(Math.random() * 5000),
    createdAt: new Date(Date.now() - p.id * 86400000).toISOString(),
  };
};

export default api;
