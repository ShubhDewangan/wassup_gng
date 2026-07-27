import React, { useEffect } from "react";
import { apiFetch } from "../../lib/fetcher";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
    const navigate = useNavigate();
  useEffect(() => {
    const logout = async () => {
      try {
        await apiFetch("/api/auth/logout", {
            method: 'POST',
        });
        navigate('/auth')
      } catch (error) {
        console.log(error);
      }
    };
    logout();
  }, []);

  return <div>logging out...</div>;
};

export default LogoutPage;
