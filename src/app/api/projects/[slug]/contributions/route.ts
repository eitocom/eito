import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  return NextResponse.json({
    success: true,
    projectSlug: slug,
    contributions: [],
    totalContributions: 0,
    totalBountyEarnedBrl: 0
  });
}
