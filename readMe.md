  ##JSez.js
  ### version: 1.0.0 2018/01/03
  ####Author: Dave Bailey
  **Link: _http://creativeprosource.com_**
  

 JSez is a JavaScript, Eventhandler and XMLHttpRequest Library.
 It is intended to be a light, adaptable way to handle
 non invasive javascript events, AJAX and form validation.
 
 To use JSez include the file in your document.
 ```HTML
 <script src='js/classes/JSez.js'></script>
 ```
Below are examples of how to use JSez.
 ```javascript
 <script>
 window.onload = function() {
 
     // creation of event  ( css selector or element object,event type, handler function )
     JSez.initEvent('.button', 'click', feedback);
 
 
     JSez.initSubmit('#form',  // form id css selector
          function(results) { // handler function
             // put all your form results handling here
             console.log('results = ' + results);
         },
         /* method:  'POST', 'GET', or 'FORM'.  
           'FORM' uses the method attribute of the form. 
            Defaults to FORM or POST if not set on form 
         */
         'POST',
         'JSON', 	// datatype: 'JSON' or 'URL' Defalts to 'JSON'         
         true,   	// ASYNC = true
         true    	// preventDefault = true
     );  // end initEvent
 
     // validate a form input on change
     JSez.initEvent('.formdata','change',function(event) {
         JSez.doValidation(JSez.getEventTarget(event));
     });
 };
 
 // Basic example of an event handler function
 function feedback(event) {
     var element = JSez.getEventTarget(event)
     event.preventDefault();  // remove this line allow default actions like form submission or links going to href
 
     alert('Element ' + element.id + ' was clicked');
 
     return false;
 }
  </script>
```
 
JSez methods

**addEventHandler(element, eventType, eventHandler)**<br>
creates a single event. Returns true for success false if an error occured.<br>
element: css selector or element object
eventType: 'load', 'resize', 'scroll', 'unload', 'blur', 'focus', 'change', 'reset', 'select', 'submit', 'copy', 'cut', 'paste', 'keydown', 'keypress', 'keyup', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'right click', 'scrolling'
eventHandler: function

**selectElements(selector)**<br>
Returns an array of element objects that match the css selector passed to the function or false if none found or other error occurred.
