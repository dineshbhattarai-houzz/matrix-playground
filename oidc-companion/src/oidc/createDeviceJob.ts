import { createDevice } from "../matrix/client.js";
import { getAdminTokensProvider } from "./adminToken.js";

const adminTokensProvider = getAdminTokensProvider();

export function enqueueCreateDevice(userId: string, deviceId: string) {
    // for a new user, createDevice might fail since the user doesn't yet exist in matrix
    // we need to enqueue device creation so that it can succeed
    // fixme: maybe create a new endpoint for creating a device that gets called by the user after
    // first call.
    return retryWithBackoff(async () => {
        const adminTokens = await adminTokensProvider.get();
        return createDevice(adminTokens.access_token, userId, deviceId)
    }, 30)
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 5, backoffInMs = 100): Promise<T> {
    let x = 0
    while (true) {
        try {
            return await fn()
        } catch (ex) {
            if (x == retries) {
                throw ex
            }

            // exponential back-off
            let msToSleep = Math.pow(2, x) * backoffInMs

            // add some extra random ms to make sure we're not
            // retrying on exactly the same interval
            let rndSleep = Math.random() * 100

            await delay(msToSleep + rndSleep)
            x += 1
        }
    }
}

export function delay(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms)
    })
}