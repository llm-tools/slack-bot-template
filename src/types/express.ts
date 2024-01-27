export type AuthenticatedRequest = Request & { loginPayload: TokenData };

export type TokenData = {
    userId: string;
    appDomain: string;
    deviceType: string;
    appId: string;
};
