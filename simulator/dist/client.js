const backendInternalUrl = process.env.SIMULATOR_BACKEND_INTERNAL_URL ??
    "http://backend:3000";
const simulatorToken = process.env.SIMULATOR_CONTROL_TOKEN;
export async function sendReading(deviceId, reading) {
    if (!simulatorToken) {
        throw new Error("SIMULATOR_CONTROL_TOKEN is not configured");
    }
    const url = `${backendInternalUrl}/internal/simulator/readings`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Simulator-Token": simulatorToken,
        },
        body: JSON.stringify({
            deviceId,
            ...reading,
        }),
    });
    const body = await response.text();
    if (!response.ok) {
        throw new Error(`Reading request failed ` +
            `(${response.status}): ${body}`);
    }
    console.log(`[SIMULATOR] Reading accepted: ${body}`);
}
