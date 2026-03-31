import { useState } from "react";
import {
  Button,
  Select,
  Popconfirm,
  Space,
  Dropdown,
  type MenuProps,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  canChangeStatus,
  canDeleteOrder,
  getStatusLabel,
  getStatusEmoji,
  ORDER_STATUSES,
} from "../../features/orders/utils/orderHelpers";
import type { OrderStatus } from "../../types/order";

export interface OrderActionsProps {
  orderId: number;
  currentStatus: OrderStatus;
  onStatusChange: (id: number, status: OrderStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  disabled?: boolean;
  compact?: boolean;
  allowedActions?: Array<"edit" | "delete" | "view" | "status">;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  orderId,
  currentStatus,
  onStatusChange,
  onDelete,
  onView,
  onEdit,
  disabled = false,
  compact = false,
  allowedActions = ["edit", "delete", "view", "status"],
}) => {
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusOptions = ORDER_STATUSES.map((status) => ({
    value: status,
    label: `${getStatusEmoji(status)} ${getStatusLabel(status)}`,
    disabled:
      !canChangeStatus(currentStatus, status) || currentStatus === status,
  }));

  const handleStatusChange = async (value: OrderStatus) => {
    if (value === currentStatus) return;

    if (!canChangeStatus(currentStatus, value)) {
      message.warning("Нельзя изменить статус на этот");
      return;
    }

    setStatusLoading(true);
    try {
      await onStatusChange(orderId, value);
    } catch (error) {
      message.error("Не удалось изменить статус");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete(orderId);
    } catch (error) {
      message.error("Не удалось удалить заказ");
    } finally {
      setDeleteLoading(false);
    }
  };

  const isActionAllowed = (action: "edit" | "delete" | "view" | "status") =>
    allowedActions.includes(action);

  const canDelete = canDeleteOrder(currentStatus);

  if (compact) {
    const menuItems: MenuProps["items"] = [
      ...(isActionAllowed("status")
        ? [
            {
              key: "status",
              label: (
                <Select
                  size="small"
                  value={currentStatus}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  disabled={disabled || statusLoading}
                  style={{ width: 120 }}
                  onClick={(e) => e.stopPropagation()}
                />
              ),
              disabled: true,
            },
          ]
        : []),
      ...(isActionAllowed("view") && onView
        ? [
            {
              key: "view",
              icon: <EyeOutlined />,
              label: "Просмотр",
              onClick: () => onView(orderId),
            },
          ]
        : []),
      ...(isActionAllowed("edit") &&
      onEdit &&
      canChangeStatus(currentStatus, "processing")
        ? [
            {
              key: "edit",
              icon: <EditOutlined />,
              label: "Редактировать",
              onClick: () => onEdit(orderId),
            },
          ]
        : []),
      ...(isActionAllowed("delete") && canDelete
        ? [
            {
              key: "delete",
              icon: <DeleteOutlined />,
              label: (
                <Popconfirm
                  title="Удалить заказ?"
                  onConfirm={handleDelete}
                  okText="Да"
                  cancelText="Нет"
                  disabled={disabled || deleteLoading}
                >
                  <span style={{ color: "#ff4d4f" }}>Удалить</span>
                </Popconfirm>
              ),
              danger: true,
            },
          ]
        : []),
    ];

    return (
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        disabled={disabled}
      >
        <Button
          type="text"
          icon={<MoreOutlined />}
          size="small"
          disabled={disabled}
          data-testid="order-actions-menu"
        />
      </Dropdown>
    );
  }

  return (
    <Space size="small" wrap>
      {isActionAllowed("status") && (
        <Select
          size="small"
          value={currentStatus}
          onChange={handleStatusChange}
          options={statusOptions}
          disabled={disabled || statusLoading}
          style={{ width: 130 }}
          data-testid="order-status-select"
        />
      )}

      {isActionAllowed("view") && onView && (
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onView(orderId)}
          disabled={disabled}
          title="Просмотреть детали"
          data-testid="order-view-btn"
        />
      )}

      {isActionAllowed("edit") &&
        onEdit &&
        canChangeStatus(currentStatus, "processing") && (
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(orderId)}
            disabled={disabled}
            title="Редактировать заказ"
            data-testid="order-edit-btn"
          />
        )}

      {isActionAllowed("delete") && canDelete && (
        <Popconfirm
          title="Удалить заказ?"
          description="Это действие нельзя отменить"
          onConfirm={handleDelete}
          okText="Да, удалить"
          cancelText="Отмена"
          okButtonProps={{
            danger: true,
            loading: deleteLoading,
            icon: <CloseOutlined />,
          }}
          cancelButtonProps={{ disabled: disabled || deleteLoading }}
          disabled={disabled || deleteLoading}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            disabled={disabled || deleteLoading}
            title="Удалить заказ"
            data-testid="order-delete-btn"
            loading={deleteLoading}
          />
        </Popconfirm>
      )}
    </Space>
  );
};

export default OrderActions;
