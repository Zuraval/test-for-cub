import { ConfigProvider, theme, App as AntdApp, Layout } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useThemeMode } from "./hooks/useThemeMode";

const { Content } = Layout;

function App() {
  const { isDark } = useThemeMode();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              colorPrimary: "#1890ff",
              colorSuccess: "#52c41a",
              colorWarning: "#faad14",
              colorError: "#ff4d4f",
              borderRadius: 6,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
            },
            components: {
              Table: {
                headerBg: isDark ? "#1a1a1a" : "#fafafa",
                headerColor: isDark ? "#e6e6e6" : "#262626",
              },
              Modal: {
                borderRadiusLG: 8,
              },
            },
          }}
          locale={{
            locale: "ru_RU",
            Pagination: {
              items_per_page: "на странице",
              jump_to: "Перейти",
              page: "Страница",
            },
          }}
        >
          <AntdApp>
            <Layout className="app-layout" style={{ minHeight: "100vh" }}>
              <Content className="app-content" style={{ padding: "24px" }}>
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route
                    path="*"
                    element={
                      <Layout
                        style={{
                          minHeight: "60vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <h1>404</h1>
                          <p>Страница не найдена</p>
                          <a href="/dashboard">← Вернуться к заказам</a>
                        </div>
                      </Layout>
                    }
                  />
                </Routes>
              </Content>
            </Layout>
          </AntdApp>
        </ConfigProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
