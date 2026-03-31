import { Component, type ErrorInfo, type ReactNode } from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔥 Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const navigate = useNavigate();

  return (
    <Result
      status="error"
      title="Что-то пошло не так"
      subTitle={error?.message || "Произошла непредвиденная ошибка"}
      extra={[
        <Button
          type="primary"
          key="reload"
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </Button>,
        <Button key="home" onClick={() => navigate("/dashboard")}>
          На главную
        </Button>,
      ]}
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
};
