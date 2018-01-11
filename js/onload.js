window.onload = function() {

    // creation of event  ( css selector or element object,event type, handler function )
    JSez.initEvent('.button', 'click', feedback);

    JSez.initSubmit('#form',  // form id css selector
        function(results) { // handler function
            // put all your results handling code here

            console.log('results = ' + results);
        },
        'POST',   	// method:  'POST', 'GET', or 'FORM' to use method attribute set in form. Defaults to FORM or POST if not set on form
        'JSON', 	// datatype: 'DEFAULT', 'JSON' or 'URL' uses default form submission or jason object or url query string. Defalts to DEFAULT
        true,   	// ASYNC = true
        true    	// preventDefault = true
    );  // end initEvent

    // validate input on change
    JSez.initEvent('#form [validate]','change',function(event) {
        JSez.doValidation(JSez.getEventTarget(event));
    });
};

function feedback(event) { // Basic template for events
    event.preventDefault();  // remove this line allow default actions like form submission or links going to href

    let element = JSez.getEventTarget(event);

    alert('Element ' + element.id + ' was clicked');

    return false;
}
