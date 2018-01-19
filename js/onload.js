window.onload = function() {

    // creation of event  ( css selector or element object,event type, handler function )
    Jsez.initEvent('.button', 'click', function (event){
         event.preventDefault();
        let element = Jsez.getEventTarget(event);
        console.log('Element ' + element.id + ' was clicked');
    });

    Jsez.initEvent('#submit', 'click', function (event){
        event.preventDefault();
        let results = Jsez.handleFormSubmit('#form', function(results){
            console.log('results = ' + results);
        });

    });

    // validate input on change
    // Jsez.initEvent('#form [validate]','change',function(event) {
    //     Jsez.doValidation(Jsez.getEventTarget(event));
    // });
};