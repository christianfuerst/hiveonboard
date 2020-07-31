import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import FileCopyIcon from "@material-ui/icons/FileCopyOutlined";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import Hidden from "@material-ui/core/Hidden";
import { CopyToClipboard } from "react-copy-to-clipboard";
import QRCode from "react-qr-code";

import hiveonboard_logo_white from "../../assets/hiveonboard_logo_white.png";

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    display: "flex",
    maxWidth: 500,
    backgroundColor: theme.palette.secondary.main,
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flex: "1 0 auto",
  },
  cardCover: {
    height: 160,
  },
  cardText: {
    color: "#FFFFFF",
  },
  codeText: {
    margin: theme.spacing(1, 0, 0, 0),
    color: "#FFFFFF",
  },
  paper: {
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
  },
  text: {
    fontFamily: "Monospace",
    fontSize: 14,
    margin: theme.spacing(0, 1, 0, 1),
    color: "#FFFFFF",
  },
}));

const TicketCard = ({ profile, ticket, open, setShowTicketCard }) => {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={() => setShowTicketCard(false)}
      aria-labelledby="ticket-card-dialog-title"
      aria-describedby="ticket-card-dialog-description"
    >
      <DialogContent>
        <Typography variant="overline">
          <b>VIP Ticket Code:</b>
        </Typography>
        <Paper className={classes.paper} elevation={3}>
          <Typography className={classes.text}>
            {ticket}
            <CopyToClipboard text={ticket}>
              <Tooltip title="Copy to Clipboard" placement="right">
                <IconButton className={classes.text}>
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          </Typography>
        </Paper>
        <Typography variant="overline">
          <b>VIP Ticket Link:</b>
        </Typography>
        <Paper className={classes.paper} elevation={3}>
          <Typography className={classes.text}>
            {"https://hiveonboard.com/create-account?ref=" +
              profile.account +
              "&ticket=" +
              ticket}
            <CopyToClipboard
              text={
                "https://hiveonboard.com/create-account?ref=" +
                profile.account +
                "&ticket=" +
                ticket
              }
            >
              <Tooltip title="Copy to Clipboard" placement="right">
                <IconButton className={classes.text}>
                  <FileCopyIcon />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          </Typography>
        </Paper>
        <Hidden xsDown>
          <Card className={classes.cardRoot}>
            <div className={classes.cardDetails}>
              <CardContent className={classes.cardContent}>
                <Typography
                  component="h5"
                  variant="h5"
                  className={classes.cardText}
                >
                  <img
                    src={hiveonboard_logo_white}
                    width="60px"
                    alt="HIVE Onboard Logo"
                  />{" "}
                  VIP TICKET
                </Typography>
                <Typography variant="subtitle1" className={classes.cardText}>
                  Create your HIVE free account
                </Typography>
                <Typography variant="subtitle2" className={classes.cardText}>
                  Scan the QR Code or head to
                  https://hiveonboard.com/create-account
                </Typography>
                <Typography
                  className={classes.codeText}
                  variant="caption"
                  display="block"
                >
                  Code: <b>{ticket}</b>
                </Typography>
              </CardContent>
            </div>
            <CardMedia
              className={classes.cardCover}
              title="Live from space album cover"
            >
              <QRCode
                value={
                  "https://hiveonboard.com/create-account?ref=" +
                  profile.account +
                  "&ticket=" +
                  ticket
                }
                size={160}
              />
            </CardMedia>
          </Card>
        </Hidden>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setShowTicketCard(null);
          }}
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketCard;
