const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config");
const http = require("http");
const basicAuth = require("express-basic-auth");
const XLSX = require("xlsx");

const app = express();
app.use(express.json());
app.use(cors());

async function connectMongoDB() {
    for (let i = 0; i < 1000; i++) {
        try {
            await mongoose.connect(config.Database.url).catch((err) => {
                console.log(err);
                connectMongoDB();
                return;
            });
            break;
        } catch (e) {
            console.log(e);
        }
    }
}

connectMongoDB();

const Info = require("./Models/info");
const Config = require("./Models/config");

Config.findOne().then((configSetting) => {
    let interval = setInterval(() => {
        Config.findOne().then((config) => {
            if (config.MailJet) {
                SendEmail(config.yourEmail);
            }
        });
    }, 1000 * 60 * 60 * 24);
    app.use(basicAuth({ users: { admin: configSetting.password } }));
    app.post("/addInfo", async (req, res) => {
        const storeName = req.body.storeName;
        const storeLocation = req.body.storeLocation;
        const lastVisit = req.body.lastVisit;
        const nextVisit = req.body.nextVisit;

        // console.log all the data
        console.log("Added new Store: ", storeName, storeLocation, lastVisit, nextVisit);

        const lastVisitDate = new Date(lastVisit);
        const nextVisitDate = new Date(nextVisit);

        const newInfo = new Info({
            storeName: storeName,
            storeLocation: storeLocation || "undefined",
            lastVisit: lastVisitDate,
            nextVisit: nextVisitDate,
        });

        newInfo
            .save()
            .then(() => {
                res.status(201).json({ message: `Information has been added to the database.` });
            })
            .catch((e) => {
                res.status(500).json({ message: `Failed to save info in the database, ${e}.` });
            });
    });

    app.delete("/removeInfo/:storeName/:storeLocation", async (req, res) => {
        const storeName = req.params.storeName;
        let storeLocation = req.params.storeLocation;

        if (!storeLocation) storeLocation = "undefined";

        const info = await Info.findOne({ storeName: storeName, storeLocation: storeLocation });
        if (!info) return res.status(404).json({ message: `${storeName} could not be found in the database.` });

        await Info.deleteOne({ storeName: storeName, storeLocation: storeLocation });
        res.status(200).json({ message: `${storeName} has been removed from the database.` });
    });

    app.put("/updateLastVisit/:storeName/:storeLocation", async (req, res) => {
        const storeName = req.params.storeName;
        let storeLocation = req.params.storeLocation;

        if (!storeLocation) storeLocation = "undefined";

        const date = 24 * 60 * 60 * 1000 * 90;

        const lastVisit = new Date();
        const nextVisit = new Date(lastVisit.getTime() + date);

        const info = await Info.findOne({ storeName: storeName, storeLocation: storeLocation });
        if (!info) return res.status(404).json({ message: `${storeName} could not be found in the database.` });

        info.lastVisit = lastVisit;
        info.nextVisit = nextVisit;
        info.save()
            .then(() => {
                res.status(200).json({ message: `Last visit for ${storeName} has been updated in the database.` });
            })
            .catch((e) => {
                res.status(500).json({ message: `Failed to update last visit in the database, ${e}.` });
            });
    });

    app.put("/updateNextVisit/:storeName/:storeLocation", async (req, res) => {
        const storeName = req.params.storeName;
        let storeLocation = req.params.storeLocation;

        if (!storeLocation) storeLocation = "undefined";

        const nextVisit = req.body.nextVisit;

        const info = await Info.findOne({ storeName: storeName, storeLocation: storeLocation });
        if (!info) return res.status(404).json({ message: `${storeName} could not be found in the database.` });

        const nextVisitDate = new Date(nextVisit);

        if (nextVisitDate.getTime() < new Date().getTime()) {
            res.status(400).json({ message: "Invalid next visit date. Date must be greater then a day from now." });
            return;
        }

        info.nextVisit = nextVisitDate;
        info.save()
            .then(() => {
                res.status(200).json({ message: `Next visit for ${storeName} has been updated in the database.` });
            })
            .catch((e) => {
                res.status(500).json({ message: `Failed to update next visit in the database, ${e}.` });
            });
    });

    app.put("/editInfo/:storeName/:storeLocation", async (req, res) => {
        const storeName = req.params.storeName;
        let storeLocation = req.params.storeLocation;

        const info = await Info.findOne({ storeName: storeName, storeLocation: storeLocation });
        if (!info) return res.status(404).json({ message: `${storeName} could not be found in the database.` });

        const storeNameUpdate = req.body.storeName;
        const storeLocationUpdate = req.body.storeLocation;
        const lastVisitUpdate = req.body.lastVisit;
        const nextVisitUpdate = req.body.nextVisit;

        if (storeNameUpdate) info.storeName = storeNameUpdate;
        if (storeLocationUpdate) info.storeLocation = storeLocationUpdate;
        if (lastVisitUpdate) info.lastVisit = lastVisitUpdate;
        if (nextVisitUpdate) info.nextVisit = nextVisitUpdate;

        info.save()
            .then(() => {
                res.status(200).json({ message: `Information for ${storeName} has been updated in the database.` });
            })
            .catch((e) => {
                res.status(500).json({ message: `Failed to update info in the database, ${e}.` });
            });
    });

    app.delete("/deleteInfo/:storeName/:storeLocation", async (req, res) => {
        const storeName = req.params.storeName;
        let storeLocation = req.params.storeLocation;

        if (!storeLocation) storeLocation = "undefined";

        const info = await Info.findOne({ storeName: storeName, storeLocation: storeLocation });
        if (!info) return res.status(404).json({ message: `${storeName} could not be found in the database.` });

        await Info.deleteOne({ storeName: storeName, storeLocation: storeLocation });
        res.status(200).json({ message: `${storeName} has been removed from the database.` });
    });

    app.get("/info", async (req, res) => {
        const data = [];
        const info = await Info.find();

        const option = {
            month: "numeric",
            day: "numeric",
            year: "numeric",
        };

        for (let i = 0; i < info.length; i++) {
            data.push({
                storeName: info[i].storeName,
                storeLocation: info[i].storeLocation !== "undefined" ? info[i].storeLocation : "",
                lastVisit: info[i].lastVisit.toLocaleDateString(undefined, option),
                nextVisit: info[i].nextVisit.toLocaleDateString(undefined, option),
                daysLeft: Math.ceil((info[i].nextVisit.getTime() - new Date().getTime()) / 1000 / 60 / 60 / 24),
            });
        }

        res.status(200).send(data);
    });

    async function SendEmail(email) {
        const info = await Info.find();

        const upcomingJobs = info.filter((job) => {
            return (
                job.nextVisit.getTime() - new Date().getTime() >= 24 * 60 * 60 * 1000 * 6 &&
                job.nextVisit.getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000 * 8
            );
        });

        let string = "";

        let end = upcomingJobs == upcomingJobs[upcomingJobs.length - 1] ? "" : ", ";

        for (const job of upcomingJobs) {
            string += job.storeLocation !== "undefined" ? `${job.storeName}-${job.storeLocation}${end}` : `${job.storeName}${end}`;
        }

        console.log(string, new Date().toDateString());

        const data = JSON.stringify({
            Messages: [
                {
                    From: { Email: "YourEmail@Address.com", Name: "Name of Email" },
                    To: [{ Email: email, Name: "User" }],
                    Subject: "Next Week's Upcoming Jobs",
                    TextPart: string,
                },
            ],
        });

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.set("Authorization", "Basic " + btoa(`7d5c8c9bd38b8a5b524788e7aa101136` + ":" + `c06677b9028f476dbf20d55368c95d9d`));

        const requestConfig = {
            method: "POST",
            headers: myHeaders,
            body: data,
        };

        if (upcomingJobs.length > 0) {
            fetch("https://api.mailjet.com/v3.1/send", requestConfig)
                .then((response) => response.text())
                .then((result) => console.log(result))
                .catch((error) => console.log("error", error));
        }
    }

    app.put("/updateEmail", async (req, res) => {
        const email = req.body.email;
        const mailJet = req.body.mailJet;
        const password = req.body.password;

        const config = await Config.findOne();
        if (!config) {
            const newConfig = new Config({ MailJet: mailJet, yourEmail: email, password: password });
            if (mailJet) interval = setInterval(() => SendEmail(email), 1000 * 60 * 60 * 24);
            newConfig
                .save()
                .then(() => {
                    res.status(200).json({ message: "MailJet config has been updated in the database." });
                })
                .catch((e) => {
                    res.status(500).json({ message: `Failed to update mailJet config in the database, ${e}.` });
                });
            return;
        }
        if (email) config.yourEmail = email;
        if (mailJet) config.MailJet = mailJet;
        if (password) config.password = password;
        // if (mailJet) interval = setInterval(() => SendEmail(email), 1000 * 60 * 60 * 24);
        config
            .save()
            .then(() => {
                res.status(200).json({ message: "MailJet config has been updated in the database." });
            })
            .catch((e) => {
                res.status(500).json({ message: `Failed to update mailJet config in the database, ${e}.` });
            });
    });

    app.put("/toggleMailJet", async (req, res) => {
        const mailJetOn = await Config.findOne({ MailJet: true });
        const mailJetOff = await Config.findOne({ MailJet: false });

        if (mailJetOff) {
            mailJetOff.MailJet = true;
            interval = setInterval(() => SendEmail(mailJetOff.yourEmail), 1000 * 60 * 60 * 24);
            mailJetOff
                .save()
                .then(() => {
                    res.status(200).json({ message: "MailJet will now start sending automated emails." });
                })
                .catch((e) => {
                    res.status(500).json({ message: `Failed to update mailJet config in the database, ${e}.` });
                });
        } else if (mailJetOn) {
            mailJetOn.MailJet = false;
            clearInterval(interval);
            mailJetOn
                .save()
                .then(() => {
                    res.status(200).json({ message: "MailJet will no longer send automated emails." });
                })
                .catch((e) => {
                    res.status(500).json({ message: `Failed to update mailJet config in the database, ${e}.` });
                });
        }
    });

    app.get("/settings", async (req, res) => {
        const config = await Config.findOne();

        res.send(config);
    });

    app.get("/downloadDatabase", async (req, res) => {
        const info = await Info.find();

        const data = [];

        for (const store of info) {
            data.push({
                storeName: store.storeName,
                storeLocation: store.storeLocation,
                lastVisit: store.lastVisit,
                nextVisit: store.nextVisit,
            });
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const file = XLSX.writeFile(workbook, "database.xlsx");

        res.download("./database.xlsx");
    });

    http.createServer(app).listen(config.Port, config.Host, () => {
        console.log(`Server running on ${config.Host}:${config.Port}`);
    });
});
