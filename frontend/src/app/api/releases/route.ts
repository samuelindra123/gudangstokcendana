import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/samuelindra123/gudangstokcendana/releases',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
        },
        next: { revalidate: 60 }, // Cache for only 1 minute to ensure fresh updates
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch releases' },
        { status: response.status }
      );
    }

    const releases = await response.json();

    // Filter and format releases for desktop app
    const desktopReleases = releases
      .filter((release: any) => !release.draft && !release.prerelease)
      .map((release: any) => ({
        version: release.tag_name.replace('v', ''),
        tagName: release.tag_name,
        name: release.name,
        description: release.body,
        publishedAt: release.published_at,
        downloadUrl: release.assets.find(
          (asset: any) => 
            asset.name.endsWith('.exe') && !asset.name.includes('portable')
        )?.browser_download_url,
        portableUrl: release.assets.find(
          (asset: any) => asset.name.includes('portable.exe')
        )?.browser_download_url,
        assets: release.assets.map((asset: any) => ({
          name: asset.name,
          size: asset.size,
          downloadUrl: asset.browser_download_url,
          downloadCount: asset.download_count,
        })),
      }))
      .sort((a: any, b: any) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    return NextResponse.json({
      success: true,
      releases: desktopReleases,
      latest: desktopReleases[0] || null,
    });
  } catch (error) {
    console.error('Error fetching releases:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
