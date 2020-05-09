const functions = require("firebase-functions");
const admin = require("firebase-admin");
const hive = require("@hiveio/hive-js");
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

exports.createAccount = functions.https.onCall(async (data, context) => {
  let accountName = data.username;
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

  const password = hive.formatter.createSuggestedPassword();

  const publicKeys = hive.auth.generateKeys(accountName, password, [
    "owner",
    "active",
    "posting",
    "memo",
  ]);

  const privateKeys = hive.auth.getPrivateKeys(accountName, password, [
    "owner",
    "active",
    "posting",
    "memo",
  ]);

  const ownerAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[publicKeys.owner, 1]],
  };
  const activeAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[publicKeys.active, 1]],
  };
  const postingAuth = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [[publicKeys.posting, 1]],
  };

  const op = [
    "create_claimed_account",
    {
      creator: config.account,
      new_account_name: accountName,
      owner: ownerAuth,
      active: activeAuth,
      posting: postingAuth,
      memo_key: publicKeys.memo,
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

  await db.collection("accounts").doc(accountName).set({
    accountName: accountName,
    ipAddress: context.rawRequest.ip,
    timestamp: new Date(),
    voted: false,
  });

  return {
    username: accountName,
    password: password,
    privateKeys: privateKeys,
    publicKeys: publicKeys,
  };
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
