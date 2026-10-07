// The fetch used for Vimeo oEmbed. Test builds swap in ./oembed-fetch.fixtures.ts.
export default globalThis.fetch.bind(globalThis);
