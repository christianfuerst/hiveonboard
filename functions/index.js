const functions = require("firebase-functions");
const admin = require("firebase-admin");
const dhive = require("@hivechain/dhive");
const config = require("./config.json");

admin.initializeApp();
let db = admin.firestore();

let client = new dhive.Client([
  "https://api.hive.blog",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network",
]);

let key = dhive.PrivateKey.fromLogin(config.account, config.password, "active");

// Use this function for production
exports.createAccount = functions.https.onCall(async (data, context) => {
  let oneWeekAgo = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 604800000)
  );

  let accountsRef = db.collection("accounts");
  let query = await accountsRef
    .where("ipAddress", "==", context.rawRequest.ip)
    .where("timestamp", ">", oneWeekAgo)
    .get();

  if (!query.empty) {
    return {
      error: "Your IP was recently used for account creation.",
    };
  }

  let queryUser = await accountsRef.where("uid", "==", context.auth.uid).get();

  if (!queryUser.empty) {
    return {
      error: "Your phone number was already used for account creation.",
    };
  }

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

  const op = [
    "create_claimed_account",
    {
      creator: config.account,
      new_account_name: data.username,
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,
      memo_key: data.publicKeys.memo,
      json_metadata: "",
      extensions: [],
    },
  ];

  try {
    await client.broadcast.sendOperations([op], key);
  } catch (error) {
    return {
      error: error,
    };
  }

  await db.collection("accounts").doc(data.username).set({
    accountName: data.username,
    ipAddress: context.rawRequest.ip,
    uid: context.auth.uid,
    timestamp: new Date(),
    voted: false,
    posted: false,
  });

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

      let account = await client.database.getAccounts([config.account]);

      if (account[0].hasOwnProperty("pending_claimed_accounts")) {
        await db
          .collection("public")
          .doc("data")
          .set({ accountTickets: account[0].pending_claimed_accounts });
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
      "|Account|Creation Time|\n|-|-|\n";
    let tag = "steemonboard";
    let json_metadata = JSON.stringify({ tags: [tag] });

    query.forEach((doc) => {
      let account = doc.data();
      let timestamp = new Date(account.timestamp.seconds * 1000);
      body =
        body +
        "|@" +
        account.accountName +
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
          author: config.account,
          body: body,
          json_metadata: json_metadata,
          parent_author: "",
          parent_permlink: tag,
          permlink: permlink,
          title: title,
        },
        key
      );
    } catch (error) {
      console.log(error);
    }
  });
