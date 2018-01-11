// JavaScript Document

/*********************
J$ex.js version 0.02 2018/01/03
By Dave Bailey 
http://creativeprosource.com

j$ex is a JavaScript, Eventhandler & XMLHttpRequest Library.
It is intended to be a light, adaptable way to handle 
non invasive javascript events and AJAX
************************/

var j$ex = {
	
addEventHandler: // create single event
function addEventHandler(element,eventType,eventHandler) {

 if (element.addEventListener)
     element.addEventListener (eventType,eventHandler,false);
 else if (element.attachEvent)
     element.attachEvent ('on'+eventType,eventHandler); 
},


selectElements: // selects elements by class, id, tag, or object and returns an array
function(selector) {
		var elements=new Array();
		if (typeof selector == 'undefined'){return false;}
switch  (typeof selector) {
case "string": 
	 switch (selector.charAt(0)) {
		 case '#': // if selector starts with # get elements array with id 
			 elements[0]=document.getElementById(selector.substring(1));
			 return elements;
			 break;
		 case '.': // if selector starts with . get elements array with class
			 elements=document.getElementsByClassName(selector.substring(1));
			 return elements;
			 break;		 
		 default: // get elements array with tag name
			 elements=document.getElementsByTagName(selector);
			 return elements;
			 break;
	 }
	break;
case "object": 
	elements[0]=selector;
	return elements;
	break;
default: 	
this.e("type of selector is not an object or string");
return false;
} // end switch
},// end select elements



initEvent: // create new event
function(selector,eventType,eventHandler) {

if (typeof selector == 'undefined' || typeof eventType == 'undefined'  || typeof eventHandler != 'function'){this.e("initEvent has undefined paramater");return false;}
var elements=this.selectElements(selector); // gets an array of elements to apply event to
var events = ['load','resize','scroll','unload','blur','focus','change','reset','select','submit','copy','cut','paste','keydown','keypress','keyup','click','contextmenu','dblclick','mousedown','mousemove','mouseout','mouseover','mouseup','right click','scrolling'];

var el=elements.length;

if (el >0 ) {
for (var i = 0; i < el; i++) {
	this.addEventHandler(elements[i],eventType,eventHandler); 
	}
return true;
}
this.e("initEvent has no matching element to add event to");
return false;
}, // end initEvent



initSubmit: // create new form submit event
function(id,resulthandler,method,encode,async,noDefault) {

if (typeof id == 'undefined' || typeof resulthandler != 'function'){this.e("initSubmit has undefined paramater");return false;}
// Set default paramaters if not set
if (typeof method == 'undefined' ) {encode = "FORM";}
if (typeof encode == 'undefined' ) {encode = "DEFAULT";}
if (typeof async == 'undefined' )  {async=true;}
if (typeof noDefault == 'undefined' ){noDefault=true;}

if (method.toUpperCase()=="FORM") {method=data.form.method.toUpperCase();}
method=this.validmethod(method)
if (!method){return false;}

var element;
switch  (typeof id) {
case "string": 
	 switch (id.charAt(0)) {
		 case '#': // if selector starts with # get elements array with id 
			 element=document.getElementById(id.substring(1));
			 break;
		 default: // get elements array with tag name
				this.e("type of selector is not an ID");
				return false;
			 break;
	 }
	break;
case "object": 
	element=id;
	break;
default: 	
this.e("type of selector is not an object or string");
return false;
} // end switch

if (element.tagName.toUpperCase() != "FORM") {this.e("Element is not a FORM");return false;}

 		
this.addEventHandler(element,'submit',function (eventObj){
	// this is the form submit event handler													
	eventObj = eventObj || window.event;  //event object is first argument passed or window event for before ie9
	var element = eventObj.target || eventObj.srcElement; // Gets object causing event. target for most browsers or srcElement for ie 
	if (noDefault){eventObj.preventDefault(); } //prevent default form submission
	
	var data=j$ex.formData(element); // get data from form with id

var datastring;	
switch (encode.toUpperCase()) {
	case "JSON":
		datastring="json="+JSON.stringify(data.obj);
		break;
	case "URL":
	case "DEFAULT":
		datastring=data.url;
		break;
} // end switch

j$ex.sendhttp(method,data.form.action,datastring,resulthandler,async);
return false;
}); // end add handler event

}, // end initSubmit	

e: // error handling
function (errorMessage){alert("j$ex ERROR:"+errorMessage);},

httpReq: 
function() {
	var xmlhttp;
if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  } else   {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
return xmlhttp;
}, // end httpReq

validmethod:
function (method) {
	var methods=["POST","GET","PUT","DELETE"];
	if (methods.indexOf(method.toUpperCase()) > -1) {return method.toUpperCase();} 
	this.e("Invalid http method");
	return false;
},
sendhttp: // submit a http request
function (method,url,data,handler,async){
if (async="undefined"){async=true;}
method=this.validmethod(method)
if (!method){return false;}
var xmlhttp=this.httpReq();	
xmlhttp.onreadystatechange=function()
  {
	  if (xmlhttp.readyState==4) {
		  if (xmlhttp.status==200){handler(xmlhttp.responseText); return true;} 
		  else if (xmlhttp.status==404){this.e("404 "+url+" not found"); return false;}
		  else {this.e("Sorry an error occured"); return false;}
	  }
  }

switch (method) {
		case "GET":
			xmlhttp.open("GET",url+'?'+data,async);
			xmlhttp.send(); 
		break;
		case "POST":
		case "PUT":
		case "DELETE":
			xmlhttp.open(method,url,async);
			xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xmlhttp.send(data);
			break;
		default:
			this.e("Invalid http method");
		break;
}

}, // end sendhttp

formData:
function (form){ // form is the element object of the form
	
  var data = {
	  form: form,
	  obj:{},
	  url: ""
	  };
  var i = 0;
  var si = 0;
  while (  i < form.length ) {
	switch(form[i].type){
	// these can have multiple inputs
	case "checkbox":
	case "radio":
		var name=form[i].name;
		var selected="";
		var gi=0;
		var group = document.getElementsByName(form[i].name);
		var selected = [];
		for (var g = 0; g < group.length; g++) 
			{
				if (group[g].checked)
				{
					selected.push(group[g].value);
					gi++;
				}	
			} // end for group
		data.obj[name] = selected;
		if (si>0) {data.url+="&";}
		data.url += encodeURIComponent(name)+"="+encodeURIComponent(selected);
        si++;
		delete group;
		delete name;
		delete selected;
		delete gi;
		break;
		
	case "select-multiple":
		var name=form[i].name;
		var selected=[];
		var gi=0;
		for (var g = 0; g < form[i].options.length; g++)
		{
        	if (form[i].options[g].selected)
        	{
				selected.push(form[i].options[g].value);
				gi++;
			}
		} // end for
		data.obj[name] = selected;
		if (si>0) {data.url+="&";}
		data.url += encodeURIComponent(name)+"="+encodeURIComponent(selected);
		si++;
		delete name;
		delete selected;
		delete gi;
		break;
	// these have single inputs
	case "select":
	case "text":
	case "textarea":
	case "color":
	case "date":
	case "datetime":
	case "datetime-local":
	case "email":
	case "file":
	case "hidden":
	case "image":
	case "month":
	case "number":
	case "password":
	case "range":
	case "search":
	case "tel":
	case "text":
	case "time":
	case "url":
	case "week ":
		if (form[i].name) {data.obj[form[i].name] = form[i].value;}
		if (si>0) {data.url+="&";}
		data.url = data.url+encodeURIComponent(form[i].name)+"="+encodeURIComponent(form[i].value);
		si++;
		break;
	// these require no value to be recorded
	case "button":
	case "submit":
	case "reset":
		// no data to collect on these
	break;
	default:
	this.e("input type not recognized");
		i++;
		break;		
	} // end switch
	i++;
  } // end while form
   return data;
}

} /********************* end j$ex ********************************************************/




function feedback(eventObj){ // Basic template for events
	eventObj = eventObj || window.event;  //event object is first argument passed or window event for before ie9
	var element = eventObj.target || eventObj.srcElement; // Gets object causing event. target for most browsers or srcElement for ie 
// eventObj.preventDefault();  // uncoment out this line to prevent default actions from happening like forms submission or links going to href
// Put all your Javascript below here

alert(element.id+" was clicked");

// put all your javascript above here
	return false;
}


window.onload=function() {
 j$ex.initEvent(".button",'click',feedback); // sample creation of event ( selector,event type, handler function ) selectors can be '#id', '.class', 'TAG' or object
 
 j$ex.initSubmit("#form",function submitresults(results) { // '#formID' or form element, handler function
	// put all your event handling code here
	
	alert("results = "+results);
	
}, // end handler function
'POST',   	// method:  'POST', 'GET', 'PUT', 'DELETE', or 'FORM' to use method of form. defaults to form
'JSON', 	// datatype: 'DEFAULT', 'JSON' or 'URL' uses default form submission or jason object or url query string. Defalts to DEFAULT
true,   	// ASYNC = true
true    	// preventDefault = true
);  // end initEvent
 };

	
	
	
	
