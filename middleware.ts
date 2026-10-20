import {NextResponse,type NextRequest} from 'next/server';
export function middleware(request:NextRequest){
 if(request.nextUrl.pathname.startsWith('/api/')&&['POST','PUT','PATCH','DELETE'].includes(request.method)){
  const origin=request.headers.get('origin');
  if(request.headers.get('sec-fetch-site')==='cross-site'||(origin&&origin!==request.nextUrl.origin))return NextResponse.json({error:'Cross-origin request rejected'},{status:403});
  if(['POST','PUT','PATCH'].includes(request.method)&&!request.headers.get('content-type')?.includes('application/json'))return NextResponse.json({error:'JSON required'},{status:415});
  if(Number(request.headers.get('content-length')??0)>131072)return NextResponse.json({error:'Request too large'},{status:413});
 }
 const response=NextResponse.next();response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 if(request.nextUrl.pathname.startsWith('/api/'))response.headers.set('Cache-Control','private, no-store');return response;
}
export const config={matcher:['/api/:path*']};
