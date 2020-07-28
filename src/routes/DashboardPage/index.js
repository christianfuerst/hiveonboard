import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

import ProfileCard from "../../components/ProfileCard";
import ReferralsTable from "../../components/ReferralsTable";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(2),
  },
  alert: {
    margin: theme.spacing(2),
  },
  text: {
    fontFamily: "Monospace",
    fontSize: 14,
    margin: theme.spacing(0, 1, 0, 1),
    color: "#FFFFFF",
  },
  paper: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.light,
  },
  appBar: {
    marginTop: theme.spacing(2),
    background: theme.palette.secondary.light,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const DashboardPage = ({ userProfile }) => {
  const classes = useStyles();
  const [tab, setTab] = React.useState(1);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        {userProfile ? (
          <React.Fragment>
            <Grid
              container
              spacing={2}
              direction="row"
              justify="space-between"
              alignItems="flex-start"
            >
              <Grid item>
                <Typography variant="overline">
                  <b>Your Referral Link:</b>
                </Typography>
                <Paper className={classes.paper} elevation={3}>
                  <Typography className={classes.text}>
                    {"https://hiveonboard.com?ref=" + userProfile.account}
                  </Typography>
                </Paper>
                <Typography>
                  Earn 3% of Posting-Rewards from your Referral on supported
                  dApps.
                </Typography>
              </Grid>
              <Grid item>
                <ProfileCard profile={userProfile} />
              </Grid>
            </Grid>
            <AppBar position="static" className={classes.appBar}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="dashboard-content"
              >
                <Tab label="Overview" {...a11yProps(0)} />
                <Tab label="Referred Accounts" {...a11yProps(1)} />
                <Tab label="VIP Tickets" {...a11yProps(2)} />
              </Tabs>
            </AppBar>
            <TabPanel value={tab} index={0}>
              Comming Soon! Stay tuned!
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <ReferralsTable profile={userProfile} />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              Comming Soon! Stay tuned!
            </TabPanel>
          </React.Fragment>
        ) : (
          <Alert className={classes.alert} severity="error">
            <AlertTitle>Not Authorized</AlertTitle>
            You have to login into your HIVE Account in order to access the
            Dashboard.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardPage;
