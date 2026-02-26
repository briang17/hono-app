import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes/index";
import { AuthProvider } from "./providers/AuthProvider";
import { OrgProvider } from "./providers/OrgProvider";
import { QueryClientProvider } from "./providers/QueryClientProvider";
import "./index.css";

function App() {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <OrgProvider>
          <RouterProvider router={router} />
        </OrgProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
