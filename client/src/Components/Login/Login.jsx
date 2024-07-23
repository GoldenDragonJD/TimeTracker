import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    return (
        <div className="Root">
            <h1 className="AddStore-title">Login</h1>
            <div className="AddStore-form">
                <label htmlFor="username">Username:</label>
                <input onChange={(e) => setUsername(e.target.value)} type="text" id="username" name="username" />
                <label htmlFor="password">Password:</label>
                <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" name="password" />
                <br />
                <button
                    className="Submit-button"
                    type="button"
                    onClick={() => {
                        window.localStorage.setItem("username", username);
                        window.localStorage.setItem("password", password);
                        navigate("/");
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
