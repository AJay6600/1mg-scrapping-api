import { useMutation } from "@tanstack/react-query";
import apiRequest from "../utils/helpers/apiRequest";

type PayloadType = {
  mediceanName: string;
};

export const useCategory = () => {
  return useMutation({
    mutationFn: (payload: PayloadType) =>
      apiRequest<{ data: string[] | string }>({
        method: "post",
        url: "api/getCategory",
        body: payload,
      }),
  });
};
