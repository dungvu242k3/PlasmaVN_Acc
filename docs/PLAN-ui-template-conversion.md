# Plan: UI Template Conversion

This plan details the steps to strip away mandatory authentication and Firebase logic, turning the project into a pure UI template that defaults to an Administrative role while preserving Supabase configuration for future use.

## Proposed Changes

### [Authentication] Bypass Login
- **[MODIFY] [ProtectedRoute.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/components/ProtectedRoute.jsx)**: Disable auth checks and always allow access to children.
- **[MODIFY] [usePermissions.js](file:///c:/Users/dungv/PlasmaVN_Acc/src/hooks/usePermissions.js)**: Default to `admin` role with full permissions, even if no user is logged in.
- **[MODIFY] [App.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/App.jsx)**: Redirect or remove the `/dang-nhap` (Login) route.

### [Integration] Remove Firebase
- **[DELETE] [firebase/](file:///c:/Users/dungv/PlasmaVN_Acc/src/firebase)**: Remove the Firebase configuration directory.
- **[CLEANUP]**: Remove any imports or usage of Firebase across the `src` directory.

### [Integration] Maintain Supabase
- **[KEEP] [supabase/](file:///c:/Users/dungv/PlasmaVN_Acc/src/supabase)**: Keep the Supabase directory and config so the user can easily plug in their own Supabase URL and Key in `.env`.

### [UX] Session Initialization
- **[MODIFY] [main.jsx](file:///c:/Users/dungv/PlasmaVN_Acc/src/main.jsx)**: Optionally inject default session data (role: admin) into `localStorage` if it's missing, to ensure UI elements (Header, Sidebar) render with full features enabled.

## Implementation Steps

1.  **Auth Bypass**: Modify `ProtectedRoute` and `usePermissions` to grant unrestricted access.
2.  **Firebase Purge**: Delete the `src/firebase` folder and search for/remove any dangling references.
3.  **UI Cleanup**: Ensure the Login page is no longer reachable or necessary.
4.  **Graceful Defaults**: Ensure all components that check for `isAuthenticated` or `userRole` default to a fully-featured "Admin" state.

## Verification Plan

### Manual Verification
- **Browser Check**: Open the app and verify it lands directly on the Home/Dashboard without redirecting to `/dang-nhap`.
- **Feature Check**: Navigate through various pages (Marketing, R&D, Admin Tools) to ensure all UI elements are visible as an Admin.
- **Supabase Check**: Verify that `src/supabase/config.js` still exists and reads from environment variables.
