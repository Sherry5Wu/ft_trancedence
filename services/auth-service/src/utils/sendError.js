  // -- Helpers for uniform error responses
export function sendError(reply, statusCode, shortName, message, details = []) {
  reply.code(statusCode).send({
    // status: statusCode,
    // statusCode,
    error: shortName,
    message,
    details
  });
}
