import React from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Tooltip from "@material-ui/core/Tooltip";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CallMade from "@material-ui/icons/CallMade";
import Public from "@material-ui/icons/Public";
import Private from "@material-ui/icons/Lock";

import { useSizedIconButtonStyles } from "@/styles/IconButton/sized";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const StyledTooltip = withStyles({
  tooltip: {
    marginTop: "0.2rem",
    backgroundColor: "rgba(0,0,0,0.72)",
    color: "#fff",
  },
})(Tooltip);

const useBasicProfileStyles = makeStyles(({ palette }) => ({
  avatar: {
    borderRadius: 8,
    backgroundColor: "#495869",
  },
  overline: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#8D9CAD",
  },
  name: {
    fontSize: 14,
    fontWeight: 500,
    color: "#495869",
  },
}));

export interface BasicProfileProps {
  ownerEmail: string;
  isPrivate: boolean;
}

const BasicProfile: React.FC<BasicProfileProps> = ({
  ownerEmail,
  isPrivate,
}) => {
  const styles = useBasicProfileStyles();
  const { t } = useTranslation(["common"]);
  return (
    <Grid item container spacing={2}>
      <Grid item>
        <Avatar className={styles.avatar}>
          {isPrivate ? <Private /> : <Public />}
        </Avatar>
      </Grid>
      <Grid item>
        <Typography className={styles.overline}>{t("common.owner")}</Typography>
        <Typography className={styles.name}>{ownerEmail}</Typography>
      </Grid>
    </Grid>
  );
};

const useCardHeaderStyles = makeStyles(() => ({
  root: { paddingBottom: 0 },
  title: {
    fontSize: "1.25rem",
    color: "#122740",
  },
  subheader: {
    fontSize: "0.875rem",
    color: "#495869",
  },
}));

export interface CardHeaderProps {
  slug: string;
  name: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ slug, name }) => {
  const styles = useCardHeaderStyles();
  const iconBtnStyles = useSizedIconButtonStyles({ padding: 8, childSize: 20 });
  const { t } = useTranslation(["common"]);
  const router = useRouter();

  return (
    <Grid
      item
      xs
      container
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      onClick={() => router.push(`/${slug}`)}
    >
      <Grid item>
        <Box pl={1}>
          <Typography className={styles.title}>
            <b>@{slug}</b>
          </Typography>
          <Typography className={styles.subheader}>{name}</Typography>
        </Box>
      </Grid>
      <Grid item>
        <StyledTooltip title={t("common.seeDetails")}>
          <IconButton
            classes={iconBtnStyles}
            onClick={() => router.push(`/${slug}`)}
          >
            <CallMade />
          </IconButton>
        </StyledTooltip>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(({ palette, spacing }) => ({
  card: {
    border: "2px solid",
    backgroundColor: palette.background.paper,
    padding: spacing(2),
    borderColor: "#E7EDF3",
    borderRadius: 16,
    transition: "0.4s",
    "&:hover": {
      borderColor: "#1d675b",
    },
  },
  thumbnail: {
    overflow: "hidden",
    width: "100%",
  },
}));

export interface ShowcaseCardProps {
  ownerEmail: string;
  slug: string;
  name: string;
  thumbnail?: string;
  isPrivate: boolean;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  ownerEmail,
  slug,
  name,
  thumbnail,
  isPrivate,
}) => {
  const styles = useStyles();
  const router = useRouter();

  return (
    <Box className={styles.card} onClick={() => router.push(`/${slug}`)}>
      <Grid container direction="column" spacing={2}>
        <CardHeader slug={slug} name={name} />
        <Grid item>
          <Box
            minHeight={200}
            bgcolor={"#dfdfdf"}
            borderRadius={8}
            className={styles.thumbnail}
            style={{
              backgroundImage: `url(${thumbnail})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></Box>
        </Grid>
        <BasicProfile ownerEmail={ownerEmail} isPrivate={isPrivate} />
      </Grid>
    </Box>
  );
};

export default ShowcaseCard;
