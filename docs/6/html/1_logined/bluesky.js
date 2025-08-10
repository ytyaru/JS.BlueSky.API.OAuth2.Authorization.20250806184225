(function(){
class BlueSky {
    constructor() {

    }
    receivedParams() {// リダイレクトされたURLに付与された各種コード値を取得する
        const thisURL = new URL(window.location);
        return new URLSearchParams(thisURL.search);
//        ui.iss.value = parsedSearch.get('iss');
//        ui.state.value = parsedSearch.get('state');
//        ui.code.value = parsedSearch.get('code');
    }
    async dpop(code) {// 所持証明
//        localStorage.setItem('codeVerifier', codeVerifier);
//        localStorage.setItem('dpopNonce', dpopNonce);
//        localStorage.setItem('tokenEndpoint', tokenEndpoint);
//        localStorage.setItem('clientID', meta.client_id);
//        localStorage.setItem('callbackURL', meta.redirect_uris[0]);

//        localStorage.getItem('codeVerifier')
//        localStorage.getItem('dpopNonce')
//        localStorage.getItem('tokenEndpoint')
//        localStorage.getItem('clientID')
//        localStorage.getItem('callbackURL')

        // ------------------------------------------
        //   Javascript
        //
        //   (maybe some steps are wrong 'typed')...
        // ------------------------------------------
        let userAccessToken = null;

        // Build up the URL.
        // ------------------------------------------
        //let url = userTokenEndPoint;
        let url = localStorage.getItem('tokenEndpoint');

        // The body of the call
        // ------------------------------------------
        let body = new URLSearchParams({
            // Fixed values
            'grant_type': 'authorization_code',
            // Constant values
//            'client_id': encodeURIComponent( APP_CLIENT_ID ),
//            'redirect_uri': encodeURIComponent( APP_CALLBACK_URL ),
            'client_id': encodeURIComponent( localStorage.getItem('clientID') ),
            'redirect_uri': encodeURIComponent( localStorage.getItem('callbackURL') ),
            // Variable values
//            'code': receivedCode,
//            'code_verifier': codeVerifier
            'code': code,
            'code_verifier': localStorage.getItem('codeVerifier')
        });

        // Create the crypto key.
        // Must save it, 'cause we'll reuse it later.
        // ------------------------------------------
        let keyOptions = {
            name: "ECDSA",
            namedCurve: "P-256"
        };
        let keyPurposes = ["sign", "verify"];
        let key = await crypto.subtle.generateKey(keyOptions, false, keyPurposes).then(function(eckey) {
            return eckey;
        });
        let jwk = await crypto.subtle.exportKey("jwk", key.publicKey).then(function(keydata) {
            return keydata;
        });
        delete jwk.ext;
        delete jwk.key_ops;

        // Create the DPoP-Proof 'body' for this request.
        // ------------------------------------------
        let uuid = self.crypto.randomUUID();
        let dpop_proof_header = {
            typ: "dpop+jwt",
            alg: "ES256",
            jwk: jwk
        };
        let dpop_proof_payload = {
//            iss: APP_CLIENT_ID, // Added
            iss: localStorage.getItem('clientID'), // Added
            jti: uuid,
            htm: "POST",
            htu: url,
            iat: Math.floor(Date.now() / 1000),
//            nonce: dpopNonce
            nonce: localStorage.getItem('dpopNonce')
        };

        // Crypt and sign the DPoP-Proof header+body
        // ------------------------------------------
        const h = JSON.stringify(dpop_proof_header);
        const p = JSON.stringify(dpop_proof_payload);
        const partialToken = [
            Base64.ToBase64Url(Base64.utf8ToUint8Array(h)),
            Base64.ToBase64Url(Base64.utf8ToUint8Array(p)),
        ].join(".");
        const messageAsUint8Array = Base64.utf8ToUint8Array(partialToken);

        let signOptions = {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        };
        console.log(signOptions, key.privateKey, dpop_proof_payload);
        //let signatureAsBase64 = await crypto.subtle.sign(signOptions, key.privateKey, dpop_proof_payload)
        let signatureAsBase64 = await crypto.subtle.sign(signOptions, key.privateKey, messageAsUint8Array)
        .then(function(signature) {
            return Base64.ToBase64Url(new Uint8Array(signature));
        });

        // The DPoP-Proof
        // ------------------------------------------
        let dpopProof = `${partialToken}.${signatureAsBase64}`;

        // TuneUp the call
        // ------------------------------------------
        let headers = {
            'DPOP': dpopProof,
            'Content-Type': 'application/x-www-form-urlencoded',
//            'DPoP-Nonce': dpopNonce
            'DPoP-Nonce': localStorage.getItem('dpopNonce')
        }
        let fetchOptions = {
            method: 'POST',
            headers: headers,
            body: body.toString()
        }

        // Finally, perform the call
        // ------------------------------------------
        /*
        let url = userTokenEndPoint;
        fetch( url, fetchOptions ).then( response => {
            // Process the HTTP Response
            return response.json();
        }).then( data => {
            // Process the HTTP Response Body
            authServerResponse = data;
            userAccessToken = data.access_token;
        });
        */

//        const res = await fetch(userTokenEndPoint, fetchOptions);
        const res = await fetch(localStorage.getItem('tokenEndpoint'), fetchOptions);
        const json = await res.json();
        return ({authServerResponse:json, accessToken:json.access_token});
    }

    async hashedAccessToken(userAccessToken) {
        // ------------------------------------------
        //   Javascript
        // ------------------------------------------

        // For subsequent calls, we must include the
        // hash of the access token in the DPoP-Proof payload.
        // ------------------------------------------

        // Let's calculate the hash
        let encodedAccessToken = new TextEncoder().encode(userAccessToken);
        let atHash = await crypto.subtle.digest('SHA-256', encodedAccessToken)
        .then(function(hash) {        
            let base = Base64.ToBase64Url(new Uint8Array(hash));
            if (noPadding){
                base = base.replace(/\=+$/, '');
            }    
            return base;
        });

        // Regenerate the UUID.
        let uuid = self.crypto.randomUUID();

        // Add the hash in the DPoP-Proof payload.
        // The "url" is a new one.
        let dpop_proof_payload = {

            // This parameter LINKs the user access token
            // to the call & the application, thru the crypto key
            // ------------------------------------------
            ath: atHash,

            // The method can be "GET" or whatever.
            // ------------------------------------------
            htm: "POST",

            // The "url" should be distinct.
            // ------------------------------------------
//            htu: url,
            htu: localStorage.getItem('tokenEndpoint'),

            // The "time stamp" is "now" (UNIX like)
            // ------------------------------------------
            iat: Math.floor(Date.now() / 1000),

            // The brand new uuid.
            // ------------------------------------------
            jti: uuid,

            // The rest of the parameters should be the same
            // ------------------------------------------
//            iss: APP_CLIENT_ID,
//            nonce: dpopNonce
            iss: localStorage.getItem('clientID'),
            nonce: localStorage.getItem('dpopNonce')
        };
        return dpop_proof_payload;
    }
    async post(dpopProof, userAccessToken, handle, message) {
        try {
            const headers = {
//                'Content-Type': [whichever],
                'Accept': 'application/json',

                // The "Authorization" header now is
                // not a "Bearer" but a "DPoP". 
                // ------------------------------------------
                'Authorization': `DPoP ${userAccessToken}`,

                // The "DPoP-Proof" must be included also
                // in a proper header.
                // ------------------------------------------
                'DPoP': dpopProof
            };
            const fetchOptions = {
                method: 'POST',     // Or "GET", or...
                headers: headers,
//                body: body          // Whatever. If needed
                body: JSON.stringify({
                    //repo: this._.handle,
                    repo: handle,
                    collection: 'app.bsky.feed.post',
                    record: {
                        text: message,
                        createdAt: new Date().toISOString()
                    }
                })
            };
            /*
            fetch( url, fetchOptions ).then( response => {
                // Process the HTTP Response

                // Normally, the "nonce" should come; to be checked.
                // ------------------------------------------
                dpopNonce = response.headers.get( "dpop-nonce" );
                return response.json();
            }).then( data => {
                // Process the HTTP Response Body
                // Whatever we expect.
            });
            */
            const url = 'https://bsky.social/xrpc/com.atproto.repo.createRecord';
            const res = await fetch(url, fetchOptions);
//            dpopNonce = res.headers.get('dpop-nonce');
//            localStorage.setItem('dpopNonce', dpopNonce);
            const dpopNonce = res.headers.get('dpop-nonce');
            const json = await res.json();
            return {dpopNonce:dpopNonce, res:json}; 
            
            /*
            const accessJwt = await this.#createSession();
            const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessJwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    repo: this._.handle,
                    collection: 'app.bsky.feed.post',
                    record: {
                        text: message,
                        createdAt: new Date().toISOString()
                    }
                })
            });
            return 200 === res.status;
            */
        } catch (error) {
            console.error('❌ 投稿エラー:', error);
            return false;
        }
    }

    /*
    callApi(dpopProof) {
        // ------------------------------------------
        //   Javascript
        // ------------------------------------------

        let headers: {
            'Content-Type': [whichever],
            'Accept': 'application/json',

            // The "Authorization" header now is
            // not a "Bearer" but a "DPoP". 
            // ------------------------------------------
            'Authorization': `DPoP ${userAccessToken}`,

            // The "DPoP-Proof" must be included also
            // in a proper header.
            // ------------------------------------------
            'DPoP': dpopProof
        },
        let fetchOptions = {
            method: 'POST',     // Or "GET", or...
            headers: headers,
            body: body          // Whatever. If needed
        }
        fetch( url, fetchOptions ).then( response => {
            // Process the HTTP Response

            // Normally, the "nonce" should come; to be checked.
            // ------------------------------------------
            dpopNonce = response.headers.get( "dpop-nonce" );
            return response.json();
        }).then( data => {
            // Process the HTTP Response Body
            // Whatever we expect.
        });
    }
    */
}
window.BlueSky = BlueSky;
})();
