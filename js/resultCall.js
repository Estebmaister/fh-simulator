// This function starts loading the JS file after loading the page to avoid blank waiting time
window.onload = function(){
    setTimeout(function(){
        var scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = "../js/bundle.js";
        document.head.appendChild(scriptElement);
    }, 2000);
};