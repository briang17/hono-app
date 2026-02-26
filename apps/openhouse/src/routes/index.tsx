import { createRouter, createRoute, createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "../layouts/AppLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import DashboardPage from "../pages/DashboardPage";
import CreateOpenHousePage from "../pages/CreateOpenHousePage";
import OpenHouseDetailPage from "../pages/OpenHouseDetailPage";
import VisitorSignInPage from "../pages/VisitorSignInPage";
import CreateOrganizationPage from "../pages/CreateOrganizationPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({
      to: "/open-houses",
    });
  },
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "/_app",
  component: AppLayout,
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "/_public",
  component: PublicLayout,
});

const openHousesIndexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/open-houses",
  component: DashboardPage,
});

const createOpenHouseRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/open-houses/new",
  component: CreateOpenHousePage,
});

const openHouseDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/open-houses/$id",
  component: OpenHouseDetailPage,
});

const visitorSignInRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/sign-in/$openHouseId",
  component: VisitorSignInPage,
});

const createOrganizationRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/create-organization",
  component: CreateOrganizationPage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    appLayoutRoute.addChildren([
      openHousesIndexRoute,
      createOpenHouseRoute,
      openHouseDetailRoute,
      createOrganizationRoute,
    ]),
    publicLayoutRoute.addChildren([visitorSignInRoute]),
  ]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
