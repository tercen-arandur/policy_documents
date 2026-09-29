// The "Back to tercen.com" link: which `from` values are followed, and which fall back to the home page.
// Each input is a raw query string, exactly as it would arrive in location.search.
//
//   npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME, backHref, fromPath, fromQuery } from '../docs/assets/js/back-link.js';

const accepted = [
  // [query, where the link goes]
  ['?from=/', 'https://www.tercen.com/'],
  ['?from=/contact-us/', 'https://www.tercen.com/contact-us/'],
  ['?from=/about/team/', 'https://www.tercen.com/about/team/'],
  ['?from=/404/', 'https://www.tercen.com/404/'],
  // The main site encodes the path with encodeURIComponent and keeps the slashes; decoded once.
  ['?from=/r%26d/', 'https://www.tercen.com/r&d/'],
  ['?from=%2Fcontact-us%2F', 'https://www.tercen.com/contact-us/'],
  ['?from=/a%2Bb/', 'https://www.tercen.com/a+b/'],
  // A path that was already percent-encoded on the main site stays encoded.
  ['?from=/caf%25C3%25A9/', 'https://www.tercen.com/caf%C3%A9/'],
  // Other parameters don't matter; the first `from` is the one used.
  ['?utm_source=x&from=/contact-us/', 'https://www.tercen.com/contact-us/'],
  ['?from=/contact-us/&from=//evil.example/', 'https://www.tercen.com/contact-us/'],
  ['from=/contact-us/', 'https://www.tercen.com/contact-us/'],
];

const rejected = [
  // No `from`, or an empty one.
  '',
  '?',
  '?other=/contact-us/',
  '?from',
  '?from=',
  // Full URLs, other schemes.
  '?from=https://evil.example/',
  '?from=https%3A%2F%2Fevil.example%2F',
  '?from=http://www.tercen.com/contact-us/',
  '?from=https://www.tercen.com/contact-us/',
  '?from=javascript:alert(1)',
  '?from=javascript%3Aalert(1)',
  '?from=JavaScript:alert(1)',
  '?from=%20javascript:alert(1)',
  '?from=data:text/html,x',
  '?from=vbscript:x',
  '?from=mailto:a@evil.example',
  // Protocol-relative and backslash forms, plain and encoded.
  '?from=//evil.example/',
  '?from=%2F%2Fevil.example%2F',
  '?from=%2f%2fevil.example',
  '?from=/%2Fevil.example/',
  '?from=///evil.example/',
  '?from=/\\evil.example/',
  '?from=%2F%5Cevil.example',
  '?from=/%5Cevil.example',
  '?from=\\\\evil.example',
  '?from=%5C%5Cevil.example',
  // Encodings that would decode to a slash or backslash on a second decode.
  '?from=/%252F%252Fevil.example',
  '?from=%252F%252Fevil.example',
  '?from=/%255Cevil.example',
  '?from=/a%252Fb/',
  // Double slashes anywhere in the path.
  '?from=/a//evil.example/',
  '?from=/..//evil.example/',
  // Not starting with '/'.
  '?from=contact-us/',
  '?from=evil.example',
  '?from=.%2Fcontact-us%2F',
  '?from=%20/contact-us/',
  '?from=+/contact-us/',
  // Userinfo and host tricks.
  '?from=@evil.example',
  '?from=https:evil.example',
  // Control characters and whitespace, raw and encoded (tab and newline are stripped by URL parsers).
  '?from=/%09/evil.example',
  '?from=%2F%09%2Fevil.example',
  '?from=/%0A/evil.example',
  '?from=/%0D%0A/evil.example',
  '?from=/%00/',
  '?from=/%7F/',
  '?from=/contact%20us/',
  '?from=/contact+us/',
  '?from=/a%2509b/',
  '?from=/a%2500b/',
  // Query strings and fragments inside the path.
  '?from=/contact-us/%3Fx%3D1',
  '?from=/contact-us/%23top',
  // Non-ASCII, and malformed escapes (decoded to U+FFFD).
  '?from=/caf%C3%A9/',
  '?from=/%E2%80%AE/',
  '?from=/%FF/',
  '?from=/%E0%A4%A/',
  '?from=/100%/',
  '?from=/%zz/',
  // Angle brackets and quotes.
  '?from=/%3Cscript%3E/',
  '?from=/%22onmouseover=x/',
];

for (const [query, expected] of accepted) {
  test(`follows ${JSON.stringify(query)}`, () => {
    assert.equal(backHref(query), expected);
  });
}

for (const query of rejected) {
  test(`home page for ${JSON.stringify(query)}`, () => {
    assert.equal(fromPath(query), null);
    assert.equal(backHref(query), HOME);
  });
}

test('every link it produces is on https://www.tercen.com', () => {
  for (const query of [...accepted.map(([q]) => q), ...rejected]) {
    const url = new URL(backHref(query));
    assert.equal(url.origin, 'https://www.tercen.com', query);
  }
});

test('carries a path on in the form the main site sends it', () => {
  for (const [query] of accepted) {
    const path = fromPath(query);
    // Passing the carried query on again must give the same path back.
    assert.equal(fromPath(fromQuery(path)), path, query);
  }
  assert.equal(fromQuery('/r&d/'), '?from=/r%26d/');
  assert.equal(fromQuery('/contact-us/'), '?from=/contact-us/');
});
