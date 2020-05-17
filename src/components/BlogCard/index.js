import React from "react";
import cx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import TextInfoContent from "@mui-treasury/components/content/textInfo";
import { useBlogTextInfoContentStyles } from "@mui-treasury/styles/textInfoContent/blog";
import { useOverShadowStyles } from "@mui-treasury/styles/shadow/over";

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    margin: "auto",
    marginBottom: spacing(4),
    borderRadius: spacing(2),
    transition: "0.3s",
    boxShadow: "0px 14px 80px rgba(34, 35, 58, 0.2)",
    position: "relative",
    maxWidth: 500,
    marginLeft: "auto",
    overflow: "initial",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: spacing(2),
  },
  media: {
    width: "46%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: spacing(-3),
    height: 0,
    paddingBottom: "48%",
    borderRadius: spacing(2),
    backgroundColor: "#fff",
    position: "relative",

    "&:after": {
      content: '" "',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: spacing(2),
      opacity: 0.5,
    },
  },
  content: {
    padding: 24,
  },
  cta: {
    marginTop: 24,
    textTransform: "initial",
  },
  button: {
    margin: spacing(2),
  },
}));

const AppCard = ({ app, analytics }) => {
  const styles = useStyles();
  const {
    button: buttonStyles,
    ...contentStyles
  } = useBlogTextInfoContentStyles();
  const shadowStyles = useOverShadowStyles();
  return (
    <Card className={cx(styles.root, shadowStyles.root)}>
      <CardMedia className={styles.media} image={`/dapps/${app.icon}`} />
      <CardContent>
        <TextInfoContent
          classes={contentStyles}
          overline={app.subtitle}
          heading={app.name}
          body={app.text}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => analytics.logEvent("open_dapp", {
            dapp: app.name,
          })}
          target="_blank"
          href={app.url}
        >
          Visit {app.name}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppCard;
