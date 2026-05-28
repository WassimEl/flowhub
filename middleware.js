// Vercel Edge Middleware — Admin Route Protection
// This runs at the edge before the request reaches your app

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};

export default function middleware(request) {
  const url = new URL(request.url);

  // Check for admin password in query param or header
  // In production, you'd use a more secure method (JWT, session cookies, etc.)
  const adminToken = request.headers.get('x-admin-token') || url.searchParams.get('admin_token');

  // The admin password is '1980' — this is a simple protection layer
  // For production, consider using Vercel's environment variables
  const validToken = '1980';

  if (adminToken !== validToken) {
    return new Response(
      JSON.stringify({ 
        error: 'Unauthorized', 
        message: 'Admin access required. Provide valid admin token.' 
      }), 
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  return new Response(null, { status: 200 });
}
