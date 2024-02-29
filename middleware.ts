import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Routes that can be accessed while signed out
  // publicRoutes: ['/anyone-can-visit-this-route'],
  publicRoutes: [
    '/',
    '/api/webhook(.*)',
    '/question/:id',
    '/tags',
    '/tags/:id',
    '/profile/:id',
    '/community',
    '/jobs',
  ],
  // Routes that can always be accessed, and have
  // no authentication information

  ignoredRoutes: ['/api/webhook', '/api/chatgpt'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
