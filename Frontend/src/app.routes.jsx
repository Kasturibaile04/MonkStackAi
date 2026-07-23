import {createBrowserRouter} from "react-router";
import Login from "./Features/auth/pages/Login";
import Register from "./Features/auth/pages/Register";
import Protected from "./Features/auth/components/Protected";
// import Home from "./Features/auth/pages/Home";


const appRouter = createBrowserRouter([

    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },{
        path: "/home",
        element: <Protected><h1>Home</h1></Protected>
    }
]);

export default appRouter;