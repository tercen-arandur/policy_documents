// "Back to tercen.com": returns the visitor to the www.tercen.com page they came from.
//
// The main site links here as /privacy/?from=<path>, where <path> is the page's path encoded with
// encodeURIComponent and its slashes kept (/contact-us/, /r%26d/). The query is decoded once, and
// the decoded value is accepted only if it is a plain same-site path. Anything else, or no `from`,
// goes to the home page. The link's href in the HTML is already the home page, so without this
// script (or with a rejected `from`) the link still works.

export const HOME = 'https://www.tercen.com/';
const ORIGIN = 'https://www.tercen.com';

// One leading slash, then path characters only (RFC 3986 pchar and '/'). This leaves out '\', '?',
// '#', whitespace, control characters and anything non-ASCII. '%' is allowed only as the start of an
// escape, so a path the main site sent already percent-encoded (/caf%C3%A9/) still round-trips.
const PATH = /^\/(?![/\\])(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/]|%[0-9A-Fa-f]{2})*$/;

// Escapes that would still decode to a slash, a backslash, a control character or DEL. Rejected so
// that no later decoding, by us or anyone, can turn the path into //host or /\host.
const DANGEROUS_ESCAPE = /%(?:2f|5c|[01][0-9a-f]|7f)/i;

// Returns the accepted path, or null. `search` is location.search (with or without its '?').
export function fromPath(search) {
  let value;
  try {
    value = new URLSearchParams(search).get('from');
  } catch {
    return null;
  }
  if (value === null || !PATH.test(value) || DANGEROUS_ESCAPE.test(value) || value.includes('//')) return null;
  // The rules above should already guarantee this; check the resolved URL anyway.
  const url = new URL(value, ORIGIN);
  return url.origin === ORIGIN ? value : null;
}

export function backHref(search) {
  const path = fromPath(search);
  return path === null ? HOME : ORIGIN + path;
}

// The query string that carries an accepted path on to another page of this site, encoded the way
// the main site encodes it.
export function fromQuery(path) {
  return '?from=' + encodeURIComponent(path).replaceAll('%2F', '/');
}

if (typeof document !== 'undefined') {
  const path = fromPath(location.search);
  if (path !== null) {
    const back = document.querySelector('[data-back-link]');
    if (back) back.href = ORIGIN + path;
    // Keep the path when the visitor moves between documents, so "Back" still returns there.
    for (const a of document.querySelectorAll('a[data-internal]')) {
      const url = new URL(a.href);
      if (url.origin === location.origin) a.href = url.pathname + fromQuery(path) + url.hash;
    }
  }
}
