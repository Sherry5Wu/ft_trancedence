  // -- Helpers for uniform error responses
export function sendError(reply, statusCode, shortName, message, details = []) {
  reply.status(statusCode).send({
    status: statusCode,
    error: shortName,
    message,
    details
  });
}
