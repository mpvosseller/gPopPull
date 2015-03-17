
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

// refresh the pop3 account
function popPull() {
// in normal gmail use "_reqid" and "rid" change every time. Google doesn't complain if we don't change them.
// "at" is taken from the GMAIL_AT session cookie (the Session Authorization Key"). If this value is wrong Google 
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

// pull any time the refresh button is pressed
chrome.pageAction.onClicked.addListener(function(tab) {
    popPull();
});

// enable this pageAction on "mail.google.com" only
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('https://mail.google.com') == 0) {
        chrome.pageAction.show(tabId);
    }
});
