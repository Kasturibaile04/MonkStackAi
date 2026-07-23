import { RouterProvider } from "react-router";
import appRouter from "./app.routes.jsx";
import { AuthProvider } from "./Features/auth/auth.context.jsx";

function App() {
  
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  )
}

export default App
