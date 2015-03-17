
// fetch a URL
function httpGet(theUrl) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// get a cookie
function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}

// refresh our pop3 account
function popPull() {
// in normal gmail use "rid" and "_reqid" change every time. Google doesn't seem to complain if they stay the same though.
// "at" is taken from the GMAIL_AT session cookie (the Session Authorization Key". If this value is wrong Google 
// returns an internal server error
// "act" specifies which account to pull "act=cma_2" and "act=cma_1" are my two accounts
    getCookies("https://mail.google.com/mail/u/0", "GMAIL_AT", function(id) {        
        var sessionAuthorizationKey = id;
        var url = "https://mail.google.com/mail/u/0/?ui=2&ik=246937ba7b&rid=b08b..&at=" + sessionAuthorizationKey + "&view=up&act=cma_2&_reqid=551123&pcd=1&mb=0&rt=c";
        httpGet(url); 
    });
}

// pull every 60 seconds
setInterval(function() {popPull()}, 60000);

// also pull any time the refresh button is pressed
chrome.browserAction.onClicked.addListener(function(tab) {
    popPull();
});

