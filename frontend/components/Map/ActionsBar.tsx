import { FC, ReactElement, useState } from "react";
import { AbilityContext } from "@/components/Can";
import { buildAbilityFor } from "@/abilities/genericOrganizationAbility";
import { Box, IconButton, Tooltip, makeStyles } from "@material-ui/core";
import Can from "@/components/Can";
import { Actions, Subjects } from "@/abilities/genericOrganizationAbility";

import LayersIcon from "@material-ui/icons/Layers";
import CloseIcon from "@material-ui/icons/Close";
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from "@material-ui/icons/Info";
import BackupIcon from "@material-ui/icons/Backup";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/providers/AppContext";

const useStyles = makeStyles((theme) => ({
  actionsBar: {
    position: "absolute",
    top: 60,
    right: 8,
    display: "flex",
    flexDirection: "column",
    height: "auto",
    [theme.breakpoints.up("lg")]: {
      top: 8,
      left: 8,
      right: "unset",
    },
  },
}));

export type MapActionsBarActionType = "info" | "filter" | "layers" | "import";

export interface MapActionBarAction {
  action: MapActionsBarActionType;
  icon: ReactElement;
  do: Actions;
  on: Subjects;
}

export type MapActionBarActions = MapActionBarAction[];

export interface MapActionsBarProps {
  isMenuOpen?: boolean;
  darkBackground?: boolean;
  onClick?(action: MapActionsBarActionType): void;
}

const actions = [
  { action: "start", icon: <InfoIcon />, do: "preview", on: "Trees" },
  { action: "filter", icon: <SearchIcon />, do: "preview", on: "Trees" },
  { action: "layers", icon: <LayersIcon />, do: "preview", on: "Trees" },
  { action: "import", icon: <BackupIcon />, do: "manage", on: "Trees" },
] as MapActionBarActions;

const MapActionsBar: FC<MapActionsBarProps> = ({
  isMenuOpen = false,
  darkBackground = false,
  onClick = () => {},
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [activeAction, setActiveAction] = useState<MapActionsBarActionType>(
    "start" as MapActionsBarActionType
  );
  const { organization } = useAppContext();

  const handleOnActionClick = (action: MapActionsBarActionType) => {
    setActiveAction(action);
    onClick(action);
  };

  return (
    <Box className={classes.actionsBar}>
      {actions.map((action) => {
        return (
          <Can key={action.action as string} do={action.do} on={action.on}>
            <Tooltip
              placement="right"
              title={
                t("components.MapActionBar", { returnObjects: true })[
                  action.action
                ]
              }
            >
              <IconButton
                style={{
                  color: darkBackground ? "#fff" : "",
                }}
                color={activeAction === action.action ? "primary" : "default"}
                onClick={() => handleOnActionClick(action.action)}
              >
                {action.icon}
              </IconButton>
            </Tooltip>
          </Can>
        );
      })}
    </Box>
  );
};

export default MapActionsBar;
