import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { AuthBootstrap } from "@/app/AuthBootstrap";
import { AppRoutes } from "@/routes/AppRoutes";
import "./styles.css";

import { ConfirmProvider } from "@/presentation/global/contexts/ConfirmContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <AuthBootstrap>
      <ConfirmProvider>
        <AppRoutes />
      </ConfirmProvider>
    </AuthBootstrap>
  </Provider>,
);
