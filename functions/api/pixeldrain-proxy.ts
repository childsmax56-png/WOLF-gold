export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response('Missing or invalid id', { status: 400 });
  }

  const upstreamUrl = `https://pixeldrain.com/api/file/${id}`;

  const upstreamHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': `https://pixeldrain.com/u/${id}`,
    'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.5',
    'Accept-Language': 'en-US,en;q=0.5',
  };
  const rangeHeader = context.request.headers.get('Range');
  if (rangeHeader) {
    upstreamHeaders['Range'] = rangeHeader;
  }

  try {
    const res = await fetch(upstreamUrl, { headers: upstreamHeaders });

    const responseHeaders = new Headers();
    const contentType = res.headers.get('Content-Type');
    if (contentType) responseHeaders.set('Content-Type', contentType);
    const contentLength = res.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    const contentRange = res.headers.get('Content-Range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);
    const acceptRanges = res.headers.get('Accept-Ranges');
    if (acceptRanges) responseHeaders.set('Accept-Ranges', acceptRanges);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response('Failed to fetch from Pixeldrain', { status: 502 });
  }
};
