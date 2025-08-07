window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('OAuth認証済み。開始。');
    const ui = Object.fromEntries('iss state code'.split(' ').map(n=>[n, Dom.q(`[name="${n}"]`)]));

    // リダイレクトされたURLに付与されたパラメータを取得する
    const bsky = new BlueSky();
    const params = bsky.receivedParams();
    'iss state code'.map(n=>ui[n].value = params.get(n));
    console.log(ui.iss.value, ui.state.value, ui.code.value);

    // DPOP 所持証明する
    const {authServerResponse, accessToken} = await bsky.dpop(ui.code.value);
    console.log(authServerResponse);
    console.log(`accessToken:`, accessToken);

    // post する
    const message = 'JavaScriptでOAuth認証して投稿します。';
    const {dpopNonce, res} = await post(bsky.hashedAccessToken(accessToken), accessToken, localStorage.getItem('handle'), message)
    console.log(`投稿しました。:`, message);
    console.log(`dpopNonce:`, dpopNonce);
    console.log(`res:`, res);
    /*
    const thisURL = new URL(window.location);

    // Retrieve the "search" part from the url
    const parsedSearch = new URLSearchParams(thisURL.search);
    // Retrieve the data.
    ui.iss.value = parsedSearch.get('iss');
    ui.state.value = parsedSearch.get('state');
    ui.code.value = parsedSearch.get('code');
    */
});
