import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import "./Edit.css";

export default function Edit() {
    const navigate = useNavigate();

    const [storeName, setStoreName] = useState("");
    const [storeLocation, setStoreLocation] = useState("");
    const [lastVisit, setLastVisit] = useState("");
    const [nextVisit, setNextVisit] = useState("");
    const [nextVisitDefault, setNextVisitDefault] = useState("");

    const [preStoreName, setPreStoreName] = useState("");
    const [preStoreLocation, setPreStoreLocation] = useState("");
    const [preLastVisit, setPreLastVisit] = useState("");
    const [preNextVisit, setPreNextVisit] = useState("");

    const { storeName: storeNameParam, storeLocation: storeLocationParam } = useParams();

    const { isLoading, error, data } = useQuery({
        queryKey: ["store"],
        queryFn: () =>
            axios
                .get(`${process.env.REACT_APP_API_URL}/info`, {
                    auth: {
                        username: window.localStorage.getItem("username"),
                        password: window.localStorage.getItem("password"),
                    },
                })
                .then((data) => data.data),
    });

    function submitForm() {
        axios
            .put(
                `${process.env.REACT_APP_API_URL}/editInfo/${storeNameParam}/${storeLocationParam}`,
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
                window.location = "/";
            })
            .catch((e) => {
                console.log(e);
            });
    }

    function deleteStore() {
        axios
            .delete(`${process.env.REACT_APP_API_URL}/deleteInfo/${storeNameParam}/${storeLocationParam}`, {
                auth: {
                    username: window.localStorage.getItem("username"),
                    password: window.localStorage.getItem("password"),
                },
            })
            .then(() => {
                window.location = "/";
            })
            .catch((e) => {
                console.log(e);
            });
    }

    useEffect(() => {
        if (data) {
            console.log("Params", storeNameParam, typeof storeLocationParam);
            const store = data.find((store) => {
                if (store.storeName === storeNameParam) {
                    const storeLocation = store.storeLocation === "" ? "undefined" : store.storeLocation;
                    if (storeLocation === storeLocationParam) {
                        return true;
                    }
                }
                return false;
            });

            if (store) {
                setPreStoreName(store.storeName);
                setPreStoreLocation(store.storeLocation);
                setPreLastVisit(store.lastVisit);
                setPreNextVisit(store.nextVisit);
            }
        }
    }, [storeNameParam, storeLocationParam, data, preStoreLocation, preStoreName, preLastVisit, preNextVisit]);

    if (isLoading) return <FontAwesomeIcon icon={faSpinner} spinPulse className="Element-spinner" style={{ color: "white" }} />;

    if (error)
        return (
            <p>
                {error.message}
                {error.message === "Request failed with status code 401" ? navigate("/login") : null}
            </p>
        );

    return (
        <div className="Root">
            <Link to="/">
                <FontAwesomeIcon icon={faChevronLeft} className="Back" />
            </Link>
            <h1 className="AddStore-title">Edit Menu</h1>
            <div className="preview-box">
                <span>Preview</span>
                <div className="preview">
                    <p>Store Name: {preStoreName}</p>
                    <p>Store Location: {preStoreLocation}</p>
                    <p>Last Visit: {preLastVisit}</p>
                    <p>Next Visit: {preNextVisit}</p>
                </div>
            </div>
            <form
                action=""
                className="AddStore-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    submitForm();
                }}
            >
                <label htmlFor="AddStore-name">New Store name:</label>
                <input placeholder="Ex: McDonald" id="AddStore-name" name="AddStore-name" type="text" onChange={(e) => setStoreName(e.target.value)} />
                <label htmlFor="AddStore-location">New Store location: (Optional)</label>
                <div className="store-location-container">
                    <input
                        placeholder="Ex: Naples FL"
                        id="AddStore-location"
                        name="AddStore-location"
                        type="text"
                        value={storeLocation}
                        onChange={(e) => setStoreLocation(e.target.value)}
                    />
                    <button type="button" className="Default-button" onClick={() => setStoreLocation("undefined")}>
                        Remove
                    </button>
                </div>
                <br />
                <label htmlFor="AddStore-lastVisit">New Last Visit</label>
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

                <label htmlFor="AddStore-nextVisit">New Next Visit</label>
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
                            setNextVisitDefault(e.target.value);
                        }}
                    />
                    {preLastVisit && (
                        <button
                            className="Default-button"
                            type="button"
                            onClick={() => {
                                const days = 24 * 60 * 60 * 1000 * 90;
                                const lastVisitDate = new Date(preLastVisit);
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
                <button type="button" onClick={() => deleteStore()} className="Delete-button">
                    Delete
                </button>
            </form>
        </div>
    );
}
