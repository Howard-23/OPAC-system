import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

import { RequirePermission } from './components/auth/RequirePermission';
import { CatalogForm } from './components/catalog/CatalogForm';
import { PatronForm } from './components/patrons/PatronForm';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/auth/LoginPage';
import { SetupPage } from './pages/setup/SetupPage';
import { usePatronStore } from './stores/patronStore';

const V1Layout = React.lazy(() => import('./layouts/v1/V1Layout'));
const V2Layout = React.lazy(() => import('./layouts/v2/V2Layout'));
const CatalogDashboardV1 = React.lazy(() => import('./features/catalog/v1/CatalogDashboardPage'));
const CatalogDashboardV2 = React.lazy(() => import('./features/catalog/v2/CatalogDashboardPage'));
const PatronDirectoryV1 = React.lazy(() => import('./features/patrons/v1/PatronDirectoryPage'));
const PatronDirectoryV2 = React.lazy(() => import('./features/patrons/v2/PatronDirectoryPage'));

const RouteFallback = ({ label }: { label: string }) => (
  <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-slate-200 bg-white/80 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
    {label}
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <RouteFallback label="Restoring Session" />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const VersionedLayout = ({ children }: { children: React.ReactNode }) => {
  const { uiVersion } = useAuth();
  const LayoutComponent = uiVersion === 'v2' ? V2Layout : V1Layout;

  return (
    <React.Suspense fallback={<RouteFallback label="Loading Shell" />}>
      <LayoutComponent>{children}</LayoutComponent>
    </React.Suspense>
  );
};

const CatalogDashboardRoute = () => {
  const { uiVersion } = useAuth();
  const Feature = uiVersion === 'v2' ? CatalogDashboardV2 : CatalogDashboardV1;

  return (
    <React.Suspense fallback={<RouteFallback label="Loading Catalog" />}>
      <Feature />
    </React.Suspense>
  );
};

const PatronDirectoryRoute = () => {
  const { uiVersion } = useAuth();
  const Feature = uiVersion === 'v2' ? PatronDirectoryV2 : PatronDirectoryV1;

  return (
    <React.Suspense fallback={<RouteFallback label="Loading Patrons" />}>
      <Feature />
    </React.Suspense>
  );
};

const AccessDeniedPage = () => (
  <div className="min-h-full rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,#fff8e7_0%,#fffdf8_100%)] px-6 py-8 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-700">RBAC</p>
    <h1 className="mt-3 font-['Trebuchet_MS','Segoe_UI',sans-serif] text-3xl font-bold tracking-tight text-slate-900">
      Permission denied
    </h1>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
      Current role does not include the permission required for this route. Switch account or assign the missing permission in Phase 11 RBAC tables.
    </p>
  </div>
);

const PatronEditWrapper = () => {
  const { idno } = useParams();
  const patrons = usePatronStore((state) => state.patrons);
  const patron = patrons.find((item) => item.idno === idno);

  if (!patron) {
    return <RouteFallback label="Patron Not Loaded" />;
  }

  return <PatronForm initialData={patron} />;
};

const SetupRoute = () => {
  const navigate = useNavigate();

  return <SetupPage onComplete={() => navigate('/login', { replace: true })} />;
};

const AppRoutes = () => {
  const { restoreSession } = useAuth();

  React.useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/setup" element={<SetupRoute />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RequirePermission permission="catalog:read" fallback={<Navigate to="/unauthorized" replace />}>
              <VersionedLayout>
                <CatalogDashboardRoute />
              </VersionedLayout>
            </RequirePermission>
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalog/new"
        element={
          <ProtectedRoute>
            <RequirePermission permission="catalog:write" fallback={<Navigate to="/unauthorized" replace />}>
              <VersionedLayout>
                <CatalogForm />
              </VersionedLayout>
            </RequirePermission>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patrons"
        element={
          <ProtectedRoute>
            <RequirePermission permission="patrons:read" fallback={<Navigate to="/unauthorized" replace />}>
              <VersionedLayout>
                <PatronDirectoryRoute />
              </VersionedLayout>
            </RequirePermission>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patrons/new"
        element={
          <ProtectedRoute>
            <RequirePermission permission="patrons:write" fallback={<Navigate to="/unauthorized" replace />}>
              <VersionedLayout>
                <PatronForm />
              </VersionedLayout>
            </RequirePermission>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patrons/edit/:idno"
        element={
          <ProtectedRoute>
            <RequirePermission permission="patrons:write" fallback={<Navigate to="/unauthorized" replace />}>
              <VersionedLayout>
                <PatronEditWrapper />
              </VersionedLayout>
            </RequirePermission>
          </ProtectedRoute>
        }
      />
      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <VersionedLayout>
              <AccessDeniedPage />
            </VersionedLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
