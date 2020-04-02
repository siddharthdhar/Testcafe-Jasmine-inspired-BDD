import { ClientFunction } from 'testcafe';

export async function getCurrentUrl(): Promise<any> {
    const getLocation = ClientFunction(() => document.location.href);
    const url = getLocation();
    return url;
}