import pako from 'pako';

const GZIP_MAGIC = [0x1f, 0x8b];

// The same .gz file arrives differently depending on the host:
//   GitHub Pages  -> raw gzip bytes (Content-Type: application/gzip)
//   vite dev/preview -> Content-Encoding: gzip, already inflated by the browser
// Sniffing the gzip magic number works in both cases; Content-Type does not
// (bars-france.geojson.gz is served as application/geo+json in dev).
export async function fetchJsonGz(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const isGzipped = bytes[0] === GZIP_MAGIC[0] && bytes[1] === GZIP_MAGIC[1];
  const text = isGzipped
    ? pako.inflate(bytes, { to: 'string' })
    : new TextDecoder().decode(bytes);

  return JSON.parse(text);
}
