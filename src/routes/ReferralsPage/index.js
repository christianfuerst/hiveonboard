import React from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import hive from "@hiveio/hive-js";
import { Client } from "@hiveio/dhive";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Link from "@material-ui/core/Link";
import Chip from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Tooltip from "@material-ui/core/Tooltip";
import BatteryFullIcon from "@material-ui/icons/BatteryFull";
import BatteryAlertIcon from "@material-ui/icons/BatteryAlert";
import Battery90Icon from "@material-ui/icons/Battery90";
import Battery80Icon from "@material-ui/icons/Battery80";
import Battery60Icon from "@material-ui/icons/Battery60";
import Battery50Icon from "@material-ui/icons/Battery50";
import Battery30Icon from "@material-ui/icons/Battery30";
import Battery20Icon from "@material-ui/icons/Battery20";
import MaterialTable from "material-table";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    padding: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
  },
  chipYellow: {
    backgroundColor: "#ffea00",
  },
  chipGreen: {
    backgroundColor: "#4caf50",
    color: "#FFFFFF",
  },
  iconYellow: {
    color: "#ffea00",
  },
  iconGreen: {
    color: "#4caf50",
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  iconRed: {
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  batteryGreen: {
    color: "#4caf50",
  },
  batteryYellow: {
    color: "#ffea00",
  },
  batteryRed: {
    color: theme.palette.primary,
  },
}));

const IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const getRcPercentage = (rcAccount) => {
  const time =
    Math.round(new Date().getTime() / 1e3) -
    rcAccount.rc_manabar.last_update_time;

  const maxMana = parseInt(rcAccount.max_rc);

  const currentMana =
    parseInt(rcAccount.rc_manabar.current_mana) +
    Math.round((maxMana / 432e3) * time);

  const percentage = Math.min((currentMana / maxMana) * 100, 100);

  return percentage;
};

const renderRcStatus = (rowData, classes) => {
  let icon = (
    <BatteryFullIcon fontSize="large" className={classes.batteryGreen} />
  );

  if (rowData.rcPercentage === 100) {
    icon = (
      <BatteryFullIcon fontSize="large" className={classes.batteryGreen} />
    );
  } else if (rowData.rcPercentage < 100 && rowData.rcPercentage >= 90) {
    icon = <Battery90Icon fontSize="large" className={classes.batteryGreen} />;
  } else if (rowData.rcPercentage < 90 && rowData.rcPercentage >= 80) {
    icon = <Battery80Icon fontSize="large" className={classes.batteryGreen} />;
  } else if (rowData.rcPercentage < 80 && rowData.rcPercentage >= 60) {
    icon = <Battery60Icon fontSize="large" className={classes.batteryYellow} />;
  } else if (rowData.rcPercentage < 60 && rowData.rcPercentage >= 50) {
    icon = <Battery50Icon fontSize="large" className={classes.batteryYellow} />;
  } else if (rowData.rcPercentage < 50 && rowData.rcPercentage >= 30) {
    icon = <Battery30Icon fontSize="large" className={classes.batteryRed} />;
  } else if (rowData.rcPercentage < 30 && rowData.rcPercentage >= 20) {
    icon = <Battery20Icon fontSize="large" className={classes.batteryRed} />;
  } else {
    icon = <BatteryAlertIcon fontSize="large" className={classes.batteryRed} />;
  }
  return (
    <Tooltip title={rowData.rcPercentage.toFixed(0) + "% RC"}>{icon}</Tooltip>
  );
};

const renderRefBeneficiary = (rowData, classes) => {
  if (rowData.refBeneficiary > 0) {
    return (
      <Tooltip title={rowData.refBeneficiary / 100 + "% Beneficiary Rewards"}>
        <Icon className={classes.iconGreen} fontSize="default">
          check_circle
        </Icon>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title=" Beneficiary Rewards Disabled">
        <Icon className={classes.iconRed} color="primary" fontSize="default">
          error
        </Icon>
      </Tooltip>
    );
  }
};

const LandingPage = () => {
  const classes = useStyles();
  const { account } = useParams();
  const [referredAccounts, setReferredAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let data = [];
    setLoading(true);

    const client = new Client([
      "https://api.hive.blog",
      "https://api.hivekings.com",
      "https://anyx.io",
      "https://api.openhive.network",
    ]);

    hive.api.getDynamicGlobalProperties((err, dynamicGlobalProperties) => {
      if (dynamicGlobalProperties) {
        axios
          .get(
            "https://hiveonboard.com/api/referrer/" + account + "?limit=1000"
          )
          .then(function (response) {
            if (response.data.items.length > 0) {
              let accounts = [];

              response.data.items.forEach((element) => {
                accounts.push(element.account);
              });

              hive.api.getAccounts(accounts, async function (err, result) {
                if (result) {
                  const rcAccounts = await client
                    .call("rc_api", "find_rc_accounts", {
                      accounts: accounts,
                    })
                    .then(
                      function (result) {
                        return result.rc_accounts;
                      },
                      function (error) {
                        console.error(error);
                      }
                    );

                  response.data.items.forEach((element, index) => {
                    let posting_json_metadata = {};
                    if (IsJsonString(result[index].posting_json_metadata)) {
                      posting_json_metadata = JSON.parse(
                        result[index].posting_json_metadata
                      );
                    }

                    let json_metadata = {};
                    if (IsJsonString(result[index].json_metadata)) {
                      json_metadata = JSON.parse(result[index].json_metadata);
                    }

                    let refBeneficiary = 0;
                    if (json_metadata.hasOwnProperty("beneficiaries")) {
                      json_metadata.beneficiaries.forEach((element) => {
                        if (element.name === account) {
                          refBeneficiary = element.weight;
                        }
                      });
                    }

                    data.push(element);
                    data[index].data = result[index];
                    data[index].rcPercentage = getRcPercentage(
                      rcAccounts[index]
                    );
                    data[index].refBeneficiary = refBeneficiary;
                    data[index].dateTime = new Date(data[index].timestamp);
                    data[index].posting_json_metadata = posting_json_metadata;
                    data[index].json_metadata = json_metadata;
                    data[index].hp = hive.formatter.vestToHive(
                      parseInt(data[index].data.vesting_shares) +
                        parseInt(data[index].data.received_vesting_shares),
                      dynamicGlobalProperties.total_vesting_shares,
                      dynamicGlobalProperties.total_vesting_fund_steem
                    );
                    data[index].hpDelegated = hive.formatter.vestToHive(
                      parseInt(data[index].data.received_vesting_shares),
                      dynamicGlobalProperties.total_vesting_shares,
                      dynamicGlobalProperties.total_vesting_fund_steem
                    );
                    data[index].hpSelf =
                      data[index].hp - data[index].hpDelegated;
                    data[index].sugDelegation =
                      (5 *
                        parseFloat(
                          dynamicGlobalProperties.total_vesting_shares
                        )) /
                        parseFloat(
                          dynamicGlobalProperties.total_vesting_fund_steem
                        ) -
                      parseFloat(data[index].data.vesting_shares);
                  });

                  setReferredAccounts(data);
                  setLoading(false);
                }
              });
            } else {
              setLoading(false);
            }
          });
      }
    });
  }, [setReferredAccounts, account]);

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <MaterialTable
          isLoading={loading}
          columns={[
            {
              title: "Account",
              field: "account",
              render: (rowData) => {
                let imageUrl = "";
                if (rowData.posting_json_metadata.hasOwnProperty("profile")) {
                  imageUrl =
                    rowData.posting_json_metadata.profile.profile_image;
                }

                return (
                  <Link
                    target="_blank"
                    href={"https://peakd.com/@" + rowData.account}
                  >
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar alt={rowData.account} src={imageUrl} />
                      </ListItemAvatar>
                      <ListItemText
                        id={rowData.account}
                        primary={rowData.account}
                      />
                    </ListItem>
                  </Link>
                );
              },
            },
            {
              title: "Created",
              field: "dateTime",
              defaultSort: "desc",
              render: (rowData) => {
                return (
                  <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                  >
                    <Grid item>
                      {new Intl.DateTimeFormat("en").format(rowData.dateTime)}
                    </Grid>
                    <Grid item>{renderRefBeneficiary(rowData, classes)}</Grid>
                  </Grid>
                );
              },
            },
            {
              title: "Activity",
              field: "data.post_count",
              render: (rowData) => {
                if (rowData.data.post_count > 0) {
                  return (
                    <Tooltip
                      title={"Created " + rowData.data.post_count + " Post(s)"}
                    >
                      <Icon className={classes.iconGreen} fontSize="large">
                        post_add
                      </Icon>
                    </Tooltip>
                  );
                } else if (
                  rowData.posting_json_metadata.hasOwnProperty("profile")
                ) {
                  return (
                    <Tooltip title="Created Profile">
                      <Icon className={classes.iconYellow} fontSize="large">
                        account_circle
                      </Icon>
                    </Tooltip>
                  );
                } else {
                  return (
                    <Tooltip title="No Activity Yet">
                      <Icon color="primary" fontSize="large">
                        child_care
                      </Icon>
                    </Tooltip>
                  );
                }
              },
            },
            {
              title: "Resources",
              field: "hp",
              width: 300,
              render: (rowData) => {
                if (rowData.hp >= 5) {
                  return (
                    <Grid
                      container
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                    >
                      <Grid item>
                        <Tooltip
                          title={
                            rowData.hpSelf.toFixed(3) +
                            " HP (" +
                            rowData.hpDelegated.toFixed(3) +
                            " HP Delegation)"
                          }
                        >
                          <Chip
                            className={classes.chipGreen}
                            label={rowData.hp.toFixed(3) + " HP"}
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item>{renderRcStatus(rowData, classes)}</Grid>
                    </Grid>
                  );
                } else if (rowData.hp === 0) {
                  return (
                    <Grid
                      container
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                    >
                      <Grid item>
                        <Tooltip
                          title={
                            rowData.hpSelf.toFixed(3) +
                            " HP (" +
                            rowData.hpDelegated.toFixed(3) +
                            " HP Delegation)"
                          }
                        >
                          <Chip
                            color="primary"
                            label={rowData.hp.toFixed(3) + " HP"}
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item>{renderRcStatus(rowData, classes)}</Grid>
                      {rowData.rcPercentage < 80 && (
                        <Grid item>
                          <Button
                            className={classes.button}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            onClick={() => {
                              let url =
                                "https://hivesigner.com/sign/delegateVestingShares?delegator=__signer&delegatee=" +
                                rowData.account +
                                "&vesting_shares=" +
                                rowData.sugDelegation.toFixed(3) +
                                "%20VESTS";
                              window.open(url, "_blank");
                            }}
                          >
                            Delegate 5 HP
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  );
                } else {
                  return (
                    <Grid
                      container
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                    >
                      <Grid item>
                        <Tooltip
                          title={
                            rowData.hpSelf.toFixed(3) +
                            " HP (" +
                            rowData.hpDelegated.toFixed(3) +
                            " HP Delegation)"
                          }
                        >
                          <Chip
                            className={classes.chipYellow}
                            label={rowData.hp.toFixed(3) + " HP"}
                          />
                        </Tooltip>
                      </Grid>
                      <Grid item>{renderRcStatus(rowData, classes)}</Grid>
                    </Grid>
                  );
                }
              },
            },
          ]}
          data={referredAccounts}
          title={"Referred Accounts @" + account}
        />
      </Grid>
    </Grid>
  );
};

export default LandingPage;
