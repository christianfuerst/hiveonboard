const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;
const dhive = require("@hiveio/dhive");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const CryptoJS = require("crypto-js");
const config = require("./config.json");

admin.initializeApp();
let db = admin.firestore();

let client = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

let key = dhive.PrivateKey.fromString(config.activeKey);
let keyLog = dhive.PrivateKey.fromString(config.activeKeyLog);

exports.createAccount = functions.https.onCall(async (data, context) => {
  let ticket = data.ticket;
  let phoneNumberHashObject = CryptoJS.SHA256("No Phone Number");
  let referrer = data.referrer;
  let creator = config.account;
  let provider = config.provider;
  let beneficiaries = [];

  if (ticket) {
    let ticketRef = db.collection("tickets").doc(ticket);
    let ticketDoc = await ticketRef.get();

    if (ticketDoc.exists) {
      let ticketData = ticketDoc.data();
      if (ticketData.consumed) {
        console.log("Ticket already consumed.");
        return {
          error: "Ticket already consumed.",
        };
      }
    } else {
      console.log("Ticket is invalid.");
      return {
        error: "Ticket is invalid.",
      };
    }
  } else {
    ticket = "NO TICKET";
    let oneWeekAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 604800000)
    );

    if (!context.auth.hasOwnProperty("uid")) {
      console.log("Verficiation failed.");
      return {
        error: "Verficiation failed.",
      };
    }

    let accountsRef = db.collection("accounts");
    let query = await accountsRef
      .where("ipAddress", "==", context.rawRequest.ip)
      .where("timestamp", ">", oneWeekAgo)
      .get();

    if (!query.empty) {
      // Delete user including phone number
      if (context.hasOwnProperty("auth")) {
        await admin.auth().deleteUser(context.auth.uid);
      }
      console.log("IP was recently used for account creation.");
      return {
        error: "Your IP was recently used for account creation.",
      };
    }

    phoneNumberHashObject = CryptoJS.SHA256(context.auth.token.phone_number);

    let queryUser = await accountsRef
      .where(
        "phoneNumberHash",
        "==",
        phoneNumberHashObject.toString(CryptoJS.enc.Hex)
      )
      .get();

    if (!queryUser.empty) {
      // Delete user including phone number
      if (context.hasOwnProperty("auth")) {
        await admin.auth().deleteUser(context.auth.uid);
      }
      console.log(
        "Phone number (" +
          phoneNumberHashObject.toString(CryptoJS.enc.Hex) +
          ") was already used for account creation."
      );
      return {
        error: "Your phone number was already used for account creation.",
      };
    }
  }

  let publicRef = db.collection("public");
  let queryCreators = await publicRef.doc("data").get();
  let creators = queryCreators.data().creators;
  let creatorCandidate = null;

  // Look up a creator with the most tickets available, prefer a creator if passed in
  creators.forEach((element) => {
    if (
      element.accountTickets > 0 &&
      element.available &&
      data.creator === element.account
    ) {
      creatorCandidate = element;
      let creatorConfig = _.find(config.creator_instances, {
        creator: element.account,
      });
      creatorCandidate = { ...creatorCandidate, ...creatorConfig };
    } else if (element.accountTickets > 0 && element.available) {
      if (creatorCandidate) {
        if (element.accountTickets > creatorCandidate.accountTickets) {
          creatorCandidate = element;
          let creatorConfig = _.find(config.creator_instances, {
            creator: element.account,
          });
          creatorCandidate = { ...creatorCandidate, ...creatorConfig };
        }
      } else {
        creatorCandidate = element;
        let creatorConfig = _.find(config.creator_instances, {
          creator: element.account,
        });
        creatorCandidate = { ...creatorCandidate, ...creatorConfig };
      }
    }
  });

  // Double-Check if the remote instance is up and running
  let endpointCheck;
  try {
    endpointCheck = await axios.get(creatorCandidate.endpoint);
  } catch (error) {
    endpointCheck = false;
    console.log("Remote creator instance is offline.");
  }

  if (creatorCandidate && endpointCheck) {
    // Creator instance available
    try {
      creator = creatorCandidate.account;

      // Build the custom_json beneficiaries array
      if (referrer) {
        beneficiaries.push({
          name: referrer,
          weight: config.fee.referrer,
          label: "referrer",
        });
      }
      if (creator) {
        beneficiaries.push({
          name: creator,
          weight: config.fee.creator,
          label: "creator",
        });
      }
      if (provider) {
        beneficiaries.push({
          name: provider,
          weight: config.fee.provider,
          label: "provider",
        });
      }

      let postRequest = await axios.post(
        creatorCandidate.endpoint + "/createAccount",
        {
          name: data.username,
          publicKeys: data.publicKeys,
          metaData: {
            beneficiaries: beneficiaries,
          },
        },
        {
          headers: {
            authority: creatorCandidate.apiKey,
          },
        }
      );

      if (postRequest.created === false) {
        console.log("Account creation on remote creator instance failed.");
        return { error: "Account creation on remote creator instance failed." };
      }
    } catch (error) {
      console.log("Remote creator instance is offline.");
      return { error: "Remote creator instance is offline." };
    }
  } else {
    // No creator instance available, we have to create ourself
    const ownerAuth = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[data.publicKeys.owner, 1]],
    };
    const activeAuth = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[data.publicKeys.active, 1]],
    };
    const postingAuth = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[data.publicKeys.posting, 1]],
    };

    // Build the custom_json beneficiaries array
    if (referrer) {
      beneficiaries.push({
        name: referrer,
        weight: config.fee.referrer,
        label: "referrer",
      });
    }
    if (creator) {
      beneficiaries.push({
        name: creator,
        weight: config.fee.creator,
        label: "creator",
      });
    }
    if (provider) {
      beneficiaries.push({
        name: provider,
        weight: config.fee.provider,
        label: "provider",
      });
    }

    const op = [
      "create_claimed_account",
      {
        creator: config.account,
        new_account_name: data.username,
        owner: ownerAuth,
        active: activeAuth,
        posting: postingAuth,
        memo_key: data.publicKeys.memo,
        json_metadata: JSON.stringify({
          beneficiaries: beneficiaries,
        }),
        extensions: [],
      },
    ];

    try {
      await client.broadcast.sendOperations([op], key);
    } catch (error) {
      // Delete user including phone number
      if (context.hasOwnProperty("auth")) {
        await admin.auth().deleteUser(context.auth.uid);
      }
      return { error: error };
    }
  }

  let accountData = {
    accountName: data.username,
    ipAddress: context.rawRequest.ip,
    phoneNumberHash: phoneNumberHashObject.toString(CryptoJS.enc.Hex),
    timestamp: new Date(),
    posted: false,
    referrer: referrer,
    creator: creator,
    provider: provider,
    delegation: true,
    ticket: ticket,
  };

  await db.collection("accounts").doc(data.username).set(accountData);

  // Delete user including phone number
  if (context.hasOwnProperty("auth")) {
    await admin.auth().deleteUser(context.auth.uid);
  }

  // Set ticket to consumed
  if (ticket) {
    await db
      .collection("tickets")
      .doc(ticket)
      .set({ consumed: true }, { merge: true });
  }

  // HP delegation
  try {
    await client.broadcast.delegateVestingShares(
      {
        delegatee: data.username,
        delegator: config.account,
        vesting_shares: config.defaultDelegation,
      },
      key
    );
  } catch (error) {
    console.log("Delegation Error", error);
  }

  console.log(JSON.stringify(accountData));

  return data;
});

exports.claimAccounts = functions.pubsub
  .schedule("every 30 minutes")
  .timeZone("Europe/Berlin")
  .onRun(async (context) => {
    try {
      let ac = await client.call("rc_api", "find_rc_accounts", {
        accounts: [config.account],
      });

      let rc = Number(ac.rc_accounts[0].rc_manabar.current_mana);

      if (rc > config.rcThreshold * 1000000000000) {
        let op = [
          "claim_account",
          {
            creator: config.account,
            fee: dhive.Asset.from("0.000 HIVE"),
            extensions: [],
          },
        ];

        await client.broadcast.sendOperations([op], key);
      }

      // Update account
      let accountResponse = await client.database.getAccounts([config.account]);

      if (accountResponse[0].hasOwnProperty("pending_claimed_accounts")) {
        await db
          .collection("public")
          .doc("data")
          .set(
            { accountTickets: accountResponse[0].pending_claimed_accounts },
            { merge: true }
          );
      }

      // Update creator_instances
      if (config.creator_instances.length > 0) {
        let accounts = [];
        let instances = {};

        await Promise.all(
          config.creator_instances.map(async (object) => {
            try {
              await axios.get(object.endpoint);
              instances[object.creator] = true;
            } catch (error) {
              instances[object.creator] = false;
            }
          })
        );

        config.creator_instances.forEach((element) => {
          accounts.push(element.creator);
        });

        let accountsResponse = await client.database.getAccounts(accounts);
        let creators = [];

        accountsResponse.forEach((element) => {
          if (element.hasOwnProperty("pending_claimed_accounts")) {
            creators.push({
              account: element.name,
              accountTickets: element.pending_claimed_accounts,
              available: instances[element.name],
            });
          }
        });

        await db
          .collection("public")
          .doc("data")
          .set({ creators: creators }, { merge: true });
      }

      // Remove HP delegation after 1 week
      let oneWeekAgo = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() - 604800000)
      );

      let accountsRef = db.collection("accounts");
      let query = await accountsRef
        .where("delegation", "==", true)
        .where("timestamp", "<", oneWeekAgo)
        .get();

      query.forEach((element) => {
        try {
          client.broadcast
            .delegateVestingShares(
              {
                delegatee: element.id,
                delegator: config.account,
                vesting_shares: "0.000000 VESTS",
              },
              key
            )
            .then(() => {
              accountsRef
                .doc(element.id)
                .set({ delegation: false }, { merge: true });
            });
        } catch (error) {
          console.log("Removing delegation Error", error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

exports.postAccountCreationReport = functions.pubsub
  .schedule("every 24 hours")
  .timeZone("Europe/Berlin")
  .onRun(async (context) => {
    let accountsRef = db.collection("accounts");
    let query = await accountsRef
      .where("posted", "==", false)
      .orderBy("timestamp")
      .get();

    if (query.empty) {
      // We haven't created any account, let's quit here
      return;
    }

    let today = new Date();
    let title =
      "Account Creation Report " + today.toISOString().substring(0, 10);
    let permlink =
      "account-creation-report-" + today.toISOString().substring(0, 10);
    let body =
      "This is an automatic generated account creation report from @" +
      config.account +
      ".\n" +
      "![badge_poweredbyhive_dark_240.png](https://files.peakd.com/file/peakd-hive/hiveonboard/SkMbcWod-badge_powered-by-hive_dark_240.png)\n" +
      "|Account|Referrer|Creation Time|\n|-|-|-|\n";
    let tag = "hiveonboard";
    let json_metadata = JSON.stringify({ tags: [tag] });

    query.forEach((doc) => {
      let account = doc.data();
      let timestamp = new Date(account.timestamp.seconds * 1000);
      body =
        body +
        "|@" +
        account.accountName +
        "|@" +
        account.referrer +
        "|" +
        timestamp.toISOString() +
        "|\n";

      db.collection("accounts").doc(account.accountName).set(
        {
          posted: true,
        },
        { merge: true }
      );
    });

    try {
      await client.broadcast.comment(
        {
          author: config.accountLog,
          body: body,
          json_metadata: json_metadata,
          parent_author: "",
          parent_permlink: tag,
          permlink: permlink,
          title: title,
        },
        keyLog
      );
    } catch (error) {
      console.log(error);
    }
  });

exports.addReferrals = functions.firestore
  .document("referrals/{referralId}")
  .onCreate(async (snap, context) => {
    let referral = snap.data();
    let increment = admin.firestore.FieldValue.increment(1);

    try {
      if (referral.hasOwnProperty("referrer")) {
        await db
          .collection("referralsCount")
          .doc(referral.referrer.name)
          .set({ referrerCount: increment }, { merge: true });
      }

      if (referral.hasOwnProperty("provider")) {
        await db
          .collection("referralsCount")
          .doc(referral.provider.name)
          .set({ providerCount: increment }, { merge: true });
      }

      if (referral.hasOwnProperty("creator")) {
        await db
          .collection("referralsCount")
          .doc(referral.creator.name)
          .set({ creatorCount: increment }, { merge: true });
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  });

exports.updateReferralsCount = functions.firestore
  .document("referralsCount/{referralId}")
  .onUpdate(async (change, context) => {
    let referral = change.after.data();
    let keyBadgeOne = dhive.PrivateKey.fromString(config.activeKeyBadgeOne);
    let keyBadgeTwo = dhive.PrivateKey.fromString(config.activeKeyBadgeTwo);
    let keyBadgeThree = dhive.PrivateKey.fromString(config.activeKeyBadgeThree);

    try {
      if (referral.hasOwnProperty("referrerCount")) {
        if (referral.referrerCount >= 10 && referral.referrerCount < 100) {
          if (!referral.hasOwnProperty("badge")) {
            // Add BadgeOne
            let jsonData = [
              "follow",
              {
                follower: config.badgeOne,
                following: change.after.id,
                what: ["blog"],
              },
            ];

            await client.broadcast.json(
              {
                required_auths: [],
                required_posting_auths: [config.badgeOne],
                id: "follow",
                json: JSON.stringify(jsonData),
              },
              keyBadgeOne
            );

            await db
              .collection("referralsCount")
              .doc(change.after.id)
              .set({ badge: config.badgeOne }, { merge: true });
          }
        }

        if (referral.referrerCount >= 100 && referral.referrerCount < 1000) {
          if (referral.badge === config.badgeOne) {
            // Remove BadgeOne & Add BadgeTwo
            let jsonData = [
              "follow",
              {
                follower: config.badgeOne,
                following: change.after.id,
                what: [],
              },
            ];

            await client.broadcast.json(
              {
                required_auths: [],
                required_posting_auths: [config.badgeOne],
                id: "follow",
                json: JSON.stringify(jsonData),
              },
              keyBadgeOne
            );

            jsonData = [
              "follow",
              {
                follower: config.badgeTwo,
                following: change.after.id,
                what: ["blog"],
              },
            ];

            await client.broadcast.json(
              {
                required_auths: [],
                required_posting_auths: [config.badgeTwo],
                id: "follow",
                json: JSON.stringify(jsonData),
              },
              keyBadgeTwo
            );

            await db
              .collection("referralsCount")
              .doc(change.after.id)
              .set({ badge: config.badgeTwo }, { merge: true });
          }
        }

        if (referral.referrerCount >= 1000) {
          if (referral.badge === config.badgeTwo) {
            // Remove BadgeTwo & Add BadgeThree
            let jsonData = [
              "follow",
              {
                follower: config.badgeTwo,
                following: change.after.id,
                what: [],
              },
            ];

            await client.broadcast.json(
              {
                required_auths: [],
                required_posting_auths: [config.badgeTwo],
                id: "follow",
                json: JSON.stringify(jsonData),
              },
              keyBadgeTwo
            );

            jsonData = [
              "follow",
              {
                follower: config.badgeThree,
                following: change.after.id,
                what: ["blog"],
              },
            ];

            await client.broadcast.json(
              {
                required_auths: [],
                required_posting_auths: [config.badgeThree],
                id: "follow",
                json: JSON.stringify(jsonData),
              },
              keyBadgeThree
            );

            await db
              .collection("referralsCount")
              .doc(change.after.id)
              .set({ badge: config.badgeThree }, { merge: true });
          }
        }
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  });

let app = express();
app.use(cors());

app.get("/api/referrer/:account", async (req, res) => {
  let items = [];
  let refSize = db.collection("referralsCount");
  let ref = db.collection("referrals");

  let offset = 0;
  let limit = 20;
  let size = 0;
  let orderBy = admin.firestore.FieldPath.documentId();

  if (req.query.hasOwnProperty("orderBy")) {
    switch (req.query.orderBy) {
      case "account":
        orderBy = admin.firestore.FieldPath.documentId();
        break;
      case "weight":
        orderBy = "referrer.weight";
        break;
      case "timestamp":
        orderBy = "referrer.timestamp";
        break;
      default:
        res.status(400).json({ error: "Invalid orderBy parameter" });
    }
  }

  if (req.query.hasOwnProperty("offset")) {
    if (Number.isInteger(parseInt(req.query.offset))) {
      offset = parseInt(req.query.offset);
    } else {
      res.status(400).json({ error: "Invalid offset parameter" });
    }
  }

  if (req.query.hasOwnProperty("limit")) {
    if (Number.isInteger(parseInt(req.query.limit))) {
      limit = parseInt(req.query.limit);
    } else {
      res.status(400).json({ error: "Invalid limit parameter" });
    }
  }

  let querySize = await refSize
    .where(admin.firestore.FieldPath.documentId(), "==", req.params.account)
    .get();

  querySize.forEach((doc) => {
    let referralsCount = doc.data();
    size = referralsCount.referrerCount;
  });

  let query = await ref
    .where("referrer.name", "==", req.params.account)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .get();

  query.forEach((doc) => {
    let data = doc.data();
    items.push({
      account: doc.id,
      weight: data.referrer.weight,
      timestamp: data.referrer.timestamp._seconds * 1000,
    });
  });

  res.json({ items: items, limit: limit, offset: offset, size: size });
});

app.get("/api/provider/:account", async (req, res) => {
  let items = [];
  let refSize = db.collection("referralsCount");
  let ref = db.collection("referrals");

  let offset = 0;
  let limit = 20;
  let size = 0;
  let orderBy = admin.firestore.FieldPath.documentId();

  if (req.query.hasOwnProperty("orderBy")) {
    switch (req.query.orderBy) {
      case "account":
        orderBy = admin.firestore.FieldPath.documentId();
        break;
      case "weight":
        orderBy = "provider.weight";
        break;
      case "timestamp":
        orderBy = "provider.timestamp";
        break;
      default:
        res.status(400).json({ error: "Invalid orderBy parameter" });
    }
  }

  if (req.query.hasOwnProperty("offset")) {
    if (Number.isInteger(parseInt(req.query.offset))) {
      offset = parseInt(req.query.offset);
    } else {
      res.status(400).json({ error: "Invalid offset parameter" });
    }
  }

  if (req.query.hasOwnProperty("limit")) {
    if (Number.isInteger(parseInt(req.query.limit))) {
      limit = parseInt(req.query.limit);
    } else {
      res.status(400).json({ error: "Invalid limit parameter" });
    }
  }

  let querySize = await refSize
    .where(admin.firestore.FieldPath.documentId(), "==", req.params.account)
    .get();

  querySize.forEach((doc) => {
    let referralsCount = doc.data();
    size = referralsCount.providerCount;
  });

  let query = await ref
    .where("provider.name", "==", req.params.account)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .get();

  query.forEach((doc) => {
    let data = doc.data();
    items.push({
      account: doc.id,
      weight: data.provider.weight,
      timestamp: data.provider.timestamp._seconds * 1000,
    });
  });

  res.json({ items: items, limit: limit, offset: offset, size: size });
});

app.get("/api/creator/:account", async (req, res) => {
  let items = [];
  let refSize = db.collection("referralsCount");
  let ref = db.collection("referrals");

  let offset = 0;
  let limit = 20;
  let size = 0;
  let orderBy = admin.firestore.FieldPath.documentId();

  if (req.query.hasOwnProperty("orderBy")) {
    switch (req.query.orderBy) {
      case "account":
        orderBy = admin.firestore.FieldPath.documentId();
        break;
      case "weight":
        orderBy = "creator.weight";
        break;
      case "timestamp":
        orderBy = "creator.timestamp";
        break;
      default:
        res.status(400).json({ error: "Invalid orderBy parameter" });
    }
  }

  if (req.query.hasOwnProperty("offset")) {
    if (Number.isInteger(parseInt(req.query.offset))) {
      offset = parseInt(req.query.offset);
    } else {
      res.status(400).json({ error: "Invalid offset parameter" });
    }
  }

  if (req.query.hasOwnProperty("limit")) {
    if (Number.isInteger(parseInt(req.query.limit))) {
      limit = parseInt(req.query.limit);
    } else {
      res.status(400).json({ error: "Invalid limit parameter" });
    }
  }

  let querySize = await refSize
    .where(admin.firestore.FieldPath.documentId(), "==", req.params.account)
    .get();

  querySize.forEach((doc) => {
    let referralsCount = doc.data();
    size = referralsCount.creatorCount;
  });

  let query = await ref
    .where("creator.name", "==", req.params.account)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .get();

  query.forEach((doc) => {
    let data = doc.data();
    items.push({
      account: doc.id,
      weight: data.creator.weight,
      timestamp: data.creator.timestamp._seconds * 1000,
    });
  });

  res.json({ items: items, limit: limit, offset: offset, size: size });
});

app.get("/api/tickets/:ticket", async (req, res) => {
  let ref = db.collection("tickets").doc(req.params.ticket);
  let doc = await ref.get();

  if (doc.exists) {
    let ticket = doc.data();
    if (ticket.consumed) {
      res.json({ valid: false });
    } else {
      res.json({ valid: true });
    }
  } else {
    res.json({ valid: false });
  }
});

app.post("/api/tickets", async (req, res) => {
  function create_UUID() {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  let auth = req.headers.authority;

  if (!auth) {
    console.log(
      "POST request to /api/tickets - Refused: Authorization header missing. - Source: " +
        req.ip
    );
    res.status(401).send("Authorization header missing.");
  } else {
    if (auth !== config.ticketApiKey) {
      console.log(
        "POST request to /api/tickets - Refused: Invalid auth token. - Source: " +
          req.ip
      );
      res.status(401).send("Invalid auth token.");
    } else {
      let referrer = req.body.referrer;
      let tickets = req.body.tickets;

      if (typeof referrer === "undefined" || typeof tickets === "undefined") {
        res.status(400).send("Body data is invalid or missing.");
      } else {
        let ticketsArray = [];
        let batch = db.batch();
        let i;

        for (i = 0; i < parseInt(tickets); i++) {
          let ticket = create_UUID();
          let ticketRef = db.collection("tickets").doc(ticket);

          batch.set(ticketRef, {
            ticket: ticket,
            referrer: referrer,
            consumed: false,
          });

          ticketsArray.push(ticket);
        }

        await batch.commit();

        res.setHeader("Content-Type", "application/json");
        res.json(ticketsArray);
      }
    }
  }
});

exports.api = functions.https.onRequest(app);
