import { useMemo, useState, useCallback } from "react";
import { useOrderStore } from "../store/orderStore";
import {
  filterOrders,
  sortOrders,
  paginateOrders,
  calculateOrderStats,
  type SortConfig,
} from "../utils/orderHelpers";
import type { Order, OrderStatus } from "../../../types/order";

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total: number };
  filters: { search?: string; status?: OrderStatus | "all" };
  stats: ReturnType<typeof calculateOrderStats>;
  handleTableChange: (pagination: any, filters: any, sorter: any) => void;
  handleSearch: (value: string) => void;
  handleStatusFilter: (value: OrderStatus | "all") => void;
  deleteOrder: (id: number) => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  refresh: () => Promise<void>;
  sortConfig: SortConfig | null;
}

export const useOrders = (): UseOrdersReturn => {
  const {
    orders: allOrders,
    loading,
    filters,
    fetchOrders,
    setFilters,
    deleteOrder,
    updateOrderStatus,
  } = useOrderStore();

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const filteredOrders = useMemo(() => {
    return filterOrders(allOrders, filters);
  }, [allOrders, filters]);

  const sortedOrders = useMemo(() => {
    if (!sortConfig) return filteredOrders;
    return sortOrders(filteredOrders, sortConfig);
  }, [filteredOrders, sortConfig]);

  const paginatedOrders = useMemo(() => {
    return paginateOrders(sortedOrders, pagination);
  }, [sortedOrders, pagination]);

  const stats = useMemo(() => {
    return calculateOrderStats(allOrders);
  }, [allOrders]);

  const handleTableChange = useCallback(
    (
      newPagination: { current?: number; pageSize?: number },
      _tableFilters: any,
      sorter: any,
    ) => {
      setPagination((prev) => ({
        ...prev,
        ...newPagination,
      }));

      if (sorter.field && sorter.order) {
        setSortConfig({
          field: sorter.field as SortConfig["field"],
          order: sorter.order as SortConfig["order"],
        });
      } else {
        setSortConfig(null);
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setFilters({ search: value });
      setPagination((prev) => ({ ...prev, current: 1 }));
    },
    [setFilters],
  );

  const handleStatusFilter = useCallback(
    (value: OrderStatus | "all") => {
      setFilters({ status: value });
      setPagination((prev) => ({ ...prev, current: 1 }));
    },
    [setFilters],
  );

  const refresh = useCallback(async () => {
    await fetchOrders(pagination.current, pagination.pageSize);
  }, [fetchOrders, pagination.current, pagination.pageSize]);

  return {
    orders: paginatedOrders,
    loading,
    pagination: { ...pagination, total: filteredOrders.length },
    filters,
    stats,
    handleTableChange,
    handleSearch,
    handleStatusFilter,
    deleteOrder,
    updateOrderStatus,
    refresh,
    sortConfig,
  };
};

export default useOrders;
