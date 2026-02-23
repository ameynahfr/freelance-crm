import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, register, logout, loadUser } from "../redux/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Select data directly from Redux store
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // Attempt to load the user from the token on first mount (refresh persistence)
  useEffect(() => {
    if (!user && token) {
      dispatch(loadUser());
    }
  }, [dispatch, token, user]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: (userData) => dispatch(login(userData)),
    register: (userData) => dispatch(register(userData)),
    logout: () => dispatch(logout()),
  };
};