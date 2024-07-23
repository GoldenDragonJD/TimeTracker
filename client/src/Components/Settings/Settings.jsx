import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import axios from "axios";

import Options from "../Options/Options";
import Loading from "../Root/Loading";
import "./Settings.css";

export default function Settings() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { error, isLoading, data, refetch } = useQuery({
        queryKey: ["config"],
        queryFn: () =>
            axios
                .get(`${process.env.REACT_APP_API_URL}/settings`, {
                    auth: {
                        username: window.localStorage.getItem("username"),
                        password: window.localStorage.getItem("password"),
                    },
                })
                .then((data) => data.data),
    });

    const navigate = useNavigate();

    function toggleMailJet() {
        axios
            .put(
                `${process.env.REACT_APP_API_URL}/toggleMailJet`,
                {},
                { auth: { username: window.localStorage.getItem("username"), password: window.localStorage.getItem("password") } }
            )
            .then(() => {
                refetch();
            });
    }

    function updateSetting() {
        axios
            .put(
                `${process.env.REACT_APP_API_URL}/updateEmail`,
                { email, password },
                { auth: { username: window.localStorage.getItem("username"), password: window.localStorage.getItem("password") } }
            )
            .then(() => {
                navigate("/");
            });
    }

    if (error)
        return (
            <>
                {error.message}
                {error.message === "Request failed with status code 401" ? window.location.replace("/login") : refetch()}
            </>
        );

    return (
        <div className="Root">
            <Options />
            {isLoading ? (
                <Loading />
            ) : (
                <div className="settings-container">
                    <h1 className="AddStore-title">Settings</h1>
                    <div className="settings-inputs">
                        <div className="mail-jet">
                            <button
                                onClick={() => {
                                    toggleMailJet();
                                }}
                                type="button"
                                id="mailJet"
                                name="mailJet"
                                className={`${data.MailJet ? "mailJetOn" : ""}`}
                            />
                            <label htmlFor="mailJet">Activate MailJet Service</label>
                        </div>
                        <br />
                        <div className="update-email">
                            <label htmlFor="Email">Update Email Address:</label>
                            <input type="text" id="Email" name="Email" autoComplete="off" onChange={(e) => setEmail(e.target.value)} />
                            <br />
                            <label htmlFor="Password">Update Password:</label>
                            <input onChange={(e) => setPassword(e.target.value)} type="text" id="Password" name="Password" />
                        </div>
                        <br />
                        <button onClick={() => updateSetting()} className="Submit-button">
                            Update
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
