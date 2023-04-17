import "websocket-polyfill";

import { getEventHash, getPublicKey, relayInit, signEvent } from "nostr-tools";

class NostrPlatform {
  constructor() {
    this._client = relayInit("wss://relay.damus.io");
  }

  login(privateKey) {
    this._privateKey = privateKey;
    this._publicKey = getPublicKey(privateKey);
    return this._client.connect();
  }

  post(text) {
    let event = {
      kind: 1,
      pubkey: this._publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: text,
    };
    event.id = getEventHash(event);
    event.sig = signEvent(event, this._privateKey);
    return new Promise((res, rej) => {
      const pub = this._client.publish(event);
      pub.on("ok", res);
      pub.on("failed", rej);
    });
  }
}

export default NostrPlatform;
