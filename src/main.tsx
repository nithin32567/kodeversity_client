import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { AuthBootstrap } from "@/app/AuthBootstrap";
import { AppRoutes } from "@/routes/AppRoutes";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </Provider>
  </StrictMode>,
);
