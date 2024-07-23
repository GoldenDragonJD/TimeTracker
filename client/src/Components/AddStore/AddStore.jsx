import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

import "./AddStore.css";

import axios from "axios";

export default function AddStore() {
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState("");
    const [storeLocation, setStoreLocation] = useState("");
    const [lastVisit, setLastVisit] = useState("");
    const [nextVisit, setNextVisit] = useState("");
    const [nextVisitDefault, setNextVisitDefault] = useState("");

    function submitForm() {
        axios
            .post(
                `${process.env.REACT_APP_API_URL}/addInfo`,
                {
                    storeName: storeName,
                    storeLocation: storeLocation,
                    lastVisit: lastVisit,
                    nextVisit: nextVisit,
                },
                {
                    auth: {
                        username: window.localStorage.getItem("username"),
                        password: window.localStorage.getItem("password"),
                    },
                }
            )
            .then(() => {
                navigate("/");
            })
            .catch((e) => {
                console.log(e);
            });
    }

    return (
        <div className="Root">
            <Link to="/">
                <FontAwesomeIcon icon={faChevronLeft} className="Back" />
            </Link>

            <h1 className="AddStore-title">Add Store</h1>
            <form
                action=""
                className="AddStore-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    submitForm();
                }}
            >
                <label htmlFor="AddStore-name">Store name:</label>
                <input placeholder="Ex: McDonald" id="AddStore-name" name="AddStore-name" type="text" onChange={(e) => setStoreName(e.target.value)} />
                <label htmlFor="AddStore-location">Store location: (Optional)</label>
                <input
                    placeholder="Ex: Naples FL"
                    id="AddStore-location"
                    name="AddStore-location"
                    type="text"
                    onChange={(e) => setStoreLocation(e.target.value)}
                />
                <br />
                <label htmlFor="AddStore-lastVisit">Last Visit</label>
                <input
                    type="date"
                    name="AddStore-lastVisit"
                    id="AddStore-lastVisit"
                    onChange={(e) => {
                        const dates = e.target.value.split("-");
                        const date = `${dates[1]}/${dates[2]}/${dates[0]}`;
                        setLastVisit(date);
                    }}
                />

                <label htmlFor="AddStore-nextVisit">Next Visit</label>
                <div className="next-visit">
                    <input
                        type="date"
                        name="AddStore-nextVisit"
                        id="AddStore-nextVisit"
                        value={nextVisitDefault ? nextVisitDefault : ""}
                        onChange={(e) => {
                            const dates = e.target.value.split("-");
                            const date = `${dates[1]}/${dates[2]}/${dates[0]}`;
                            setNextVisit(date);
                        }}
                    />
                    {lastVisit && (
                        <button
                            className="Default-button"
                            type="button"
                            onClick={() => {
                                const days = 24 * 60 * 60 * 1000 * 90;
                                const lastVisitDate = new Date(lastVisit);
                                const nextVisitDate = new Date(lastVisitDate.getTime() + days);
                                const formatDate = `${nextVisitDate.getFullYear()}-${nextVisitDate.getMonth().toString().padStart(2, "0")}-${nextVisitDate
                                    .getDate()
                                    .toString()
                                    .padStart(2, "0")}`;
                                setNextVisitDefault(formatDate);
                                setNextVisit(nextVisitDate.toLocaleString().split(",")[0]);
                            }}
                        >
                            Default
                        </button>
                    )}
                </div>
                <br />
                <button type="submit" className="Submit-button">
                    Submit
                </button>
            </form>
        </div>
    );
}
