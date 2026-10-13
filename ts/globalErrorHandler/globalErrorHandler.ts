// Yeh custom error ka shape batata hai, jisme normal Error ke saath HTTP details hain.
type HttpError = Error & {
  // Yeh client ko bhejne wala HTTP status code rakhta hai.
  statusCode: number;
  // Yeh optional machine-readable error code rakhta hai.
  code?: string;
  // Yeh optional Retry-After delay seconds mein rakhta hai.
  retryAfterSec?: number;
};

// Yeh raw HTTP response ke woh parts batata hai jo error handler use karta hai.
type HttpResponse = {
  // Yeh response ka HTTP status set karta hai.
  statusCode: number;
  // Yeh batata hai ki headers pehle bheje gaye hain ya nahi.
  headersSent: boolean;
  // Yeh response header set karta hai.
  setHeader(name: string, value: string): void;
  // Yeh response body bhejkar response khatam karta hai.
  end(body?: string): void;
};

// Yeh diye gaye details se custom HTTP error banata hai.
export function createHttpError(
  // Yeh response status leta hai.
  statusCode: number,
  // Yeh error ka message leta hai.
  message: string,
  // Yeh optional error code leta hai.
  code?: string,
  // Yeh optional retry delay seconds mein leta hai.
  retryAfterSec?: number,
): HttpError {
  // Yeh Error object ke saath sirf diye gaye optional fields jodta hai.
  return Object.assign(new Error(message), {
    statusCode,
    ...(code !== undefined ? { code } : {}),
    ...(retryAfterSec !== undefined ? { retryAfterSec } : {}),
  });
}

// Yeh unknown error ko pehchan kar batata hai ki woh hamara HTTP error hai ya nahi.
function isHttpError(error: unknown): error is HttpError {
  // Yeh Error instance aur numeric status code dono check karta hai.
  return error instanceof Error && "statusCode" in error && typeof error.statusCode === "number";
}

// Yeh error ko raw HTTP response mein JSON ke roop mein bhejta hai.
export function errorHandler(error: unknown, res: HttpResponse): void {
  // Yeh response pehle hi shuru ho chuka ho to use dobara bhejne se rokta hai.
  if (res.headersSent) {
    // Yeh response bhejne ke baad aaye error ko server log mein dikhata hai.
    console.error("Error after response headers were sent:", error);
    // Yeh naye response ki koshish kiye bina function rokta hai.
    return;
  }

  // Yeh custom HTTP error ko identify karta hai.
  const httpError = isHttpError(error) ? error : undefined;
  // Yeh custom error ka status leta hai, warna server error status 500 rakhta hai.
  const statusCode = httpError?.statusCode ?? 500;
  // Yeh server errors ka asli detail log karta hai, client ko nahi bhejta.
  if (statusCode >= 500) console.error("Server error:", error);
  // Yeh response ka status code set karta hai.
  res.statusCode = statusCode;
  // Yeh error mein retry delay ho to Retry-After header bhejta hai.
  if (httpError?.retryAfterSec !== undefined) {
    // Yeh seconds ko header ke liye string mein badalta hai.
    res.setHeader("Retry-After", String(httpError.retryAfterSec));
  }
  // Yeh response body ko JSON batata hai.
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // Yeh 500 errors ka internal message chhupata hai, client errors ka message rakhta hai.
  const message = statusCode >= 500 ? "Internal Server Error" : httpError?.message ?? "Internal Server Error";
  // Yeh JSON response mein message aur, agar diya ho, error code rakhta hai.
  const body = { error: message, ...(httpError?.code !== undefined ? { code: httpError.code } : {}) };
  // Yeh JSON body bhejkar HTTP response complete karta hai.
  res.end(JSON.stringify(body));
}

// Yeh async handler ke throw/rejection ko seedha errorHandler tak pahunchata hai.
export function asyncHandler<Request>(
  // Yeh raw request aur response lene wala async function leta hai.
  handler: (req: Request, res: HttpResponse) => Promise<unknown>,
): (req: Request, res: HttpResponse) => void {
  // Yeh raw HTTP server se milne wale request aur response arguments leta hai.
  return (req, res) => {
    // Yeh synchronous throw aur Promise rejection dono ko pakadta hai.
    void Promise.resolve()
      // Yeh asli request handler chalata hai.
      .then(() => handler(req, res))
      // Yeh pakde gaye error ko JSON response mein badalta hai.
      .catch((error: unknown) => errorHandler(error, res));
  };
}
