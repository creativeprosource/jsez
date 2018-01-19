/********************************
 Jsez.js version 1.0.0 2018/01/03
 ********************************/

class Jsez {

    static initEvent(selector, eventType, eventHandler) {  // create new event

        const events = ['load', 'resize', 'scroll', 'unload', 'blur', 'focus', 'change', 'reset', 'select', 'submit',
            'copy', 'cut', 'paste', 'keydown', 'keypress', 'keyup', 'click', 'contextmenu', 'dblclick', 'mousedown',
            'mousemove', 'mouseout', 'mouseover', 'mouseup', 'right click', 'scrolling'];
        try {

            if (typeof selector == 'undefined' || events.indexOf(eventType.toLowerCase()) == -1 || typeof eventHandler != 'function') {
                throw 'initEvent has undefined paramater';
            }
            let elements = Jsez.selectElements(selector); // gets collection of elements to apply event to
            if (!elements) throw 'no matching elements found';
            for (let element of elements) {
                Jsez.addEventHandler(element, eventType, eventHandler);
            }
            return true;
        } catch (error) {
            return Jsez.handleError(error);
        }
    }

    static initSubmit(id, resultHandler) { // create new form submit event
        try {
            if (typeof id == 'undefined' || typeof resultHandler != 'function')
                throw 'initSubmit has an undefined paramater';

            let element = Jsez.selectElements(id);

            if (!element || element.tagName.toUpperCase() !== 'FORM')
                throw `${id} is not a FORM`;

            Jsez.addEventHandler(element, 'submit', Jsez.handleFormSubmit);

        } catch (error) {
            return Jsez.handleError(error);
        }
    }

    static handleFormSubmit(selector, callBack) {
        let [element] = Jsez.selectElements(selector);
        let perams = Jsez.formData(element); // get data from form with id
        let className = element.getAttribute("name");
        let url = element.getAttribute("action");
        let method = element.getAttribute("method");
        Jsez.ajax(className, 'submit', callBack, perams, method, url);
        return false;
    }

    static httpReq() {
        let xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        return xmlhttp;
    }

    static ajax(className, methodCalled, callBack, parametersArray = null, method = 'POST', url = 'webService.php', async = true) {

        let vMethod = Jsez.validMethod(method);
        let URL = url;
        let args = '';
        let request = Jsez.httpReq();
            args = Jsez.appendUrlData(args, 'className', className);
            args = Jsez.appendUrlData(args, 'methodCalled', methodCalled);
            args = Jsez.appendUrlData(args, 'parametersArray', JSON.stringify(parametersArray));
        if (vMethod == 'GET') {
            URL += '?' + args;
        }
        request.open(vMethod, URL, async);

        request.onreadystatechange = function () {
            let result = false;
            if (request.readyState == 4) {
                try {
                    if (request.status == 200) {
                        let response = request.responseText;
                        try {
                            result = JSON.parse(response);
                        } catch (error) {
                            throw response;
                        }
                        callBack(result);
                    }
                    else if (request.status == 404) {
                        throw URL + " not found";
                    }
                    else {
                        throw request.statusText;
                    }

                } catch (error) {
                    callBack([false, error.message]);
                }
            }
        }

        if (vMethod == 'GET') {
            request.send();
        } else
        {
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send(args);
        }
    }

    static formData(form) {  // form is the element object of the form
        let data = {};
        var selected = [];
        try {
            for (let formInput of form) {
                switch (formInput.type) {
                    // these can have multiple inputs
                    case 'checkbox':
                    case 'radio':
                        let group = document.getElementsByName(formInput.name);
                        selected = [];
                        for (let groupItem of group) {
                            if (groupItem.checked) {
                                selected.push(groupItem.value);
                            }
                        } // end for group
                        data[formInput.name] = selected;
                        break;
                    case "select-multiple":
                        selected = [];
                        for (let option of formInput.options) {
                            if (option.selected) {
                                selected.push(option.value);
                            }
                        } // end for
                        data[formInput.name] = selected;
                        break;
                    // these have single inputs
                    case 'select':
                    case 'text':
                    case 'textarea':
                    case 'color':
                    case 'date':
                    case 'datetime':
                    case 'datetime-local':
                    case 'email':
                    case 'file':
                    case 'hidden':
                    case 'image':
                    case 'month':
                    case 'number':
                    case 'password':
                    case 'range':
                    case 'search':
                    case 'tel':
                    case 'text':
                    case 'time':
                    case 'url':
                    case 'week ':
                        if (formInput.name) {
                            data[formInput.name] = formInput.value;
                        }
                        break;
                    // these require no value to be recorded
                    case 'button':
                    case 'submit':
                    case 'reset':
                        // no data to collect on these
                        break;
                    default:
                        throw formInput.type + ' input type not recognized';
                        break;
                } // end switch
            } // end while form
        } catch (error) {
            return Jsez.handleError(error);
        }
        return data;
    }

    static selectElements(selector) {
        // selects elements by class, id, css selector, or object and returns an array
        let elements = false;
        try {
            if (typeof selector == 'undefined') {
                throw 'Missing Selector';
            }
            switch (typeof selector) {
                case 'string':
                    switch (selector.charAt(0)) {
                        /*
                         case '#':
                         elements = document.getElementById(selector.substring(1));
                         break;
                         case '.':
                         elements = document.getElementsByClassName(selector.substring(1));
                         break;
                         */
                        default:
                            elements = document.querySelectorAll(selector);
                            break;
                    }
                    break;
                case 'object':
                    elements[0] = selector;
                    break;
                default:
                    throw 'Type of selector is not an object or string';
            }

            if (!elements) throw 'No matching elements found'
            return elements;
        } catch (error) {
            return Jsez.handleError(error);
        }
    }

    static addEventHandler(element, eventType, eventHandler) { // create single event
        try {
            if (element.addEventListener)  // all browsers except IE before version 9
                element.addEventListener(eventType, eventHandler, false);
            else if (element.attachEvent) // IE before version 9
                element.attachEvent('on' + eventType, eventHandler);
            return true;
        } catch (error) {
            return Jsez.handleError(error);
        }
    }

    static getEventTarget(event) {
        let evt = event || window.event;  //all browsers except IE before version 9 OR window.event for IE before ie9
        let target = evt.target || evt.srcElement; // Target for most browsers or srcElement IE before ie9
        return ((typeof target == 'object') ? target : false);
    }

    static appendUrlData(urlData, name, value) {
        return urlData + ((urlData > '') ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }

    static nameToMsg(str = '') { // converts lowercase, hyphen separated input name to space separated Word Capitalized

        let splitStr = str.toLowerCase().split('-');
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    }

    static validMethod(method) {
        method = method.toUpperCase();
        var methods = ['POST', 'GET'];
        if (methods.indexOf(method) > -1) {
            return method;
        }
        return 'POST';
    }

    static handleError(error) {
        console.log('ERROR @ line' + error.lineNumber + ' : ' + error.message);
        return false;
    }

}