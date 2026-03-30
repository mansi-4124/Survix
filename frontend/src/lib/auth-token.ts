import { OpenAPI } from "@/api";
import axios from "axios";

export const setAuthToken = (token?: string | null) => {
  OpenAPI.TOKEN = token ?? undefined;
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};
