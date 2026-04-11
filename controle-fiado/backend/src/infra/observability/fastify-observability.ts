import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../application/errors/app-error.js";

export function buildFastifyLoggerOptions() {
  return {
    level: env.logLevel,
    redact: ["req.headers.authorization", "headers.authorization"],
    serializers: {
      req(request: {
        id?: string;
        method?: string;
        url?: string;
        headers?: Record<string, string | string[] | undefined>;
      }) {
        return {
          id: request.id,
          method: request.method,
          url: request.url,
          userAgent: request.headers?.["user-agent"]
        };
      },
      res(reply: { statusCode?: number }) {
        return {
          statusCode: reply.statusCode
        };
      }
    }
  };
}

export function registerObservability(app: FastifyInstance) {
  app.addHook("onResponse", async (request, reply) => {
    request.log.info({
      event: "http_response",
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: reply.elapsedTime,
      authUserId: request.authUser?.id ?? null
    });
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      request.log.warn({
        event: "validation_error",
        requestId: request.id,
        method: request.method,
        url: request.url,
        issues: error.issues
      });

      return reply.code(400).send({
        message: "Dados invalidos.",
        code: "VALIDATION_ERROR",
        issues: error.issues
      });
    }

    if (error instanceof AppError) {
      request.log.warn({
        event: "application_error",
        requestId: request.id,
        method: request.method,
        url: request.url,
        statusCode: error.statusCode,
        code: error.code,
        details: error.details
      });

      return reply.code(error.statusCode).send({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    request.log.error({
      event: "unhandled_error",
      requestId: request.id,
      method: request.method,
      url: request.url,
      error
    });

    return reply.code(500).send({
      message: "Erro interno do servidor.",
      code: "INTERNAL_SERVER_ERROR"
    });
  });
}
