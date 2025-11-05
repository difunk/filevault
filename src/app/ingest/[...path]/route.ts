import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path.join("/");
  const posthogUrl = `${env.NEXT_PUBLIC_POSTHOG_HOST}/${path}`;

  console.log("PostHog POST request:", {
    path,
    posthogUrl,
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  try {
    const body = await request.text();
    const searchParams = request.nextUrl.searchParams;

    const url = new URL(posthogUrl);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log("Forwarding to:", url.toString());

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type":
          request.headers.get("content-type") ?? "application/json",
        "User-Agent":
          request.headers.get("user-agent") ?? "NextJS-PostHog-Proxy",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate",
      },
      body: body,
    });

    console.log("PostHog response status:", response.status);

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("PostHog proxy error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path.join("/");
  const posthogUrl = `${env.NEXT_PUBLIC_POSTHOG_HOST}/${path}`;

  console.log("PostHog GET request:", {
    path,
    posthogUrl,
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  try {
    const searchParams = request.nextUrl.searchParams;

    const url = new URL(posthogUrl);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log("Forwarding to:", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          request.headers.get("user-agent") ?? "NextJS-PostHog-Proxy",
        Accept: "*/*",
      },
    });

    console.log("PostHog response status:", response.status);

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("PostHog proxy error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, User-Agent",
    },
  });
}
