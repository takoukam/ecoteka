import React, { useState, forwardRef, useImperativeHandle } from "react";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  Paper,
} from "@material-ui/core";

import Draggable from "react-draggable";

export type ETKDialogActions = {
  open: (openProps: ETKDialogProps) => void;
  close: () => void;
};

export interface ETKDialogAction {
  label: string;
  noClose?: boolean;
  onClick?: () => void;
}

export interface ETKDialogPropsDialogProps {
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

export interface ETKDialogProps {
  title?: string;
  content?: string | React.ReactNode;
  actions?: ETKDialogAction[];
  dialogProps?: ETKDialogPropsDialogProps;
  isDraggable?: boolean;
}

const defaultProps: ETKDialogProps = {
  title: "",
  content: "",
  actions: [],
};

const DraggablePaperComponent = (props) => {
  return (
    <Draggable handle="#etk-dialog" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
};

const PaperComponent = (props) => {
  return <Paper {...props} />;
};

export const ETKDialog = forwardRef<ETKDialogActions, ETKDialogProps>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [actions, setActions] = useState<ETKDialogAction[]>(props.actions);
    const [title, setTitle] = useState<string>(props.title);
    const [content, setContent] = useState<string | React.ReactNode>(
      props.content
    );
    const [dialogProps, setDialogProps] = useState<ETKDialogPropsDialogProps>(
      props.dialogProps
    );

    const onActionClick = (e, action) => {
      if (action.onClick) {
        action.onClick(e);
      }

      if (!action.noClose) {
        setIsOpen(false);
      }
    };

    const renderActions = actions.map((action, idx) => {
      const { onClick, label, noClose, ...buttonProps } = action;
      return (
        <Button
          {...buttonProps}
          key={idx}
          onClick={(e) => onActionClick(e, action)}
        >
          {label}
        </Button>
      );
    });

    useImperativeHandle(ref, () => ({
      open: (openProps: ETKDialogProps) => {
        setTitle(openProps.title);
        setContent(openProps.content);
        setActions(openProps.actions);
        setDialogProps(openProps.dialogProps);
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
      },
    }));

    return (
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        {...dialogProps}
        aria-labelledby="etk-dialog"
        PaperComponent={
          props.isDraggable ? DraggablePaperComponent : PaperComponent
        }
      >
        <DialogTitle id="etk-dialog">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>{renderActions}</DialogActions>
      </Dialog>
    );
  }
);

ETKDialog.defaultProps = defaultProps;

export default ETKDialog;
