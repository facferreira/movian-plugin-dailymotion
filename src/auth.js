exports.isAuthenticated = function() {
    return credentials.apiauth !== undefined;
};

exports.getAuthorizationHeader = function() {
    return credentials.apiauth;
};

exports.login = function() {
    var response = JSON.parse(http.request(api.API_BASE_URL + "/oauth/device/code", {
        postdata: {
            client_id: api.CLIENT_ID
        }
    }));

    var deviceCode = response.device_code;

    // Create a popup
    // We do this manually using properties because we want to wait for event asyncronously
    var message = prop.createRoot();
    message.type = 'message';
    prop.setRichStr(message, 'message',
        'To give Movian access to your Trakt account,\n' +
        'open a web browser on your computer or smartphone and visit:\n\n<font size="6">' +
        response.verification_url +
        '</font>\n\nWhen asked, enter the code:\n\n<font size="7">' +
        response.user_code +
        '</font>\n\nThis popup will close automatically once the authentication is completed.');
    message.cancel = true; // Show the cancel button

    // Insert the popup in the global popup tree (this will display it to the user)
    prop.setParent(message, prop.global.popups);

    var timer = null;
    var interval = 3000;

    // Check if user have accepted in a loop
    function checktoken() {
        // In order to protect the plugins client-secret a Oauth proxy
        // runs at https://movian.tv which will append the oauth secret
        // and forward the request to Trakt's servers
        var response = http.request("https://movian.tv/oauthproxy/token", {
            headers: {
                referer: 'https://movian.tv/',
                'X-URL-ID': 'oauth/device/token'
            },
            noFail: true,
            postdata: {
                client_id: api.CLIENT_ID,
                code: deviceCode
            }
        });

        if (response.statuscode === 400) {
            // pending
            timer = setTimeout(checktoken, interval);
            return;
        } else if (response.statuscode === 410) {
            // expired
            popup.notify('Code expired. Try again.', 3);
            return;
        } else if (response.statuscode === 418) {
            // denied
            popup.notify('Authentication denied by user', 3);
            return;
        } else if (response.statuscode === 429) {
            // slow down
            interval += 1000;
            timer = setTimeout(checktoken, interval);
            return;
        }

        var token = JSON.parse(response);
        log.d(token);

        // Ok, we're done (in one way or another). Destroy the message
        prop.destroy(message);

        // All looks good
        credentials.refresh_token = token.refresh_token;
        credentials.apiauth = token.token_type + ' ' + token.access_token;

        popup.notify('Successfully authenticated', 3);

        return;
    }

    // Start the refresh loop
    timer = setTimeout(checktoken, 10000);

    // Subscribe to the popup eventSink to detect if user presses cancel
    prop.subscribe(message.eventSink, function(event, data) {
        if (event == 'action' && data == 'Cancel') {
            prop.destroy(message);
            clearTimeout(timer);
            popup.notify('Cancelled by user', 3);
        }
    }, {
        // This will make the subscription destroy itself when the popup
        // is destroyed. Without this we will retain references to captured
        // variables indefinitely
        autoDestroy: true
    });
};

exports.refreshToken = function() {
    var response = http.request("https://movian.tv/oauthproxy/token", {
        headers: {
            referer: 'https://movian.tv/',
            'X-URL-ID': 'oauth/token'
        },
        postdata: {
            refresh_token: credentials.refresh_token,
            client_id: api.CLIENT_ID,
            redirect_uri: 'https://movian.tv/trakt/callback',
            grant_type: 'refresh_token'
        }
    });

    var token = JSON.parse(response);
    log.d(token);

    // All looks good
    credentials.refresh_token = token.refresh_token;
    credentials.apiauth = token.token_type + ' ' + token.access_token;

    log.d('Successfully renewed token');
};
