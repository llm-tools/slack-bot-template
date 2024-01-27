import crypto from 'node:crypto';

export function slackEncode(value: string, signingSecret: string) {
    return crypto.createHmac('sha256', signingSecret).update(value, 'utf8').digest('hex');
}

export function timingSafeEqual(stringA: string, stringB: string) {
    return crypto.timingSafeEqual(Buffer.from(stringA, 'utf8'), Buffer.from(stringB, 'utf8'));
}
