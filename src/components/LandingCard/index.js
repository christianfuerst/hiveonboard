import React from "react";
import { Link as RouterLink } from "react-router-dom";
import cx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import TextInfoContent from "@mui-treasury/components/content/textInfo";
import { useFourThreeCardMediaStyles } from "@mui-treasury/styles/cardMedia/fourThree";
import { useN04TextInfoContentStyles } from "@mui-treasury/styles/textInfoContent/n04";
import { useOverShadowStyles } from "@mui-treasury/styles/shadow/over";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 343,
    margin: theme.spacing(0, 0.5, 2, 0.5),
    borderRadius: 12,
    padding: 12,
  },
  media: {
    height: 0,
    borderRadius: 6,
  },
}));

const LandingCard = ({ content }) => {
  const styles = useStyles();
  const mediaStyles = useFourThreeCardMediaStyles();
  const textCardContentStyles = useN04TextInfoContentStyles();
  const shadowStyles = useOverShadowStyles({ inactive: true });
  return (
    <Card className={cx(styles.root, shadowStyles.root)}>
      <CardMedia
        className={cx(styles.media, mediaStyles.root)}
        image={content.image}
        component={RouterLink}
        to={content.to}
      />
      <CardContent className={styles.content}>
        <TextInfoContent
          classes={textCardContentStyles}
          overline={content.overline}
          heading={content.heading}
          body={content.text}
        />
      </CardContent>
    </Card>
  );
};

export default LandingCard;
