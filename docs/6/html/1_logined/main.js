window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('OAuth認証済み。開始。');
    const ui = Object.fromEntries('iss state code accessToken message post dpopNonce response profile'.split(' ').map(n=>[n, Dom.q(`[name="${n}"]`)]));

    // リダイレクトされたURLに付与されたパラメータを取得する
    const bsky = new BlueSky();
    const params = bsky.receivedParams();
    'iss state code'.split(' ').map(n=>ui[n].value = params.get(n));
    console.log(ui.iss.value, ui.state.value, ui.code.value);
    ui.code.focus();

    // DPOP 所持証明する
    const {authServerResponse, accessToken} = await bsky.dpop(ui.code.value);
    console.log(authServerResponse);
    console.log(`accessToken:`, accessToken);
    ui.accessToken.value = accessToken;
    ui.accessToken.focus();

    // 投稿する
    ui.post.listen('click', async(e)=>{
        // post する
//        const message = 'JavaScriptでOAuth認証して投稿します。';
//        const {dpopNonce, res} = await post(await bsky.hashedAccessToken(accessToken), accessToken, localStorage.getItem('handle'), message)
        const {dpopNonce, res} = await post(await bsky.hashedAccessToken(accessToken), accessToken, localStorage.getItem('handle'), message)
        console.log(`投稿しました。:`, message);
        console.log(`dpopNonce:`, dpopNonce);
        console.log(`res:`, res);
        ui.dpopNonce.value = dpopNonce;
        ui.response.value = JSON.stringify(res);
        ui.response.focus();
        // https://bsky.app/profile/ytyaru.bsky.social
        const url = `https://bsky.app/profile/${localStorage.getItem('handle')}`;
        ui.profile.setAttribute('href', url);
        ui.profile.textContent = localStorage.getItem('handle');
        ui.profile.focus();
    });

    ui.message.focus();

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
