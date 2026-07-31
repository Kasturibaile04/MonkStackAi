import { createBrowserRouter } from "react-router";
import Login from "./Features/auth/pages/Login";
import Register from "./Features/auth/pages/Register";
import Protected from "./Features/auth/components/Protected";
import Home from "./Features/Resume/pages/Home";
import Landing from "./Features/Resume/pages/Landingpage";
import Resume from "./Features/Resume/pages/Resume";
import Upgrade from "./Features/Resume/pages/Upgrade";




const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <Landing />
    },

    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }, {
        path: "/home",
        element: <Home />
    }, {
        path: "/resume/:resumeId",
        element: <Resume />
        //can put protected here later. to make sure only logged in users can access this
    }, {
        path: "/Upgrade/:resumeId",
        element: <Upgrade />
    }
]);

export default appRouter;