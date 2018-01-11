/********************************
 JSez.js version 0.02 2018/01/03
 ********************************/

class JSez {

    initEvent(selector, eventType, eventHandler) {  // create new event

        const events = ['load', 'resize', 'scroll', 'unload', 'blur', 'focus', 'change', 'reset', 'select', 'submit',
            'copy', 'cut', 'paste', 'keydown', 'keypress', 'keyup', 'click', 'contextmenu', 'dblclick', 'mousedown',
            'mousemove', 'mouseout', 'mouseover', 'mouseup', 'right click', 'scrolling'];
        try {

            if (typeof selector == 'undefined' || events.indexOf(eventType.toLowerCase()) > -1 || typeof eventHandler != 'function') {
                throw 'initEvent has undefined paramater';
            }

            let elements = this.selectElements(selector); // gets collection of elements to apply event to
            if (!elements) return false;

            for (let [element] of elements) {
                this.addEventHandler(element, eventType, eventHandler);
            }
            return true;
        } catch (error) {
            return this.handleError(error);
        }
    }

    initSubmit(id, resultHandler) { // create new form submit event
        try {
            if (typeof id == 'undefined' || typeof resultHandler != 'function')
                throw 'initSubmit has an undefined paramater';

            let element = this.selectElements(id);

            if (!element || element.tagName.toUpperCase() !== 'FORM')
                throw `${id} is not a FORM`;

            this.addEventHandler(element, 'submit', this.handleFormSubmit(event));

        } catch (error) {
            return this.handleError(error);
        }
    }

    handleFormSubmit(event) {
        event.preventDefault(); //prevent default form submission
        let element = this.getEventTarget(event);
        let data = this.formData(element); // get data from form with id

        let className = data.form.name;
        let url = data.form.action;
        let params = null;
        let method = data.form.method;
        
        method = this.validMethod(method);

        switch (method) {
            case 'GET':
                url = data.url;
                break;
            case 'POST':
            default:
                params = data.obj;
                break;
        }

        let promise = this.ajax(className,'submit', params, method, url);
        promise.then( function(results) {
            return results;
        }, function(error) {
            return error;
        });

    }

    httpReq() {
        let xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        return xmlhttp;
    }

    ajax(className, methodCalled, parametersArray = null, method = 'POST', url = 'webService.php', async = true) {
        let args = null;
        method = this.validMethod(method);
        console.log(className, methodCalled);
        return new Promise((resolve, reject) => {

         let request = this.httpReq();

            if (method == 'GET' && typeof parametersArray === 'object' && parametersArray !== null) {
                url += '?className=' + className + '&methodCalled=' + methodCalled;
                for (let [key, value] of parametersArray) {
                    url += '&' + key + '=' + value;
                }
                url = encodeURI(url);
            }
            else {
                method = 'POST';
                args.className = className;
                args.methodCalled = methodCalled;
                args.parametersArray = (typeof parametersArray === 'object' && parametersArray !== null )
                    ? JSON.stringify(parametersArray)
                    : parametersArray;
            }
            request.open(method, url, async);
            request.onerror = () => reject(request.statusText);
            request.onload = () => {

                if (request.status === 200) {

                    let data = request.responseText;
                    try {
                        data = JSON.parse(data);
                    } catch (error) {
                        if (data === null || data === 'null') {
                            data = array(true,'Success');
                        }
                        else if (typeof data !== 'object') {
                            data = array(this.handleError(data),data);
                        }
                    }
                    if (data[0] === true) {
                        resolve(data)
                    }
                    else {
                        reject(data);
                    }
                } else {
                    reject(array(this.handleError(request.statusText),request.statusText));
                }
            }
            request.send(args);
        });
    }

    formData(form) {  // form is the element object of the form

        let data = {
            form: form,
            obj: {},
            url: form.action + '?'
        };
        let selectedIndex = 0;
        for (let [formInput] of form) {
            switch (formInput.type) {
                // these can have multiple inputs
                case 'checkbox':
                case 'radio':
                    let group = document.getElementsByName(formInput.name);
                    let selected = [];
                    for (let [groupItem] of group) {
                        if (groupItem.checked) {
                            selected.push(groupItem.value);
                        }
                    } // end for group
                    data.obj[formInput.name] = selected;
                    data.url = this.appendUrlData(data.url, selectedIndex, formInput.name, selected);
                    selectedIndex++;
                    break;

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
                        data.obj[formInput.name] = formInput.value;
                    }
                    data.url = this.appendUrlData(data.url, selectedIndex, formInput.name, formInput.value);
                    selectedIndex++;
                    break;
                // these require no value to be recorded
                case 'button':
                case 'submit':
                case 'reset':
                    // no data to collect on these
                    break;
                default:
                    return this.handleError('input type not recognized');
                    break;
            } // end switch
        } // end while form
        return data;
    }

    selectElements(selector) {
        // selects elements by class, id, css selector, or object and returns an array
        if (typeof selector == 'undefined') {
            return this.handleError('Missing Selector');
        }
        let elements = false;
        try {
            switch (typeof selector) {
                case 'string':
                    switch (selector.charAt(0)) {
                        case '#':
                            elements[0] = document.getElementById(selector.substring(1));
                            break;
                        case '.':
                            elements = document.getElementsByClassName(selector.substring(1));
                            break;
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
            if (elements.length < 1) throw 'No matching elements found'
            return elements;
        } catch (error) {
            return this.handleError(error);
        }
    }

    addEventHandler(element, eventType, eventHandler) { // create single event
        try {
            if (element.addEventListener)  // all browsers except IE before version 9
                element.addEventListener(eventType, eventHandler, false);
            else if (element.attachEvent) // IE before version 9
                element.attachEvent('on' + eventType, eventHandler);
            return true;
        } catch (error) {
            return this.handleError(error);
        }
    }

    getEventTarget(event) {
        let evt = event || window.event;  //all browsers except IE before version 9 OR window.event for IE before ie9
        let target = evt.target || evt.srcElement; // Target for most browsers or srcElement IE before ie9
        return ((typeof target === object) ? target : false);
    }

    appendUrlData(url, index, name, value) {
        return url + ((index < 1) ? '?' : '&') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }

    nameToMsg(str = '') { // converts lowercase, hyphen separated input name to space separated Word Capitalized

        let splitStr = str.toLowerCase().split('-');
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    }
    validMethod(method) {
        method = method.toUpperCase();
        var methods = ['POST', 'GET', 'FORM'];
        if (methods.indexOf(method) > -1) {
            return method;
        }
        return 'POST';
    }
    handleError(errorMessage) {
        console.log('ERROR: ' + errorMessage);
        return false;
    }

}


class ezValidation extends JSez {

    doValidation(item) {
        if (item.attr('validate') === undefined) return 0;
        let errors = 0;
        let err = 0;
        // the validation attribute is a comma separated list of validation types to apply to the input
        let validations = item.attr('validate').split(',');
        validations.forEach(function (type) {
            if (err === 0) {
                item.removeClass('invalid');
                err = this.validate(item, type);
                errors += err;
            }
        });
        return errors;
    }

    validate(item, type) {// this does the validation

        var err = 0;
        var name = item.attr('name');
        var value = item.val();
        var msg = '';
        switch (type) {
            case 'required':
                if (value == '' || value === undefined) {
                    err = 1;
                    msg = this.nameToMsg(name) + ' is a required field.';
                }
                break;
            case 'phone-usa':
                if (!value.match(/^\d\d\d\-\d\d\d-\d\d\d\d$/)) {
                    err = 1;
                    msg = 'Please enter a valid phone number';
                }
                break;
            // Add more validation types below
        }
        if (err > 0) {
            item.addClass('invalid');
        }
        $('#' + name + '-err-message').text(msg);
        // console.log( name+' '+value+' '+type+((err != 0)?' ERROR':' OK') );
        return err;
    }
}

