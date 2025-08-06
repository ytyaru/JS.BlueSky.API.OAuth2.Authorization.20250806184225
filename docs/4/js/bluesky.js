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
    getServiceEndpoint(didDoc) {return didDoc.service[0].serviceEndpoint;}
    async getPDSMetadata(serviceEndpoint) {
        const res = await fetch(`${serviceEndpoint}/.well-known/oauth-protected-resource`);
        return await res.json();
    }
    getAuthServerURL(pdsMetadata) {return pdsMetadata.authorization_servers[0];}
    async getAuthServerDiscovery(authServerURL) {
        const res = await fetch(`${authServerURL}/.well-known/oauth-authorization-server`);
        return await res.json();
    }
    getAuthorizationEndPoint(authServerDiscovery) {return authServerDiscovery.authorization_endpoint}
    getTokenEndPoint(authServerDiscovery) {return authServerDiscovery.token_endpoint}
    getPAREndPoint(authServerDiscovery) {return authServerDiscovery.pushed_authorization_request_endpoint}
}
window.BlueSky = BlueSky;
})();
