// src/api/admin.js
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const useAdminApi = () => {
  const { token } = useAuth();

  const getUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  };

  const promoteUser = async (uid) => {
    await axios.post("http://localhost:5000/api/admin/promote", { uid }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  const updateUser = async (uid, data) => {
    await axios.put(`http://localhost:5000/api/admin/user/${uid}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  const deleteUser = async (uid) => {
    await axios.delete(`http://localhost:5000/api/admin/user/${uid}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  return { getUsers, promoteUser, updateUser, deleteUser };
};
