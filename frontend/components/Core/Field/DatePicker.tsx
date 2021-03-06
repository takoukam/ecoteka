// !! This component seems to break build pipeline. Fix needed!
import { forwardRef } from "react";
import { es, enGB, fr } from "date-fns/locale";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { InputBaseComponentProps } from "@material-ui/core";

const setDateLocale = (locale: string) => {
  switch (locale) {
    case "fr":
      return fr;
    case "en":
      return enGB;
    case "es":
      return es;
    default:
      return fr;
  }
};

const setLocaleFormat = (locale: string) => {
  switch (locale) {
    case "fr":
      return "dd/MM/yyyy";
    case "en":
      return "yyyy/MM/dd";
    case "es":
      return "dd/MM/yyyy";
    default:
      return "dd/MM/yyyy";
  }
};

export interface DatePickerFieldProps {
  inputProps?: InputBaseComponentProps;
  defaultValue?: string;
  value?: string;
  onChange?(date: Date): void;
}

const DatePickerField = forwardRef<HTMLDivElement, DatePickerFieldProps>(
  (props, ref) => {
    const router = useRouter();
    const { t } = useTranslation(["common"]);
    const { onChange, inputProps, value, ...rest } = props;

    const setDate = (date) => {
      console.log(date);
      return date;
    };

    return (
      <MuiPickersUtilsProvider
        utils={DateFnsUtils}
        locale={setDateLocale(router.locale)}
      >
        <KeyboardDatePicker
          {...rest}
          label={inputProps.label}
          inputProps={inputProps}
          disableToolbar={false}
          variant="dialog"
          inputVariant="filled"
          fullWidth
          value={value}
          ref={ref}
          onChange={onChange}
          format={setLocaleFormat(router.locale)}
          InputLabelProps={{ shrink: true }}
          margin="dense"
          okLabel={t("common.buttons.confirm")}
          cancelLabel={t("common.buttons.cancel")}
        />
      </MuiPickersUtilsProvider>
    );
  }
);

export default DatePickerField;
