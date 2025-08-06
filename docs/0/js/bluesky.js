(function(){
class BlueSky {
    constructor() {

    }
    async getDID(handle) { // https://docs.bsky.app/docs/api/com-atproto-identity-resolve-handle
        const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`);
        const json = await res.json();
        return json.did;
    }
}
window.BlueSky = BlueSky;
})();
