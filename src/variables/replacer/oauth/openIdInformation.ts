import { OpenIdConfiguration } from './openIdConfiguration';
import { log } from '../../../logger';
import { HttpClient, HttpRequest, RequestLogger, UserSession } from '../../../models';
import { decodeJWT } from '../../../utils';

export interface OpenIdInformation extends UserSession{
  time: number;
  config: OpenIdConfiguration;
  accessToken: string;
  expiresIn: number;
  timeSkew: number;
  refreshToken?: string;
  refreshExpiresIn?: number;
}


export async function requestOpenIdInformation(request: HttpRequest | false, context: {
  config: OpenIdConfiguration,
  httpClient: HttpClient,
  id: string,
  title: string,
  description: string,
  logRequest?: RequestLogger,
}): Promise<OpenIdInformation | false> {
  if (request) {
    const time = new Date().getTime();
    request.throwHttpErrors = true;
    const response = await context.httpClient(request, { showProgressBar: false });
    if (response) {

      if (context.logRequest) {
        context.logRequest(response);
      }
      if (response.statusCode === 200 && response.parsedBody) {
        return toOpenIdInformation(response.parsedBody, time, context);
      }
    }
  }
  return false;
}

export function toOpenIdInformation(jwtToken: unknown, time: number, context: {
  config: OpenIdConfiguration,
  id: string,
  title: string,
  description: string,
}): OpenIdInformation | false {
  if (isAuthToken(jwtToken)) {
    const parsedToken = decodeJWT(jwtToken.access_token);
    log.debug(JSON.stringify(parsedToken, null, 2));
    return {
      id: context.id,
      title: context.title,
      description: context.description,
      time,
      config: context.config,
      accessToken: jwtToken.access_token,
      expiresIn: jwtToken.expires_in,
      refreshToken: jwtToken.refresh_token,
      refreshExpiresIn: jwtToken.refresh_expires_in,
      timeSkew: parsedToken?.iat ? Math.floor(time / 1000) - parsedToken.iat : 0,
    };
  }
  return false;
}


export function isAuthToken(obj: unknown): obj is AuthToken {
  const guard = obj as AuthToken;
  return guard && !!guard.access_token && !!guard.expires_in;
}

interface AuthToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_expires_in?: number;
}
