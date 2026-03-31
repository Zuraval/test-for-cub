import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import {
  validateOrderForm,
  isOrderFormValid,
  ORDER_STATUSES,
  getStatusLabel,
  getStatusEmoji,
} from "../../features/orders/utils/orderHelpers";
import type { OrderFormData } from "../../types/order";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10_000_000;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OrderFormData) => Promise<void>;
  initialData?: Partial<OrderFormData>;
  isEditMode?: boolean;
}

export const OrderForm: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
}) => {
  const [form] = Form.useForm<OrderFormData>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (initialData) {
        setTimeout(() => {
          form.setFieldsValue({
            customerName: initialData.customerName || "",
            status: initialData.status || "pending",
            amount: initialData.amount || undefined,
          });
        }, 10);
      }
    }
  }, [open, initialData, form, isEditMode]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const errors = validateOrderForm(values);

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          form.setFields([
            {
              name: field as keyof OrderFormData,
              errors: [error],
            },
          ]);
        });
        message.error("Исправьте ошибки в форме");
        return;
      }

      if (!isOrderFormValid(values)) {
        message.error("Форма содержит ошибки");
        return;
      }

      setSubmitting(true);
      await onSubmit(values);
    } catch (err: any) {
      if (err?.errorFields) {
        message.error("Заполните все обязательные поля");
      } else {
        message.error("Произошла ошибка при отправке");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditMode ? "✏️ Редактирование заказа" : "➕ Новый заказ"}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditMode ? "Сохранить" : "Создать"}
      cancelText="Отмена"
      confirmLoading={submitting}
      width={500}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "pending",
          amount: undefined,
          customerName: "",
        }}
      >
        <Form.Item
          name="customerName"
          label="Имя клиента"
          rules={[
            { required: true, message: "Введите имя клиента" },
            { min: 2, message: "Минимум 2 символа" },
          ]}
        >
          <Input placeholder="Иван Иванов" maxLength={100} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Сумма заказа"
          rules={[
            { required: true, message: "Введите сумму" },
            {
              type: "number",
              min: MIN_AMOUNT,
              message: "Сумма должна быть больше 0",
            },
            {
              validator: (_, value) => {
                if (value && value > MAX_AMOUNT) {
                  return Promise.reject(
                    "Сумма не может превышать 10 000 000 ₽",
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber<number>
            style={{ width: "100%" }}
            prefix="₽ "
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            placeholder="15000"
            controls={true}
            stringMode={false}
            formatter={(value) => {
              if (!value) return "";
              return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }}
            parser={(value) => {
              if (!value) return 0;
              const parsed = Number(
                value.replace(/₽\s?|(,*)/g, "").replace(/\s/g, ""),
              );
              return isNaN(parsed) ? 0 : parsed;
            }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Статус"
          rules={[{ required: true, message: "Выберите статус" }]}
        >
          <Select>
            {ORDER_STATUSES.map((status) => (
              <Select.Option key={status} value={status}>
                {getStatusEmoji(status)} {getStatusLabel(status)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderForm;
