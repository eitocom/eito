import { NextResponse } from "next/server";

import { generateOpenApiDocument } from "@/lib/openapi/document";

export const dynamic = "force-static";

export async function GET() {
  const document = generateOpenApiDocument();
  return NextResponse.json(document);
}
