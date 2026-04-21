import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '@/app/layouts/protected-layout';
import { PublicLayout } from '@/app/layouts/public-layout';
import { ROUTE_PATHS } from '@/app/router/route-paths';
import { ProfileDeletePage } from '@/pages/profile-delete';
import { ProfileEditPage } from '@/pages/profile-edit';
import { ProfilePasswordPage } from '@/pages/profile-password';
import { ProfilePage } from '@/pages/profile';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';
import { UsersPage } from '@/pages/users';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          element={<SignInPage />}
          path={ROUTE_PATHS.signIn}
        />
        <Route
          element={<SignUpPage />}
          path={ROUTE_PATHS.signUp}
        />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route
          element={<UsersPage />}
          path={ROUTE_PATHS.root}
        />
        <Route
          element={<ProfilePage />}
          path={ROUTE_PATHS.profile}
        />
        <Route
          element={<ProfileEditPage />}
          path={ROUTE_PATHS.profileEdit}
        />
        <Route
          element={<ProfilePasswordPage />}
          path={ROUTE_PATHS.profilePassword}
        />
        <Route
          element={<UsersPage />}
          path={ROUTE_PATHS.users}
        />
        <Route
          element={<ProfileDeletePage />}
          path={ROUTE_PATHS.profileDelete}
        />
      </Route>

      <Route
        element={
          <Navigate
            replace
            to={ROUTE_PATHS.signIn}
          />
        }
        path="*"
      />
    </Routes>
  );
}
