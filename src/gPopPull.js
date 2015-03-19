
// fetch a URL
function httpGet(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

// get a cookie
function getCookie(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        callback(cookie.value);
    });
}

// get the session auth key cookie (GMAIL_AT) 
function getSessionAuthKeyCookie(callback) {    
    getCookie("https://mail.google.com/mail/u/0", "GMAIL_AT", function(sessionAuthKey) {
        callback(sessionAuthKey);
    });    
}

// the url to hit to refresh a given account
function getPop3PullUrl(accountIdx, callback) {    
    // in normal gmail use parameters like "_reqid" and "rid" change each time but google doesn't seem to complain if they don't
    // the "at" parameter must match the "session auth key cookie" GMAIL_AT (or it causes an google internal server error)
    // the "act" specifies the id to the account to pull from "act=cma_2" and "act=cma_1" are my two
    getSessionAuthKeyCookie(function(sessionAuthKey) {
        var url = "https://mail.google.com/mail/u/0/?ui=2&ik=246937ba7b&rid=b08b..&at=" + sessionAuthKey + "&view=up&act=cma_" + accountIdx + "&_reqid=551123&pcd=1&mb=0&rt=c";
        callback(url);
    });    
}

// the url to find out what pop3 accounts the user has
function getAccountsUrl(callback) {
    getSessionAuthKeyCookie(function(sessionAuthKey) {
        var url = "https://mail.google.com/mail/u/0/?ui=2&ik=246937ba7b&rid=eefa..&at=" + sessionAuthKey + "&view=up&act=rap&_reqid=1366360&pcd=1&mb=0&rt=j";
        callback(url);
    });   
}

// fetch the pop3 accounts
function getAccounts(callback) {

    getAccountsUrl(function(url) {

        // get the account list data
        var str = httpGet(url);

        // get just the "ama" section (assumes following section is "a")
        // useful regex tool: https://regex101.com
        str = str.match(/.*,\["ama",(.|\n)*,\["a",/g);        

        // parse out each account (index and label)
        var accountArray = [];
        var regex = /.*?\[(\d),\"(.*?@.*?)\"/g;
        var match;
        while ((match = regex.exec(str)) != null) { 
            var index = match[1];
            var label = match[2];        
            var account = {"index":index, "label":label};      
            accountArray.push(account);
        }

        callback(accountArray);        
    });    
}

// print pop3 accounts to screen
function dumpAccounts() {
    getAccounts(function(accountArray) {
        var arrayLength = accountArray.length;
        for (var i = 0; i < arrayLength; i++) {
            var account = accountArray[i];
            console.log("account.index=" + account["index"] + " account.label=" + account["label"]);
        }
    });
}

// pull a pop3 account with this index
function popPullAccount(accountIdx) {
    getPop3PullUrl(accountIdx, function(url) { 
        httpGet(url); 
    });
}

// refresh the pop3 account
function popPullAllAccounts() {    
     getAccounts(function(accountArray) {
        var arrayLength = accountArray.length;
        for (var i = 0; i < arrayLength; i++) {
            var account = accountArray[i];
            popPullAccount(account["index"]);
        }
    });
}

function popPull() {
    popPullAllAccounts();
}

// pull every 60 seconds
setInterval(function() {
    popPull()
}, 60000);

// pull any time the refresh button is pressed
chrome.pageAction.onClicked.addListener(function(tab) {
    popPull();
});

// enable this pageAction on "mail.google.com" only
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('https://mail.google.com') == 0) {
        chrome.pageAction.show(tabId);
        popPull();
    }
});

