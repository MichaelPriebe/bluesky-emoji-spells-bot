// Temporary fetch polyfill until DigitalOcean App Platform supports Node v18

import fetch, { Headers, Request, Response } from "node-fetch";

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

import bsky from "@atproto/api";
const { BskyAgent } = bsky;

class BlueSkyPlatform {
  constructor() {
    this._client = new BskyAgent({
      service: "https://bsky.social",
    });
  }

  login(identifier, password) {
    return this._client.login({
      identifier,
      password,
    });
  }

  post(text) {
    return this._client.post({
      text: text,
    });
  }
}

export default BlueSkyPlatform;
