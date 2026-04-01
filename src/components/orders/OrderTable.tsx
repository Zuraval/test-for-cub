import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { OrderActions } from "./OrderActions";
import {
  getStatusLabel,
  getStatusEmoji,
  canChangeStatus,
} from "../../features/orders/utils/orderHelpers";
import { formatDate, formatCurrency } from "../../utils/format";
import type { Order, OrderStatus } from "../../types/order";

interface Props {
  orders: Order[];
  loading: boolean;
  pagination: { current: number; pageSize: number; total?: number };
  onChange: (pagination: any, filters: any, sorter: any) => void;
  onEditStatus: (id: number, status: OrderStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export const OrderTable: React.FC<Props> = ({
  orders,
  loading,
  pagination,
  onChange,
  onEditStatus,
  onDelete,
  onView,
  onEdit,
}) => {
  const statusColors: Record<OrderStatus, string> = {
    pending: "warning",
    processing: "processing",
    completed: "success",
    cancelled: "error",
  };

  const columns: ColumnsType<Order> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      responsive: ["lg"],
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Клиент",
      dataIndex: "customerName",
      key: "customerName",
      minWidth: 200,
      ellipsis: true,
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>
          {getStatusEmoji(status)} {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Дата создания",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => formatDate(date),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      responsive: ["md"],
    },
    {
      title: "Действия",
      key: "actions",
      width: 300,
      render: (_, record) => (
        <OrderActions
          orderId={record.id}
          currentStatus={record.status}
          onStatusChange={onEditStatus}
          onDelete={onDelete}
          onView={onView}
          onEdit={onEdit}
          disabled={loading}
          allowedActions={
            canChangeStatus(record.status, "processing")
              ? ["edit", "delete", "view", "status"]
              : ["delete", "view", "status"]
          }
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `Всего: ${total}`,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      onChange={onChange}
      scroll={{ x: 1100 }}
      locale={{
        emptyText: "Заказы не найдены",
      }}
      size="middle"
    />
  );
};

export default OrderTable;
