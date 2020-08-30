import React from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import CircularProgress from "@material-ui/core/CircularProgress";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import LockIcon from "@material-ui/icons/Lock";
import DoneIcon from "@material-ui/icons/Done";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import GetAppIcon from "@material-ui/icons/GetApp";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

import TicketCard from "../TicketCard";

const useStyles = makeStyles((theme) => ({
  grid: {
    margin: 0,
    padding: theme.spacing(1),
    "min-height": "calc(100vh - 208px)"
  },
  paper: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
  },
  text: {
    margin: theme.spacing(0, 1, 0, 1),
    color: "#FFFFFF",
  },
  alert: {
    margin: theme.spacing(2),
  },
}));

function CircularProgressWithLabel(props) {
  return (
    <Tooltip title={props.title}>
      <Box position="relative" display="inline-flex">
        <CircularProgress
          color="secondary"
          variant="static"
          size={50}
          {...props}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="caption"
            component="div"
            color="textPrimary"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}

const OverviewTable = ({
  accessToken,
  profile,
  referrerData,
  tickets,
  setReload,
}) => {
  const classes = useStyles();
  const [referredAccounts, setReferredAccounts] = React.useState(0);
  const [claimInfo, setClaimInfo] = React.useState({ status: "locked" });
  const [claimTicketLoading, setClaimTicketLoading] = React.useState(false);
  const [claimTicketSuccess, setClaimTicketSuccess] = React.useState(null);
  const [claimTicketError, setClaimTicketError] = React.useState(null);

  React.useEffect(() => {
    if (referrerData && referrerData.hasOwnProperty("items")) {
      setReferredAccounts(referrerData.items.length);
    }
  }, [referrerData]);

  React.useEffect(() => {
    if (tickets && tickets.isVip) {
      setClaimInfo({
        status: "available",
      });
    } else if (referrerData && referrerData.hasOwnProperty("items")) {
      if (referrerData.items.length >= 10) {
        let cooldown = 7 * 24 * 60 * 60 * 1000;

        if (
          referrerData.items.length >= 100 &&
          referrerData.items.length < 1000
        ) {
          cooldown = cooldown / 7;
        }

        if (referrerData.items.length >= 1000) {
          cooldown = cooldown / 7 / 24;
        }

        let lastDate = tickets.lastTicketRequest;
        let minDate = lastDate + cooldown;
        let nowDate = new Date().getTime();

        if (minDate < nowDate) {
          setClaimInfo({
            status: "available",
          });
        } else {
          setClaimInfo({
            status: "cooldown",
            progress: ((nowDate - lastDate) / (minDate - lastDate)) * 100,
          });
        }
      } else {
        setClaimInfo({
          status: "locked",
        });
      }
    }
  }, [referrerData, tickets]);

  return (
    <Grid
      className={classes.grid}
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12}>
        <List>
          <ListItem>
            <ListItemIcon>
              <GroupAddIcon color="secondary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Referred Accounts"
              secondary="Total amount of accounts referred by you"
            />
            <ListItemSecondaryAction>
              <Paper className={classes.paper} elevation={3}>
                <Typography className={classes.text} variant="h5">
                  {referredAccounts}
                </Typography>
              </Paper>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disabled={claimInfo.status === "locked" ? true : false}>
            <ListItemIcon>
              <ConfirmationNumberIcon color="secondary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Claim VIP Ticket"
              secondary="Allow your referred user to bypass the verification process"
            />
            <ListItemSecondaryAction>
              {claimInfo.status === "available" ? (
                <Tooltip title="Claim VIP Ticket">
                  <IconButton
                    color="secondary"
                    edge="end"
                    aria-label="claim-ticket"
                    disabled={claimTicketLoading}
                    onClick={() => {
                      setClaimTicketLoading(true);
                      axios
                        .post("https://hiveonboard.com/api/tickets", {
                          accessToken: accessToken,
                        })
                        .then(function (response) {
                          setClaimTicketSuccess(response.data);
                          setClaimTicketLoading(false);
                          setReload(true);
                        })
                        .catch(function (error) {
                          setClaimTicketError(error);
                          setClaimTicketLoading(false);
                        });
                    }}
                  >
                    <GetAppIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              ) : claimInfo.status === "cooldown" ? (
                <CircularProgressWithLabel
                  value={claimInfo.progress}
                  title="Cooldown"
                />
              ) : (
                <Tooltip title="Refer at least 10 accounts to unlock">
                  <LockIcon color="secondary" fontSize="large" />
                </Tooltip>
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disabled={referredAccounts < 10 ? true : false}>
            <ListItemAvatar>
              <Avatar
                alt="Referrer Badge"
                src="/images/badges-14.png"
                variant="rounded"
              />
            </ListItemAvatar>
            <ListItemText
              primary="Referrer Badge - Refer at least 10 accounts"
              secondary="Perks: Claim VIP Ticket every week"
            />
            <ListItemSecondaryAction>
              {referredAccounts < 10 ? (
                <CircularProgressWithLabel
                  value={(referredAccounts / 10) * 100}
                  title="Progress"
                />
              ) : (
                <Tooltip title="Unlocked">
                  <DoneIcon color="secondary" fontSize="large" />
                </Tooltip>
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disabled={referredAccounts < 100 ? true : false}>
            <ListItemAvatar>
              <Avatar
                alt="Epic Referrer Badge"
                src="/images/badges-15.png"
                variant="rounded"
              />
            </ListItemAvatar>
            <ListItemText
              primary="Epic Referrer Badge - Refer at least 100 accounts"
              secondary="Perks: Claim VIP Ticket cooldown reduced to 1 day"
            />
            <ListItemSecondaryAction>
              {referredAccounts >= 10 && referredAccounts < 100 ? (
                <CircularProgressWithLabel
                  value={(referredAccounts / 100) * 100}
                  title="Progress"
                />
              ) : referredAccounts < 100 ? (
                <Tooltip title="Locked">
                  <LockIcon color="secondary" fontSize="large" />
                </Tooltip>
              ) : (
                <Tooltip title="Unlocked">
                  <DoneIcon color="secondary" fontSize="large" />
                </Tooltip>
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disabled={referredAccounts < 1000 ? true : false}>
            <ListItemAvatar>
              <Avatar
                alt="Legendary Referrer Badge"
                src="/images/badges-16.png"
                variant="rounded"
              />
            </ListItemAvatar>
            <ListItemText
              primary="Legendary Referrer Badge - Refer at least 1000 accounts"
              secondary="Perks: Claim VIP Ticket cooldown reduced to 1 hour"
            />
            <ListItemSecondaryAction>
              {referredAccounts >= 100 && referredAccounts < 1000 ? (
                <CircularProgressWithLabel
                  value={(referredAccounts / 1000) * 100}
                  title="Progress"
                />
              ) : referredAccounts < 1000 ? (
                <Tooltip title="Locked">
                  <LockIcon color="secondary" fontSize="large" />
                </Tooltip>
              ) : (
                <Tooltip title="Unlocked">
                  <DoneIcon color="secondary" fontSize="large" />
                </Tooltip>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Grid>
      {claimTicketError && (
        <Grid item xs={12}>
          <Grid container alignItems="center" justify="center" direction="row">
            <Alert
              className={classes.alert}
              severity="error"
              onClose={() => setClaimTicketError(null)}
            >
              <AlertTitle>VIP Ticket could not be claimed</AlertTitle>
              {claimTicketError.message}
            </Alert>
          </Grid>
        </Grid>
      )}
      <TicketCard
        profile={profile}
        ticket={claimTicketSuccess ? claimTicketSuccess.ticket : ""}
        setShowTicketCard={setClaimTicketSuccess}
        open={claimTicketSuccess ? true : false}
      />
    </Grid>
  );
};

export default OverviewTable;
