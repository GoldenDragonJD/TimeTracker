import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import Root from "./Components/Root/Root";
import AddStore from "./Components/AddStore/AddStore";
import Login from "./Components/Login/Login";
import Edit from "./Components/Edit/Edit";
import Settings from "./Components/Settings/Settings";
import Calendar from "./Components/Calendar/Calendar";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/addStore",
        element: <AddStore />,
    },
    {
        path: "/edit/:storeName/:storeLocation",
        element: <Edit />,
    },
    {
        path: "/edit/:storeName",
        element: <Edit />,
    },
    {
        path: "/calendar",
        element: <Calendar />,
    },
    {
        path: "/settings",
        element: <Settings />,
    },
]);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
);
