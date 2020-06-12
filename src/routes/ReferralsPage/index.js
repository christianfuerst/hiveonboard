import React from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import hive from "@hiveio/hive-js";
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
}));

const IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const LandingPage = () => {
  const classes = useStyles();
  let { account } = useParams();
  const [referredAccounts, setReferredAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let data = [];
    setLoading(true);

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

              hive.api.getAccounts(accounts, function (err, result) {
                if (result) {
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

                    let refBeneficiary = false;
                    if (json_metadata.hasOwnProperty("beneficiaries")) {
                      json_metadata.beneficiaries.forEach((element) => {
                        if (element.name === account) {
                          refBeneficiary = true;
                        }
                      });
                    }

                    data.push(element);
                    data[index].data = result[index];
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
            }
          });
      }
    });
  }, [setReferredAccounts, account]);

  const renderRefBeneficiary = (rowData) => {
    if (rowData.refBeneficiary === true) {
      return (
        <Tooltip title="Beneficiary enabled">
          <Icon className={classes.iconGreen} fontSize="default">
            check_circle
          </Icon>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Beneficiary disabled">
          <Icon className={classes.iconRed} color="primary" fontSize="default">
            error
          </Icon>
        </Tooltip>
      );
    }
  };

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
                    <Grid item>{renderRefBeneficiary(rowData)}</Grid>
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
                    <Tooltip title="Posting">
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
                    <Tooltip title="Inactive">
                      <Icon color="primary" fontSize="large">
                        child_friendly
                      </Icon>
                    </Tooltip>
                  );
                }
              },
            },
            {
              title: "Resources",
              field: "hp",
              width: 250,
              render: (rowData) => {
                if (rowData.hp >= 10) {
                  return (
                    <Chip
                      className={classes.chipGreen}
                      label={rowData.hp.toFixed(3) + " HP"}
                    />
                  );
                } else if (rowData.hp === 0) {
                  return (
                    <React.Fragment>
                      <Chip
                        color="primary"
                        label={rowData.hp.toFixed(3) + " HP"}
                      />
                      <Button
                        className={classes.button}
                        size="small"
                        color="primary"
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
                        Delegate
                      </Button>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <Chip
                      className={classes.chipYellow}
                      label={rowData.hp.toFixed(3) + " HP"}
                    />
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
