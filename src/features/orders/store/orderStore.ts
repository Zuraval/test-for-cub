import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import { ordersApi } from "../../../api/orders";
import {
  validateOrderForm,
  isOrderFormValid,
  canChangeStatus,
  DEFAULT_PAGINATION,
  DEFAULT_FILTERS,
} from "../utils/orderHelpers";
import type {
  Order,
  OrderFilters,
  OrderFormData,
  OrderStatus,
  ApiOrderResponse,
} from "../../../types/order";

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  total: number;
  filters: OrderFilters;
  pagination: { current: number; pageSize: number };

  fetchOrders: (page: number, limit: number) => Promise<void>;
  createOrder: (data: OrderFormData) => Promise<void>;
  updateOrder: (id: number, data: OrderFormData) => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  setFilters: (filters: Partial<OrderFilters>) => void;
  resetFilters: () => void;
  resetState: () => void;
}

export const useOrderStore = create<OrderState>()(
  devtools(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,
      total: 0,
      filters: DEFAULT_FILTERS,
      pagination: DEFAULT_PAGINATION,

      fetchOrders: async (page, limit) => {
        set({ loading: true, error: null });
        try {
          const response: ApiOrderResponse = await ordersApi.getAll(
            page,
            limit,
          );

          const { search, status } = get().filters;
          let filtered = response.data;

          if (search) {
            filtered = filtered.filter((order) =>
              order.customerName.toLowerCase().includes(search.toLowerCase()),
            );
          }
          if (status && status !== "all") {
            filtered = filtered.filter((order) => order.status === status);
          }

          set({
            orders: filtered,
            total: response.total,
            loading: false,
            pagination: { current: page, pageSize: limit },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Не удалось загрузить заказы";
          set({ error: errorMessage, loading: false });
          message.error(errorMessage);
        }
      },

      createOrder: async (data: OrderFormData) => {
        const errors = validateOrderForm(data);
        if (Object.keys(errors).length > 0) {
          message.error("Проверьте правильность заполнения полей");
          return;
        }

        if (!isOrderFormValid(data)) {
          message.error("Форма содержит ошибки");
          return;
        }

        try {
          const newOrder = await ordersApi.create(data);
          set((state) => ({
            orders: [newOrder, ...state.orders],
            total: state.total + 1,
          }));
          message.success("Заказ успешно создан");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Ошибка при создании заказа";
          message.error(errorMessage);
        }
      },

      updateOrder: async (id: number, data: OrderFormData) => {
        const errors = validateOrderForm(data);
        if (Object.keys(errors).length > 0) {
          message.error("Проверьте правильность заполнения полей");
          return;
        }

        try {
          const updatedOrder = await ordersApi.update(id, data);
          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
          }));
          message.success("Заказ успешно обновлен");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Ошибка при обновлении заказа";
          message.error(errorMessage);
        }
      },

      updateOrderStatus: async (id: number, status: OrderStatus) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) {
          message.error("Заказ не найден");
          return;
        }

        if (!canChangeStatus(order.status, status)) {
          message.error("Нельзя изменить статус этого заказа");
          return;
        }

        try {
          await ordersApi.updateStatus(id, status);
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, status } : o,
            ),
          }));
          message.success("Статус заказа обновлен");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Ошибка при обновлении статуса";
          message.error(errorMessage);
        }
      },

      deleteOrder: async (id: number) => {
        try {
          await ordersApi.delete(id);
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
            total: state.total - 1,
          }));
          message.success("Заказ удален");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Ошибка при удалении заказа";
          message.error(errorMessage);
        }
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },

      resetState: () => {
        set({
          orders: [],
          loading: false,
          error: null,
          total: 0,
          filters: DEFAULT_FILTERS,
          pagination: DEFAULT_PAGINATION,
        });
      },
    }),
    { name: "OrderStore" },
  ),
);

export default useOrderStore;
