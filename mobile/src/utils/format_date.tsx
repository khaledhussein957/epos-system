import { format } from "date-fns";

export const formatDate = (value?: Date | string | null) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return format(date, "MMM d, yyyy 'at' h:mm a");
};
