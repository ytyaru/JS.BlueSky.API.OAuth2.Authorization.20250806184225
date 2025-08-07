class Base64 {
    static toBase64Url(input) {
        const base64string = btoa(String.fromCharCode.apply(0, input));
        return base64string.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    static base64UrlToUint8Array(input) {
        input = input.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
        return new Uint8Array(
            Array.prototype.map.call(atob(input), (c) => c.charCodeAt(0))
        );
    }
    static ToBase64UrlString(str){
        return str.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")
    }
    static utf8ToUint8Array(str) {return this.base64UrlToUint8Array(btoa(unescape(encodeURIComponent(str))));}
    // Base64-urlencodes the input string
    static base64urlencode(str) {
        // Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
        // btoa accepts chars only within ascii 0-255 and base64 encodes them.
        // Then convert the base64 encoded to base64url encoded
        //   (replace + with -, replace / with _, trim trailing =)
        return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
}

