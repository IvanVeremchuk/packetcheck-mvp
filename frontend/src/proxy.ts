import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/docs(.*)",
  "/legal(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook/stripe",
  "/api/stripe/webhook",
]);

const proxy = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export default proxy;
export { proxy };

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
