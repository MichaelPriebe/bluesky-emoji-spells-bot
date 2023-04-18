import "websocket-polyfill";

import { SimplePool, getEventHash, getPublicKey, signEvent } from "nostr-tools";

class NostrPlatform {
  constructor() {
    this._client = new SimplePool();
    this._relays = [
      "wss://nos.lol",
      "wss://nostr-pub.wellorder.net",
      "wss://relay.damus.io",
      "wss://relay.nostr.info",
      "wss://relay.snort.social",
    ];
  }

  async login(privateKey) {
    this._privateKey = privateKey;
    this._publicKey = getPublicKey(privateKey);
    for (const relay of this._relays) {
      console.log("Connecting to:", relay);
      try {
        await this._client.ensureRelay(relay);
      } catch (e) {
        console.error("Error with relay:", relay, e);
      }
    }
  }

  post(text) {
    const event = {
      kind: 1,
      pubkey: this._publicKey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: text,
    };
    event.id = getEventHash(event);
    event.sig = signEvent(event, this._privateKey);
    this._client.publish(this._relays, event);
  }
}

export default NostrPlatform;
