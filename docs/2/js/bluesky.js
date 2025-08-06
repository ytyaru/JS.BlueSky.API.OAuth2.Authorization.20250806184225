(function(){//https://dev.to/pipodev/bluesky-oauth2-client-with-vanilla-javascript-1f6h
class BlueSky {
    constructor() {

    }
    async getDID(handle) { // https://docs.bsky.app/docs/api/com-atproto-identity-resolve-handle
        const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`);
        const json = await res.json();
        return json.did;
    }
    async getDIDDocument(did) { // https://docs.bsky.app/docs/advanced-guides/atproto
        const res = await fetch(`https://plc.directory/${did}`);
        return await res.json();
    }
    async getServiceEndpoint(didDoc) {return didDoc.service[0].serviceEndpoint;}
}
window.BlueSky = BlueSky;
})();
