import { Modal, Descriptions, Tag } from "antd";
import {
  getStatusLabel,
  getStatusEmoji,
  isFreshOrder,
} from "../../features/orders/utils/orderHelpers";
import { formatDate, formatCurrency } from "../../utils/format";
import type { Order } from "../../types/order";

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<Props> = ({ order, open, onClose }) => {
  if (!order) return null;

  const statusColors: Record<Order["status"], string> = {
    pending: "warning",
    processing: "processing",
    completed: "success",
    cancelled: "error",
  };

  const isFresh = isFreshOrder(order.createdAt);

  return (
    <Modal
      title={`Заказ #${order.id} ${isFresh ? "🆕" : ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="ID заказа">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Клиент">
          <strong>{order.customerName}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Сумма">
          <strong>{formatCurrency(order.amount)}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Статус">
          <Tag color={statusColors[order.status]} style={{ fontSize: 14 }}>
            {getStatusEmoji(order.status)} {getStatusLabel(order.status)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Дата создания">
          {formatDate(order.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Свежий заказ">
          {isFresh ? "✅ Да (менее 24 часов)" : "❌ Нет"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default OrderDetailModal;
