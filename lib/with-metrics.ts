import { type NextRequest, NextResponse } from "next/server"
import { incrementCounter, observeHistogram } from "./metrics"

type HandlerWithParams<T = any> = (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>

type HandlerWithoutParams = (
  request: NextRequest
) => Promise<NextResponse>

type Handler = HandlerWithParams | HandlerWithoutParams

export function withMetrics(
  handler: HandlerWithoutParams,
  routeName: string
): HandlerWithoutParams

export function withMetrics<T>(
  handler: HandlerWithParams<T>,
  routeName: string
): HandlerWithParams<T>

export function withMetrics(handler: any, routeName: string): any {
  return async (request: NextRequest, context?: any) => {
    const start = performance.now()
    const method = request.method

    incrementCounter("http_requests_total", { route: routeName, method })

    try {
      const response = await handler(request, context)
      const duration = (performance.now() - start) / 1000

      observeHistogram("http_request_duration_seconds", duration, { route: routeName, method })

      if (response.status >= 400) {
        incrementCounter("http_errors_total", { route: routeName, code: String(response.status), method })
      }

      return response
    } catch (error) {
      const duration = (performance.now() - start) / 1000
      observeHistogram("http_request_duration_seconds", duration, { route: routeName, method })
      incrementCounter("http_errors_total", { route: routeName, code: "500", method })
      throw error
    }
  }
}
