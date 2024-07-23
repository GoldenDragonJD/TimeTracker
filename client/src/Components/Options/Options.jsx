import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faClock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import "./Options.css";

export default function Options() {
    const [options, setOptions] = useState(document.documentElement.style.getPropertyValue("--option") === "var(--option-on)");

    const navigate = useNavigate();

    return (
        <header className="Root-header">
            <h1 className="Root-title">Time Tracker</h1>
            <div className="info-bar">
                <FontAwesomeIcon icon={faClock} size="xl" className="info-bar-clock" />
                <h2 className="info-bar-date">{new Date().toLocaleDateString()}</h2>
                <div className="option-menu-container">
                    {window.innerWidth <= 768 ? (
                        <button
                            className="option-menu-button"
                            onClick={() => {
                                setOptions(!options);

                                if (options) {
                                    document.documentElement.style.setProperty("--option", "var(--option-off)");
                                } else {
                                    document.documentElement.style.setProperty("--option", "var(--option-on)");
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faBars} size="xl" />
                        </button>
                    ) : null}

                    {options ? (
                        <div className="hidden-buttons">
                            <button
                                onClick={() => {
                                    setOptions(false);
                                    if (options) {
                                        document.documentElement.style.setProperty("--option", "var(--option-off)");
                                    } else {
                                        document.documentElement.style.setProperty("--option", "var(--option-on)");
                                    }
                                }}
                                className="hidden-button-left"
                            ></button>
                            <button
                                onClick={() => {
                                    setOptions(false);
                                    if (options) {
                                        document.documentElement.style.setProperty("--option", "var(--option-off)");
                                    } else {
                                        document.documentElement.style.setProperty("--option", "var(--option-on)");
                                    }
                                }}
                                className="hidden-button-right"
                            ></button>
                        </div>
                    ) : null}

                    <div className="option-menu">
                        <h1>Options</h1>
                        <div className="separator-line"></div>
                        <Link to={"/"} className={`option-button ${window.location.pathname === "/" ? "isSelected" : ""}`}>
                            TABLE
                        </Link>
                        <Link to={"/calendar"} className={`option-button ${window.location.pathname === "/calendar" ? "isSelected" : ""}`}>
                            CALENDAR
                        </Link>
                        <Link to={"/settings"} className={`option-button ${window.location.pathname === "/settings" ? "isSelected" : ""}`}>
                            SETTINGS
                        </Link>
                        <button
                            className="option-button-bottom"
                            onClick={() => {
                                window.localStorage.setItem("username", "");
                                window.localStorage.setItem("password", "");
                                navigate("/login");
                            }}
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
