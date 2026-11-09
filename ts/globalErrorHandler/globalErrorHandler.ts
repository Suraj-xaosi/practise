
type HttpError = Error & {
  
  statusCode: number;
  
  code?: string;
  
  retryAfterSec?: number;
};


type HttpResponse = {
  
  statusCode: number;
  
  headersSent: boolean;
  
  setHeader(name: string, value: string): void;
  
  end(body?: string): void;
};


export function createHttpError(
  
  statusCode: number,
  
  message: string,
  
  code?: string,
  
  retryAfterSec?: number,
): HttpError {
  
  return Object.assign(new Error(message), {
    statusCode,
    ...(code !== undefined ? { code } : {}),
    ...(retryAfterSec !== undefined ? { retryAfterSec } : {}),
  });
}


function isHttpError(error: unknown): error is HttpError {
  
  return error instanceof Error && "statusCode" in error && typeof error.statusCode === "number";
}


export function errorHandler(error: unknown, res: HttpResponse): void {
  
  if (res.headersSent) {
    
    console.error("Error after response headers were sent:", error);
    
    return;
  }

  
  const httpError = isHttpError(error) ? error : undefined;
  
  const statusCode = httpError?.statusCode ?? 500;
  
  if (statusCode >= 500) console.error("Server error:", error);
  
  res.statusCode = statusCode;
  
  if (httpError?.retryAfterSec !== undefined) {
    
    res.setHeader("Retry-After", String(httpError.retryAfterSec));
  }
  
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  
  const message = statusCode >= 500 ? "Internal Server Error" : httpError?.message ?? "Internal Server Error";
  
  const body = { error: message, ...(httpError?.code !== undefined ? { code: httpError.code } : {}) };
  
  res.end(JSON.stringify(body));
}


export function asyncHandler<Request>(
  
  handler: (req: Request, res: HttpResponse) => Promise<unknown>,
): (req: Request, res: HttpResponse) => void {
  
  return (req, res) => {
    
    void Promise.resolve()
      
      .then(() => handler(req, res))
      
      .catch((error: unknown) => errorHandler(error, res));
  };
}
