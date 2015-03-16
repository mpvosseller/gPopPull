
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


// when button is pressed
chrome.browserAction.onClicked.addListener(function(tab) {

// seems "rid", "_reqid" change every time but google doesn't complain about it not changing
// "at" changes after logging out and throws a Internal Server Error if we don't update it
// use act=cma_2 or act=cma_1 to check different accounts

    getCookies("https://mail.google.com/mail/u/0", "GMAIL_AT", function(id) {        
        var sessionAuthorizationKey = id;
        var url = "https://mail.google.com/mail/u/0/?ui=2&ik=246937ba7b&rid=b08b..&at=" + sessionAuthorizationKey + "&view=up&act=cma_2&_reqid=551123&pcd=1&mb=0&rt=c";
        httpGet(url); 
    });
});
