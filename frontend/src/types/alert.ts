export interface Alert {
    id: string;
    device_id: string;
    type: string;
    severity: string;
    message: string;
    started_at: string;
    resolved_at: string | null;
}