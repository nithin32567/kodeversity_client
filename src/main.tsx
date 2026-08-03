import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { AuthBootstrap } from "@/app/AuthBootstrap";
import { AppRoutes } from "@/routes/AppRoutes";
import "./styles.css";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  person_profiles: 'identified_only',
  capture_pageview: true,
})

import { ConfirmProvider } from "@/presentation/global/contexts/ConfirmContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PostHogProvider client={posthog}>
      <AuthBootstrap>
        <ConfirmProvider>
          <AppRoutes />
        </ConfirmProvider>
      </AuthBootstrap>
    </PostHogProvider>
  </Provider>,
);
