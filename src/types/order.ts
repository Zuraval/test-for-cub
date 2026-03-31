export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Order {
  id: number;
  customerName: string;
  status: OrderStatus;
  amount: number;
  createdAt: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | "all";
}

export interface OrderFormData {
  customerName: string;
  status: OrderStatus;
  amount: number;
}

export interface ApiOrderResponse {
  data: Order[];
  total: number;
}
