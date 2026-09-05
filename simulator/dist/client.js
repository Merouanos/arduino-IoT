export async function sendReading(config, reading) {
    const url = `${config.backendUrl}/api/devices/${config.deviceId}/readings`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Device-Key": config.deviceKey,
        },
        body: JSON.stringify(reading),
    });
    const body = await response.text();
    if (!response.ok) {
        throw new Error(`Reading request failed ` +
            `(${response.status}): ${body}`);
    }
    console.log(`[SIMULATOR] Reading accepted: ${body}`);
}
