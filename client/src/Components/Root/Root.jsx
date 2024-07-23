import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Root.css";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import Loading from "./Loading";

import Options from "../Options/Options";

export default function Root() {
    const { isLoading, error, data, refetch } = useQuery({
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

    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [inEdit, setInEdit] = useState(false);
    const [search, setSearch] = useState("");

    function authParams() {
        return {
            username: window.localStorage.getItem("username"),
            password: window.localStorage.getItem("password"),
        };
    }

    function isValidDateFormat(str) {
        const regex = /^([1-9]|1[0-2])\/([1-9]|[12][0-9]|3[01])\/(19|20)\d\d$/;
        return regex.test(str);
    }

    useEffect(() => {
        if (data) {
            if (window.localStorage.getItem("searchLocation")) {
                setSearch(window.localStorage.getItem("searchLocation"));
            }

            setStores(data.sort((a, b) => a.daysLeft - b.daysLeft));
            if (search) {
                setStores(data.filter((store) => store.storeName.toLowerCase().includes(search.toLowerCase())));

                if (isValidDateFormat(search))
                    setStores(
                        data.filter((store) => {
                            return store.nextVisit === search;
                        })
                    );
            } else setStores(data);
        }
    }, [data, search]);

    if (error)
        return (
            <>
                {error.message}
                {error.message === "Request failed with status code 401" ? navigate("/login") : refetch()}
            </>
        );

    return (
        <div className="Root">
            <Options />
            <div className="Root-search">
                <div className="search-bar">
                    <input
                        placeholder="Search Store..."
                        className="Root-input"
                        value={window.localStorage.getItem("searchLocation") || ""}
                        type="text"
                        id="Root-search"
                        onChange={(e) => {
                            setSearch(e.target.value);
                            window.localStorage.setItem("searchLocation", e.target.value);
                        }}
                    />
                    <button
                        onClick={() => {
                            setSearch("");
                            window.localStorage.setItem("searchLocation", "");
                        }}
                        className="add-store"
                    >
                        Clear
                    </button>
                </div>
                <div className="add-store-container">
                    <button onClick={() => setInEdit(!inEdit)} className={`add-store ${inEdit ? "inEdit" : ""}`}>
                        Edit
                    </button>
                    <Link className="add-store" to={"/addStore"}>
                        Add Store
                    </Link>
                </div>
            </div>
            <div className="Root-graph">
                <div className="Element-container">
                    <h3 className="Element-Title Element-store">Store</h3>
                    <h3 className="Element-Title Element-visits">Last Visit</h3>
                    <h3 className="Element-Title Element-visits">Next Visit</h3>
                    <h3 className="Element-Title Element-days">Days</h3>
                </div>
                {isLoading && <Loading />}
                {data &&
                    stores.map((info) => {
                        return (
                            <button
                                key={info.storeName + info.storeLocation}
                                className={`Element-container ${info.daysLeft <= 1 ? "Ready" : ""} ${inEdit ? "Selectable" : ""}`}
                                onClick={() => {
                                    if (info.daysLeft <= 1 && !inEdit) {
                                        axios
                                            .put(
                                                `${process.env.REACT_APP_API_URL}/updateLastVisit/${info.storeName}/${
                                                    info.storeLocation ? info.storeLocation : "undefined"
                                                }`,
                                                {},
                                                {
                                                    auth: authParams(),
                                                }
                                            )
                                            .then(() => refetch());
                                    }

                                    if (inEdit) {
                                        setInEdit(false);
                                        navigate(`/edit/${info.storeName}/${info.storeLocation || "undefined"}`);
                                    }
                                }}
                            >
                                <span className={`Element-element Element-store`}>
                                    {info.storeLocation ? info.storeName + " - " + info.storeLocation : info.storeName}
                                </span>
                                <span className={`Element-element Element-visits`}>{info.lastVisit}</span>
                                <span className={`Element-element Element-visits`}>{info.nextVisit}</span>
                                <span className={`Element-element Element-days`}>{info.daysLeft}</span>
                                <button
                                    className="Element-element refresh-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        axios
                                            .put(
                                                `${process.env.REACT_APP_API_URL}/updateLastVisit/${info.storeName}/${
                                                    info.storeLocation ? info.storeLocation : "undefined"
                                                }`,
                                                {},
                                                {
                                                    auth: authParams(),
                                                }
                                            )
                                            .then(() => {
                                                refetch();
                                            });
                                    }}
                                >
                                    <h3>Done Today</h3>
                                </button>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
}
