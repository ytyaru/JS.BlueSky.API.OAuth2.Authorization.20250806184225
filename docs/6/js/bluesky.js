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

    async requestPAR(USER_HANDLE, userPAREndPoint, APP_CLIENT_ID, APP_CALLBACK_URL) {
        // The state
        // ------------------------------------------
        let stateArray = new Uint32Array(28);
        window.crypto.getRandomValues(stateArray);
        let state = Array.from(stateArray, dec => ('0' + dec.toString(16)).substr(-2)).join('');

        // The code verifier
        // ------------------------------------------
        let codeVerifierArray = new Uint32Array(28);
        window.crypto.getRandomValues(codeVerifierArray);
        let codeVerifier = Array.from(codeVerifierArray, dec => ('0' + dec.toString(16)).substr(-2)).join('');

        // The code verifier challenge
        // ------------------------------------------
        //let hashedCodeVerifier = await sha256(codeVerifier);
        let hashedCodeVerifier = await this.#sha256(codeVerifier);
        let codeChallenge = this.#base64urlencode(hashedCodeVerifier);
        //let codeChallenge = base64urlencode(hashedCodeVerifier);

        // Build up the URL.
        // Just, to make it simple! I know there are better ways to do this, BUT...
        // ------------------------------------------
        let url = userPAREndPoint;
        let body = "response_type=code";
        body += "&code_challenge_method=S256";
        body += "&scope=" + encodeURIComponent( "atproto transition:generic" ); // MUST match the scopes in the client-metadata.json
        body += "&client_id=" + encodeURIComponent( APP_CLIENT_ID );
        body += "&redirect_uri=" + encodeURIComponent( APP_CALLBACK_URL );
        body += "&code_challenge=" + codeChallenge;
        body += "&state=" + state;
        body += "login_hint=" + USER_HANDLE;

        // TuneUp and perform the call
        // ------------------------------------------
        let fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            body: body
        }

        console.log(url, fetchOptions);
        const res = await fetch(url, fetchOptions);
        const dpopNonce = res.headers.get('dpop-nonce');
        const json = await res.json();
        const authServerRequestURI = json.request_uri;
        return ({codeVerifier:codeVerifier, dpopNonce:dpopNonce, PAR:json, authServerRequestURI:authServerRequestURI});
        /*
        fetch( url, fetchOptions ).then( response => {
            // Process the HTTP Response
            dpopNonce = response.headers.get( "dpop-nonce" );
            return response.json();
        }).then( data => {
            // Process the HTTP Response Body
            userAuthServerRequestURI = data.request_uri;
        });
        */
    }
    makeAuthorizationEndPointURL(userAuthorizationEndPoint, APP_CLIENT_ID, userAuthServerRequestURI) {return `${userAuthorizationEndPoint}?client_id=${encodeURIComponent( APP_CLIENT_ID )}&request_uri=${encodeURIComponent( userAuthServerRequestURI )}`}
    async #sha256(str, algorizm='SHA-256') {//https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/digest
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        return window.crypto.subtle.digest(algorizm, data); // SHA-1/SHA-256/SHA-384/SHA-512
    }
    #base64urlencode(str) {
        // Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
        // btoa accepts chars only within ascii 0-255 and base64 encodes them.
        // Then convert the base64 encoded to base64url encoded
        //   (replace + with -, replace / with _, trim trailing =)
        return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
}
window.BlueSky = BlueSky;
})();
