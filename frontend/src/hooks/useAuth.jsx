import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadUser as loadUserThunk, login as loginThunk, logout as logoutAction } from "../redux/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // 🚀 Only load if we have a token but no user object yet
    if (token && !user && !loading && !error) {
      dispatch(loadUserThunk());
    }
  }, [dispatch, token, user, loading, error]);

  const currentUser = useMemo(() => {
    if (!user) return null;
    const data = user.user || user.data || user;
    
    return {
      ...data,
      _id: (data._id || data.id || "").toString(),
      role: (data.role || "").toLowerCase()
    };
  }, [user]);

  return {
    user: currentUser,
    role: currentUser?.role || null,
    id: currentUser?._id || null,
    token,
    isAuthenticated,
    loading: loading || (token && !currentUser && !error),
    error,
    login: (d) => dispatch(loginThunk(d)),
    logout: () => dispatch(logoutAction()),
  };
};