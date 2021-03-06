import { FC, useEffect, useRef, useState } from "react";
import {
  makeStyles,
  Theme,
  Grid,
  Button,
  List,
  ListItem,
  useMediaQuery,
} from "@material-ui/core";
import { Block as BlockIcon, Add as AddIcon } from "@material-ui/icons";
import CoreOptionsPanel from "../Core/OptionsPanel";
import { useAppContext } from "@/providers/AppContext";
import useApi from "@/lib/useApi";
import { useAppLayout } from "../AppLayout/Base";
import { useTranslation } from "react-i18next";
import AddMembers, {
  AddMembersActions,
} from "@/components/Organization/Members/AddMembers";
import Can from "@/components/Can";
import { useThemeContext } from "@/lib/hooks/useThemeSwitcher";

export interface OrganizationMembersProps {}

const useStyles = makeStyles((theme: Theme) => ({
  role: {
    textAlign: "right",
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const OrganizationMembers: FC<OrganizationMembersProps> = ({}) => {
  const classes = useStyles();
  const { dialog } = useAppLayout();
  const { t } = useTranslation(["components", "common"]);
  const { organization, user } = useAppContext();
  const { apiETK } = useApi().api;
  const [members, setMembers] = useState([]);
  const formAddMembersRef = useRef<AddMembersActions>();
  const { theme } = useThemeContext();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  const fetchMembers = async (organizationId: number) => {
    try {
      const { data, status } = await apiETK.get(
        `/organization/${organizationId}/members`
      );
      if (status === 200) {
        setMembers(data);
      }
    } catch (e) {}
  };

  const closeAddMembersDialog = (refetchOrganizationData: boolean) => {
    if (refetchOrganizationData) {
      fetchMembers(organization.id);
    }

    dialog.current.close();
  };

  function addMember() {
    dialog.current.open({
      title: t("components.Organization.Members.dialog.title"),
      content: (
        <AddMembers
          ref={formAddMembersRef}
          organizationId={organization.id}
          closeAddMembersDialog={closeAddMembersDialog}
        />
      ),
      dialogProps: {
        maxWidth: "sm",
        fullWidth: true,
        fullScreen: matches,
        disableBackdropClick: true,
      },
    });
  }

  useEffect(() => {
    if (organization) {
      fetchMembers(organization?.id);
    }
  }, [organization]);

  return (
    <CoreOptionsPanel
      label={t("components.Organization.Members.title")}
      items={[
        { title: "Gestion des membres", href: `/${organization.slug}/members` },
      ]}
    >
      <List>
        {members.length > 0 &&
          members.map((m) => (
            <ListItem divider button key={`members-${m.id}`}>
              <Grid container>
                <Grid item xs={8}>
                  {user.id == m.id ? t("common.currentUserRole") : m.full_name}
                </Grid>
                <Grid item xs={4} className={classes.role}>
                  {t(`components.Organization.Members.Table.roles.${m.role}`)}
                </Grid>
              </Grid>
            </ListItem>
          ))}
        <Can do="create" on="Members">
          <ListItem>
            <Button
              variant="contained"
              size="small"
              color="primary"
              fullWidth
              className={classes.button}
              startIcon={<AddIcon />}
              onClick={addMember}
            >
              {t("components.Organization.Members.addMembers")}
            </Button>
          </ListItem>
        </Can>
      </List>
    </CoreOptionsPanel>
  );
};

export default OrganizationMembers;
