import { FC, forwardRef, ReactElement, useEffect } from "react";
import {
  makeStyles,
  Theme,
  Paper,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  PaperProps,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import RichTooltip from "@/components/Feedback/RichTooltip";
import HelpIcon from "@material-ui/icons/Help";

export interface Item {
  title: string;
  href: string;
}

export interface CoreOptionsPanelProps extends PaperProps {
  label?: string | ReactElement;
  items?: Item[];
  endActions?: ReactElement;
  withTooltip?: boolean;
  Tooltip?: JSX.Element;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  title: {
    textTransform: "uppercase",
    fontWeight: 700,
  },
  content: {
    marginTop: theme.spacing(2),
  },
}));

const CoreOptionsPanel = forwardRef<HTMLDivElement, CoreOptionsPanelProps>(
  (
    { label, items = [], endActions, withTooltip = false, Tooltip, children },
    ref
  ) => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleItemClick = (item) => {
      handleClose();

      if (item.href) {
        router.push(item.href);
      }
    };
    return (
      <Paper className={classes.root} ref={ref} elevation={isDesktop ? 1 : 0}>
        <Grid container alignItems="center">
          <Grid item container alignItems="center" xs>
            <Grid item>
              <Typography variant="body2" className={classes.title}>
                {label}
              </Typography>
            </Grid>
            {withTooltip && (
              <Grid item>
                <RichTooltip
                  content={Tooltip}
                  open={open}
                  placement="bottom"
                  onClose={() => setOpen(false)}
                >
                  <IconButton onClick={() => setOpen(!open)}>
                    <HelpIcon />
                  </IconButton>
                </RichTooltip>
              </Grid>
            )}
          </Grid>
          {items.length > 0 && (
            <Grid item>
              <IconButton size="small" onClick={handleOpen}>
                <MoreVert />
              </IconButton>
            </Grid>
          )}

          {endActions && <Grid item>{endActions}</Grid>}
        </Grid>
        <div className={classes.content}>{children}</div>
        {items.length > 0 && (
          <Menu
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {items.map((item) => (
              <MenuItem key={item.title} onClick={() => handleItemClick(item)}>
                {item.title}
              </MenuItem>
            ))}
          </Menu>
        )}
      </Paper>
    );
  }
);

export default CoreOptionsPanel;
