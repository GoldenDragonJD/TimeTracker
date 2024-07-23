import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faRotateBack, faRotateForward } from "@fortawesome/free-solid-svg-icons";

import Options from "../Options/Options";
import Loading from "../Root/Loading";

import "./Calendar.css";

export default function Calendar() {
    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["calendar"],
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

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [inEdit, setInEdit] = useState(false);
    const [oldDate, setOldDate] = useState("");
    const [newDate, setNewDate] = useState("");

    const navigate = useNavigate();

    async function updateDates(day) {
        const stores = data.filter((store) => {
            return store.nextVisit === oldDate;
        });

        const history = window.localStorage.getItem("history") ? JSON.parse(window.localStorage.getItem("history")) : [];

        const actions = [];

        for (let i = 0; i < stores.length; i++) {
            const store = stores[i];
            actions.push({ storeName: store.storeName, storeLocation: store.storeLocation, nextVisit: store.nextVisit, newLocation: day });

            let error = false;

            await axios
                .put(
                    `${process.env.REACT_APP_API_URL}/updateNextVisit/${store.storeName}/${store.storeLocation || "undefined"}`,
                    {
                        nextVisit: day,
                    },
                    {
                        auth: {
                            username: window.localStorage.getItem("username"),
                            password: window.localStorage.getItem("password"),
                        },
                    }
                )
                .then(() => {
                    refetch();
                    setOldDate("");
                    setNewDate("");
                    window.localStorage.setItem("future", JSON.stringify([]));
                })
                .catch((e) => {
                    console.log(e.message);
                    if (e.message === "Request failed with status code 400") {
                        alert("Invalid date. Please try again.");
                        setOldDate("");
                        setNewDate("");
                        actions.pop();
                        error = true;
                    }
                });
            if (error) break;
        }

        history.push(actions);
        window.localStorage.setItem("history", JSON.stringify(history));
    }

    async function undo() {
        const history = JSON.parse(window.localStorage.getItem("history"));
        const future = JSON.parse(window.localStorage.getItem("future")) || [];
        const futureActions = [];

        if (!history.length) return;

        const actions = history.pop();

        for (const action of actions) {
            futureActions.push({
                storeName: action.storeName,
                storeLocation: action.storeLocation,
                nextVisit: action.newLocation,
                newLocation: action.nextVisit,
            });
            await axios
                .put(
                    `${process.env.REACT_APP_API_URL}/updateNextVisit/${action.storeName}/${action.storeLocation || "undefined"}`,
                    {
                        nextVisit: action.nextVisit,
                    },
                    {
                        auth: {
                            username: window.localStorage.getItem("username"),
                            password: window.localStorage.getItem("password"),
                        },
                    }
                )
                .then(() => {
                    refetch();
                })
                .catch((e) => {
                    console.log(e.message);
                    futureActions.pop();
                });
        }

        future.push(futureActions);
        window.localStorage.setItem("future", JSON.stringify(future));

        window.localStorage.setItem("history", JSON.stringify(history));
    }

    async function redo() {
        const future = JSON.parse(window.localStorage.getItem("future"));
        const history = JSON.parse(window.localStorage.getItem("history")) || [];

        if (!future.length) return;

        const pastActions = [];

        const actions = future.pop();

        for (const action of actions) {
            pastActions.push({
                storeName: action.storeName,
                storeLocation: action.storeLocation,
                nextVisit: action.newLocation,
                newLocation: action.nextVisit,
            });
            await axios
                .put(
                    `${process.env.REACT_APP_API_URL}/updateNextVisit/${action.storeName}/${action.storeLocation || "undefined"}`,
                    {
                        nextVisit: action.nextVisit,
                    },
                    {
                        auth: {
                            username: window.localStorage.getItem("username"),
                            password: window.localStorage.getItem("password"),
                        },
                    }
                )
                .then(() => {
                    refetch();
                })
                .catch((e) => {
                    console.log(e.message);
                });
        }

        history.push(pastActions);
        window.localStorage.setItem("history", JSON.stringify(history));
        window.localStorage.setItem("future", JSON.stringify(future));
    }

    if (error)
        return (
            <>
                {error.message}
                {error.message === "Request failed with status code 401" ? window.location.replace("/login") : refetch()}
            </>
        );

    if (isLoading) return <Loading />;

    function getDaysOfWeekDay(weekday, month, year) {
        let date = new Date(year, month, 1);
        let days = [];

        for (let i = 1; i <= 42; i++) {
            if (date.getDay() === weekday) {
                days.push(date.toLocaleDateString());
            }
            date.setDate(date.getDate() + 1);
        }

        if (days.length !== 5) {
            if (days[0].split("/")[1] === "1" && weekday === 0) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "2" && weekday === 1) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "3" && weekday === 2) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "4" && weekday === 3) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "5" && weekday === 4) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "6" && weekday === 5) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "7" && weekday === 6) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "7" && weekday < 6) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "6" && weekday < 5) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "5" && weekday < 4) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "4" && weekday < 3) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "3" && weekday < 2) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "2" && weekday < 1) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "1" && weekday < 0) {
                days.unshift("N/A");
            }

            if (days[0].split("/")[1] === "6" && weekday > 5) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "5" && weekday > 4) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "4" && weekday > 3) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "3" && weekday > 2) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "2" && weekday > 1) {
                days.push("N/A");
            }

            if (days[0].split("/")[1] === "1" && weekday > 0) {
                days.push("N/A");
            }
        }

        return days;
    }

    function daysOfWeek() {
        return [0, 1, 2, 3, 4, 5, 6];
    }

    function getMonthName(month) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        return months[month];
    }

    return (
        <div className="Root">
            <Options />
            <div className="calendar-control-container">
                <button
                    onClick={() => {
                        setMonth(month - 1);
                        if (month === 0) {
                            setYear(year - 1);
                            setMonth(11);
                        }
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {window.localStorage.getItem("history")?.length > 0 && (
                    <button className="undo-button" onClick={() => undo()}>
                        <FontAwesomeIcon icon={faRotateBack} />
                    </button>
                )}
                <button
                    onClick={() => {
                        setInEdit(!inEdit);
                        if (inEdit) {
                            setOldDate("");
                            setNewDate("");
                        }
                    }}
                    className={`edit-button ${inEdit ? "inEdit" : ""}`}
                >
                    {getMonthName(new Date(year, month).getMonth())}
                </button>
                {window.localStorage.getItem("future")?.length > 0 && (
                    <button className="undo-button" onClick={() => redo()}>
                        <FontAwesomeIcon icon={faRotateForward} />
                    </button>
                )}
                <button
                    onClick={() => {
                        setMonth(month + 1);
                        if (month === 11) {
                            setYear(year + 1);
                            setMonth(0);
                        }
                    }}
                    className="next"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
            <div className="Calendar-container">
                <div className="week-days">
                    <h2 className="week-day">Sunday</h2>
                    <h2 className="week-day">Monday</h2>
                    <h2 className="week-day">Tuesday</h2>
                    <h2 className="week-day">Wednesday</h2>
                    <h2 className="week-day">Thursday</h2>
                    <h2 className="week-day">Friday</h2>
                    <h2 className="week-day">Saturday</h2>
                </div>

                <div className="month-days">
                    {daysOfWeek().map((weekday) => (
                        <div className="day-of-week" key={weekday + "2"}>
                            {getDaysOfWeekDay(weekday, month, year).map((day) => (
                                <button
                                    key={day}
                                    className={`day-container ${
                                        inEdit && data.filter((info) => info.nextVisit === day).length > 0 ? "calendar-selectable" : ""
                                    } ${inEdit && day === oldDate ? "old-date" : ""} ${inEdit && day === newDate ? "new-date" : ""}
                                    ${data.filter((info) => info.nextVisit === day).length > 0 ? "button-selectable" : ""} `}
                                    onClick={() => {
                                        if (inEdit && data.filter((info) => info.nextVisit === day).length > 0) {
                                            setOldDate(day);
                                        }

                                        if (oldDate && oldDate === day) {
                                            setOldDate("");
                                            setInEdit(false);
                                        }

                                        if (oldDate && oldDate !== day && day !== "N/A") {
                                            console.log("new date", day);
                                            setNewDate(day);
                                            updateDates(day);
                                        }

                                        if (!inEdit && data.filter((info) => info.nextVisit === day).length > 0) {
                                            navigate("/");
                                            window.localStorage.setItem("searchLocation", day);
                                        }
                                    }}
                                >
                                    <h3 className="day-number">{new Date(day).getDate() ? new Date(day).getDate() : ""}</h3>

                                    {day.split("/")[1] === "1" && day.split("/")[0] - 1 !== month ? (
                                        <span className="month-name">{getMonthName(day.split("/")[0] - 1)}</span>
                                    ) : null}

                                    <div className="info-container">
                                        {data.map((info) => {
                                            if (info.nextVisit === day) {
                                                return (
                                                    <span key={info.storeName + info.storeLocation} className="info-data">
                                                        {info.storeLocation ? info.storeName + " - " + info.storeLocation : info.storeName}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="year-container">
                    <h3 className="year">{year}</h3>
                </div>
            </div>
        </div>
    );
}
