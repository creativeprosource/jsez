/**
 * validation is handled by a comma separated "validate" attribute on the input i.e. validate="required,phone-usa"
 * If required, the "required" flag should be the first in the comma separated list.
 * a class of "formdata" is required on all inputs to be validated and passed to the server through AJAX to be handled.
 */
class Validation {

    validate(item, type) {// this does the validation

        var err = 0;
        var name = item.attr('name');
        var value = item.val();
        var msg = "";
        switch (type) {
            case 'required':
                if (value == '' || value === undefined) {
                    err = 1;
                    msg = this.nameToMsg(name) + " is a required field.";
                }
                break;
            case 'phone-usa':
                if (!value.match(/^\d\d\d\-\d\d\d-\d\d\d\d$/)) {
                    err = 1;
                    msg = "Please enter a valid phone number";
                }
                break;
            // Add more validation types below
        }
        if (err > 0) {
            item.addClass('invalid');
        }
        $("#" + name + "-err-message").text(msg);
        // console.log( name+' '+value+' '+type+((err != 0)?' ERROR':' OK') );
        return err;
    }

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

    nameToMsg(str) { // converts lowercase, hyphen separated input name to space separated Word Capitalized

        let splitStr = str.toLowerCase().split('-');
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    }

}