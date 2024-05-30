import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import {v4 as uuidv4} from 'uuid';

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const uuid = uuidv4();
  const source = 'MW';
  console.log(`${uuid} [${source}] was called!`);

  event.waitUntil(getParametersWithTryCatch(uuid, source));

  return NextResponse.next(); // Pass control to the next Middleware or route handler
}

async function getParametersWithTryCatch(uuid: string, source: string) {
  let ssmClient: SSMClient;

  try {
    ssmClient = new SSMClient({ region: 'eu-central-1' });

    // This should NOT resolve to browser config since we're running on the server side
    console.log(`${uuid} [${source}] Resolved config in client: ${ssmClient.config.runtime}`)
  }
  catch(error) {
    console.log(`${uuid} [${source}] Could not create SSMClient. ${JSON.stringify(error)}`);
    return;
  }

  try {
    const credentials = await ssmClient.config.credentials();
    console.log(`${uuid} [${source}] Config credentials. Credentials: ${JSON.stringify(credentials)}`);
  }
  catch(error) {
    console.log(`${uuid} [${source}] Could not log config credentials. ${JSON.stringify(error)}`);
    return;
  }

  try {
    const cmd = new GetParametersByPathCommand({
      Path: '/INT/common',
      Recursive: true,
      WithDecryption: true,
    });
  
    const resp = await ssmClient.send(cmd);
    console.log(`${uuid} [${source}] Got response. Response: ${JSON.stringify(resp)}`);
  }
  catch(error) {
    console.log(`${uuid} [${source}] Could not get parameters by path. ${JSON.stringify(error)}`)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
