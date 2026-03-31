import { useState, useMemo } from "react";
import { Card, Button, Input, Space, Row, Col, Statistic, Divider } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { OrderTable } from "../../components/orders/OrderTable";
import { OrderForm } from "../../components/orders/OrderForm";
import { OrderFilters } from "../../components/orders/OrderFilters";
import { OrderDetailModal } from "../../components/orders/OrderDetailModal";
import { useOrders } from "../../features/orders/hooks/useOrders";
import { useOrderStore } from "../../features/orders/store/orderStore";
import {
  getStatusLabel,
  getStatusEmoji,
} from "../../features/orders/utils/orderHelpers";
import type { OrderFormData, OrderStatus } from "../../types/order";
import type { Order } from "../../types/order";

export interface DashboardProps {
  initialStatus?: "all" | OrderStatus;
  title?: string;
  hideCreateButton?: boolean;
  hideStats?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  title = "📦 Управление заказами",
  hideCreateButton = false,
  hideStats = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    orders,
    loading,
    pagination,
    filters,
    stats,
    handleTableChange,
    handleSearch,
    handleStatusFilter,
    deleteOrder,
    updateOrderStatus,
  } = useOrders();

  const { createOrder, updateOrder } = useOrderStore();

  const resetModalState = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setIsEditMode(false);
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedOrder(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setIsEditMode(true);
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleSubmit = async (data: OrderFormData) => {
    if (isEditMode && selectedOrder) {
      try {
        await updateOrder(selectedOrder.id, data);
        resetModalState();
      } catch (error) {
        console.error("Ошибка при обновлении:", error);
      }
    } else {
      try {
        await createOrder(data);
        resetModalState();
      } catch (error) {
        console.error("Ошибка при создании:", error);
      }
    }
  };

  const handleView = (id: number) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setSelectedOrder(order);
      setViewModalOpen(true);
    }
  };

  const handleEdit = (id: number) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      handleOpenEdit(order);
    }
  };

  const statCards = useMemo(
    () => [
      {
        title: "Всего заказов",
        value: stats.total,
        prefix: "📦",
        color: "#1890ff",
      },
      {
        title: "Общая сумма",
        value: stats.totalAmount.toLocaleString("ru-RU"),
        prefix: "₽",
        color: "#52c41a",
      },
      {
        title: "Средний чек",
        value: stats.averageAmount.toLocaleString("ru-RU"),
        prefix: "₽",
        color: "#faad14",
      },
      ...Object.entries(stats.byStatus).map(([status, count]) => ({
        title: getStatusLabel(status as OrderStatus),
        value: count,
        prefix: getStatusEmoji(status as OrderStatus),
        color:
          status === "pending"
            ? "#faad14"
            : status === "processing"
              ? "#1890ff"
              : status === "completed"
                ? "#52c41a"
                : "#ff4d4f",
      })),
    ],
    [stats],
  );

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <Card
        title={title}
        extra={
          !hideCreateButton && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
            >
              Новый заказ
            </Button>
          )
        }
      >
        {!hideStats && (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {statCards.map((stat, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={stat.prefix}
                      styles={{ content: { color: "#1890ff" } }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <Divider />
          </>
        )}

        <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
          <Input
            placeholder="Поиск по клиенту..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <OrderFilters value={filters.status} onChange={handleStatusFilter} />
        </Space>

        <OrderTable
          orders={orders}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onEditStatus={updateOrderStatus}
          onDelete={deleteOrder}
          onView={handleView}
          onEdit={handleEdit}
        />
      </Card>

      <OrderForm
        open={modalOpen}
        onClose={resetModalState}
        onSubmit={handleSubmit}
        initialData={
          isEditMode && selectedOrder
            ? {
                customerName: selectedOrder.customerName,
                status: selectedOrder.status,
                amount: selectedOrder.amount,
              }
            : undefined
        }
        isEditMode={isEditMode}
      />

      <OrderDetailModal
        order={selectedOrder}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          if (!isEditMode) {
            setSelectedOrder(null);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
