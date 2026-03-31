import { Select } from "antd";
import { STATUS_SELECT_OPTIONS } from "../../features/orders/utils/orderHelpers";
import type { OrderStatus } from "../../types/order";

interface Props {
  value?: OrderStatus | "all";
  onChange?: (value: OrderStatus | "all") => void;
  disabled?: boolean;
  className?: string;
  showAllOption?: boolean;
}

export const OrderFilters: React.FC<Props> = ({
  value = "all",
  onChange,
  disabled = false,
  className,
  showAllOption = true,
}) => {
  const options = [
    ...(showAllOption ? [{ value: "all", label: "📋 Все статусы" }] : []),
    ...STATUS_SELECT_OPTIONS,
  ];

  return (
    <Select
      className={className}
      style={{ minWidth: 180 }}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      allowClear={false}
      placeholder="Фильтр по статусу"
      data-testid="order-status-filter"
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

export default OrderFilters;
