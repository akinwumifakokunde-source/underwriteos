import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { apiSuccess, apiError } from "../../shared/utils.ts";
import { retryFailedDeliveries } from "../../shared/webhookDelivery.ts";

// POST /v1/webhook-retry — scheduled retry of failed webhook deliveries.
// Called by the "Webhook Retry" workflow every minute. Finds deliveries with
// next_retry_at <= now and retries them with exponential backoff (1m, 5m, 30m).
// No user auth — this is a system maintenance task invoked by the scheduler.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const result = await retryFailedDeliveries(base44);
    return apiSuccess(result, 200);
  } catch (e) {
    return apiError("INTERNAL_ERROR", e.message, 500);
  }
}