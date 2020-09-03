import React from "react";
import _ from "lodash";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import MaterialTable from "material-table";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import { VerifiedUser, ContactSupport } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: 10,
    paddingTop: 10,
  },
}));

const LeaderboardPage = () => {
  const classes = useStyles();
  const [tableData, setTableData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);

    axios
      .get("https://hiveonboard.com/api/leaderboard")
      .then(function (response) {
        let myData = _.chain(response.data)
          .groupBy("referrer")
          .map((value, key) => ({ referrer: key, accounts: value }))
          .value();

        myData.forEach((element, index) => {
          let verifiedTrue = 0;
          let verifiedFalse = 0;
          element.accounts.forEach((account) => {
            if (account.verified) {
              verifiedTrue += 1;
            } else {
              verifiedFalse += 1;
            }
          });
          myData[index].verifiedAccounts = verifiedTrue;
          myData[index].unverifiedAccounts = verifiedFalse;
        });

        setTableData(myData);
        setLoading(false);
      });
  }, []);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MaterialTable
              title="Referral Contest 2020 - Leaderboard"
              isLoading={loading}
              columns={[
                {
                  title: "Referrer",
                  field: "referrer",
                  type: "string",
                },
                {
                  title: "Verified Accounts",
                  field: "verifiedAccounts",
                  type: "numeric",
                  defaultSort: "desc",
                },
                {
                  title: "Unverified Accounts",
                  field: "unverifiedAccounts",
                  type: "numeric",
                },
              ]}
              detailPanel={(rowData) => {
                return (
                  <List>
                    {rowData.accounts.map((element, index) => {
                      return (
                        <ListItem
                          key={index}
                          onClick={() =>
                            window.open(
                              "https://peakd.com/@" + element.account,
                              "_blank"
                            )
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {element.verified ? (
                                <VerifiedUser />
                              ) : (
                                <ContactSupport />
                              )}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={element.account}
                            secondary={
                              element.verified ? "Verified" : "Unverified"
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                );
              }}
              data={tableData}
              options={{ sorting: true }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LeaderboardPage;
