import React, { FC, Fragment, useRef, useState, useEffect } from "react";
import { IOrganization } from "@/index.d";
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Toolbar,
} from "@material-ui/core";
import {
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@material-ui/icons";
import { useRouter } from "next/router";

import { useAppLayout } from "@/components/AppLayout/Base";
import ETKFormOrganization, {
  ETKFormOrganizationActions,
} from "@/components/Organization/Form/Form";
import ETKFormWorkingArea, {
  ETKFormWorkingAreaActions,
} from "@/components/Organization/WorkingArea/Form";
import TeamsTable from "@/components/Organization/Teams/TeamsTable";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/providers/AppContext";
import useAPI from "@/lib/useApi";

interface TeamsProps {
  organization: IOrganization;
  value: string | string[];
  index: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  toolbar: {
    flexDirection: "row",
    padding: 0,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const actionOptions = [
  {
    label: "Archive",
    format: "archive",
  },
  {
    label: "Delete",
    format: "delete",
  },
];

const Teams: FC<TeamsProps> = (props) => {
  const classes = useStyles();
  const { dialog } = useAppLayout();
  const formEditRef = useRef<ETKFormOrganizationActions>();
  const formAreaRef = useRef<ETKFormWorkingAreaActions>();
  const { t } = useTranslation(["components", "common"]);
  const router = useRouter();
  const { api } = useAPI();
  const { apiETK } = api;
  const [data, setData] = useState([]);

  const getData = async (organizationId: number) => {
    try {
      const response = await apiETK.get(
        `/organization/${organizationId}/teams`
      );
      const { data, status } = response;
      if (status === 200) {
        setData(data);
      }
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    getData(props.organization.id);
  }, [props.organization]);

  const anchorRef = useRef(null);
  const [disableActions, setDisableActions] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);

  useEffect(() => {
    setDisableActions(Boolean(selectedTeams.length == 0));
  }, [selectedTeams]);

  const onSelected = (team_ids) => {
    setSelectedTeams(team_ids);
  };

  const handleClick = () => {
    console.info(
      `Export format selected ${actionOptions[selectedAction].format}`
    );
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedAction(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function openForm(organization?) {
    const isNew = !Boolean(organization);
    const dialogActions = [
      {
        label: t("common:buttons.cancel"),
      },
      {
        label: t("common:buttons.send"),
        variant: "contained",
        color: "secondary",
        noClose: true,
        onClick: () => addItem(isNew),
      },
    ];

    dialog.current.open({
      title: t(`components:Team.dialogTitle${isNew ? "Create" : "Edit"}`),
      content: (
        <ETKFormOrganization
          ref={formEditRef}
          organization={
            organization || {
              parent_id: props.organization.id,
            }
          }
        />
      ),
      actions: dialogActions,
    });
  }

  const addItem = async (isNew) => {
    const response = await formEditRef.current.submit();

    if (response.ok) {
      dialog.current.close();
      const newOrganization = await response.json();
      isNew
        ? setData([...data, newOrganization])
        : setData(
            data.map((team, i) =>
              team.id === newOrganization.id ? newOrganization : team
            )
          );
    }
  };

  function openArea(organization) {
    const dialogActions = [
      {
        label: t("common:buttons.cancel"),
      },
      {
        label: t("common:buttons.send"),
        variant: "contained",
        color: "secondary",
        noClose: true,
        onClick: editWorkingArea,
      },
    ];

    dialog.current.open({
      title: t("components:Organization.WorkingArea.dialogTitle"),
      content: (
        <ETKFormWorkingArea ref={formAreaRef} organization={organization} />
      ),
      actions: dialogActions,
    });
  }

  const editWorkingArea = async () => {
    const isOk = await formAreaRef.current.submit();

    if (isOk) {
      await getData(props.organization.id);
      dialog.current.close();
    }
  };

  const openTeamPage = (id) => {
    router.push(`/organization/${id}`);
  };

  return (
    <Fragment>
      <Toolbar className={classes.toolbar}>
        <Box className={classes.root} />
        <ButtonGroup
          variant="contained"
          disabled={disableActions}
          size="small"
          color="secondary"
          ref={anchorRef}
          aria-label="split button"
        >
          <Button size="small" color="secondary" onClick={handleClick}>
            {actionOptions[selectedAction].label}
          </Button>
          <Button
            size="small"
            color="secondary"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select export format"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          modifiers={{
            flip: {
              enabled: true,
            },
            preventOverflow: {
              enabled: true,
              boundariesElement: "window",
            },
          }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {actionOptions.map((option, index) => (
                      <MenuItem
                        key={option.label}
                        selected={index === selectedAction}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        <Button
          variant="contained"
          size="small"
          color="primary"
          className={classes.button}
          startIcon={<AddIcon />}
          onClick={() => {
            openForm();
          }}
        >
          {t("Teams.buttonAdd")}
        </Button>
      </Toolbar>
      <TeamsTable
        rows={data}
        openArea={openArea}
        openTeamPage={openTeamPage}
        openForm={openForm}
        onSelected={onSelected}
      />
    </Fragment>
  );
};

export default Teams;
