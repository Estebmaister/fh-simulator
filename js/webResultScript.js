// This function starts loading the JS file after loading the page to avoid blank waiting time
window.onload = function(){
    setTimeout(function(){
        // Creating and adding the script element in the html file
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = "../js/bundle.js";

        // Before appending the script, calls attention to see the console in case of a failure in the script
        const outputElement = document.getElementById("output-com");
        if (outputElement) {
            outputElement.textContent = 'Is this taking too long? check the console log for debugging.';
        }
        document.head.appendChild(scriptElement);
    }, 20);
};