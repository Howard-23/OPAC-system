import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCheckedSession = useAuthStore((state) => state.hasCheckedSession);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const uiVersion = useAuthStore((state) => state.uiVersion);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const setUiVersion = useAuthStore((state) => state.setUiVersion);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return {
    isAuthenticated,
    hasCheckedSession,
    isBootstrapping,
    isLoading,
    user,
    permissions,
    uiVersion,
    error,
    login,
    loginWithGoogle,
    logout,
    clearError,
    restoreSession,
    setUiVersion,
    hasPermission,
  };
};
