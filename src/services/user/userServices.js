import axios from "axios";
import { userAPI } from "../baseAPIs";




export const getUserProfile = async () => {
  const res = await userAPI.get("/profile/me");
  return res.data;
};

export const getSecurityInfo = async () => {
  const res = await userAPI.get("/security/me");
  return res.data;
};

export const updateBasicInfo = async (data) => {
  const res = await userAPI.put("/profile/basic", data);
  return res.data;
};

export const changePassword = async (data) => {
  const res = await userAPI.put("/security/password", data);
  return res.data;
};
