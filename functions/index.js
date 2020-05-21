const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios").default;
const dhive = require("@hivechain/dhive");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
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

// Use this function for production
exports.createAccount = functions.https.onCall(async (data, context) => {
  let referrer = data.referrer;
  let creator = config.account;
  let provider = config.account;
  let beneficiaries = [];

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
    console.log("IP was recently used for account creation.");
    return {
      error: "Your IP was recently used for account creation.",
    };
  }

  let queryUser = await accountsRef.where("uid", "==", context.auth.uid).get();

  if (!queryUser.empty) {
    console.log("Phone number was already used for account creation.");
    return {
      error: "Your phone number was already used for account creation.",
    };
  }

  let publicRef = db.collection("public");
  let queryCreators = await publicRef.doc("data").get();
  let creators = queryCreators.data().creators;
  let creatorCandidate = null;

  // Look up a creator with the most tickets available, prefer a creator if passed in
  creators.forEach((element) => {
    if (element.accountTickets > 0 && data.creator === element.account) {
      creatorCandidate = element;
      let creatorConfig = _.find(config.creator_instances, {
        creator: element.account,
      });
      creatorCandidate = { ...creatorCandidate, ...creatorConfig };
    } else if (element.accountTickets > 0) {
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
    console.log("Remote creator instance is offline.");
    return { error: "Remote creator instance is offline." };
  }

  if (
    creatorCandidate &&
    endpointCheck.data.owner_account === creatorCandidate.account
  ) {
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
      return { error: error };
    }
  }

  let accountData = {
    accountName: data.username,
    ipAddress: context.rawRequest.ip,
    uid: context.auth.uid,
    timestamp: new Date(),
    posted: false,
    referrer: referrer,
    creator: creator,
    provider: provider,
  };

  await db.collection("accounts").doc(data.username).set(accountData);
  console.log(accountData);

  return data;
});

// Use this function for development
exports.createFakeAccount = functions.https.onCall(async (data, context) => {
  return data;
});

exports.claimAccounts = functions.pubsub
  .schedule("every 10 minutes")
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
            });
          }
        });

        await db
          .collection("public")
          .doc("data")
          .set({ creators: creators }, { merge: true });
      }
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

let app = express();
app.use(cors());

app.get("/api/referrer/:account", async (req, res) => {
  let items = [];
  let refSize = db.collection("referralsCount");
  let ref = db.collection("referrals");

  let offset = 0;
  let limit = 20;
  let size = 0;

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

  let querySize = await refSize.doc(req.params.account).get();

  if (!querySize.empty) {
    let referralsCount = querySize.data();
    size = referralsCount.referrerCount;
  }

  let query = await ref
    .where("referrer.name", "==", req.params.account)
    .orderBy(admin.firestore.FieldPath.documentId())
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

  let querySize = await refSize.doc(req.params.account).get();

  if (!querySize.empty) {
    let referralsCount = querySize.data();
    size = referralsCount.providerCount;
  }

  let query = await ref
    .where("provider.name", "==", req.params.account)
    .orderBy(admin.firestore.FieldPath.documentId())
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

  let querySize = await refSize.doc(req.params.account).get();

  if (!querySize.empty) {
    let referralsCount = querySize.data();
    size = referralsCount.creatorCount;
  }

  let query = await ref
    .where("creator.name", "==", req.params.account)
    .orderBy(admin.firestore.FieldPath.documentId())
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

exports.api = functions.https.onRequest(app);
