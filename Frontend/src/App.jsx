import { RouterProvider } from "react-router";
import appRouter from "./app.routes.jsx";
import { AuthProvider } from "./Features/auth/auth.context.jsx";
import { ResumeProvider } from "./Features/Resume/Resume.context.jsx";

function App() {
  
  return (
    <AuthProvider>
      <ResumeProvider>
      <RouterProvider router={appRouter} />
      </ResumeProvider>
    </AuthProvider>
  )
}

export default App
