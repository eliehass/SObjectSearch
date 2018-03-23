({
    configMap: {
        'anytype': { componentDef: 'ui:inputText', attributes: {} },
        'base64': { componentDef: 'ui:inputText', attributes: {} },
        'boolean': {componentDef: 'ui:inputCheckbox', attributes: {} },
        'combobox': { componentDef: 'ui:inputText', attributes: {} },
        'currency': { componentDef: 'ui:inputText', attributes: {} },
        'datacategorygroupreference': { componentDef: 'ui:inputText', attributes: {} },
        'date': {
            componentDef: 'ui:inputDate',
            attributes: {
                displayDatePicker: true
            }
        },
        'datetime': {
            componentDef: 'ui:inputDateTime',
            attributes: {
                displayDatePicker: true
            }
        },
        'double': { componentDef: 'ui:inputNumber', attributes: {} },
        'email': { componentDef: 'ui:inputEmail', attributes: {} },
        'encryptedstring': { componentDef: 'ui:inputText', attributes: {} },
        'id': { componentDef: 'ui:inputText', attributes: {} },
        'integer': { componentDef: 'ui:inputNumber', attributes: {} },
        'multipicklist': { componentDef: 'ui:inputText', attributes: {} },
        'percent': { componentDef: 'ui:inputNumber', attributes: {} },
        'phone': { componentDef: 'ui:inputPhone', attributes: {} },
        'picklist': { componentDef: 'ui:inputText', attributes: {} },
        'reference': { componentDef: 'ui:inputText', attributes: {} },
        'string': { componentDef: 'ui:inputText', attributes: {} },
        'textarea': { componentDef: 'ui:inputText', attributes: {} },
        'time': { componentDef: 'ui:inputDateTime', attributes: {} },
        'url': { componentDef: 'ui:inputText', attributes: {} }
    },

    createForm: function(component) {
        var fields = component.get('v.fields');
        var objectAPIName = component.get("v.theObjectAPIName");
        var theRecord = component.get("v.theRecord")
        if(!theRecord){
            theRecord = {};
        };
        theRecord.sobjectType = objectAPIName;
        var recordField = component.get("v.recordField");
        var recordFieldValue = component.get("v.recordFieldValue");
        if(recordField && recordFieldValue){
            theRecord[recordField] = recordFieldValue;
        }
        component.set("v.theRecord", theRecord);
        var inputDesc = [];
        var fieldPaths = [];
        for (var i = 0; i < fields.length; i = i + 1) {
            var field = fields[i];
            //need to create a copy instead of referencing the map value
            var config;
            if(field && field.type) {
                config = JSON.parse(JSON.stringify(this.configMap[field.type.toLowerCase()]));
            }
            if (config) {
                if (config.componentDef !== 'force:inputField'){
                    config.attributes.label = field.label;
                    config.attributes.required = field.DBRequired;
                    config.attributes.value = theRecord[field.fieldPath];
                    config.attributes.fieldPath = field.fieldPath;
                    config.attributes.labelClass = field.fieldPath;
                    config.attributes.class = "slds-input";
                    inputDesc.push([
                        config.componentDef,
                        config.attributes
                    ]);
                    fieldPaths.push(field.fieldPath);
                }else{
                    config.attributes.required = field.DBRequired;
                    config.attributes.value = theRecord[field.fieldPath];
                    config.attributes.class = "slds-input";
                    inputDesc.push([
                        config.componentDef,
                        config.attributes
                    ]);
                    fieldPaths.push(field.fieldPath);
                }
            }
        }

        $A.createComponents(inputDesc, function(cmps) {
            var inputToField = {};
            for (var j = 0; j < fieldPaths.length; j = j + 1) {
                if(cmps[j]) {
                    cmps[j].addHandler('change', component, 'c.handleValueChange');
                    cmps[j].addHandler('blur', component, 'c.handleValueChange');
                    inputToField[cmps[j].getGlobalId()] = fieldPaths[j];
                }
            }
            component.set('v.form', cmps);
            component.set('v.inputToField', inputToField);
        });
    },

    getRecordCreateFields : function(component) {
        var objectAPIName = component.get("v.theObjectAPIName");
        var fieldSetName = component.get("v.fieldSetName");
        var action = component.get("c.getDescriptionFieldSetFields");

        action.setParams({
            sObj: objectAPIName,
            fieldsetName: fieldSetName
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var fields = response.getReturnValue();
                component.set("v.fields", fields);
                this.createForm(component);
            }
        });
        $A.enqueueAction(action);
    },

    insertTheRecord : function(component, theRecord) {
        var action = component.get("c.createRecord");
        action.setAbortable();

        action.setParams({
            newRecord: theRecord
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            var form = component.get("v.form");
            if (state === "SUCCESS") {
                var returnedRecord = response.getReturnValue();
                component.set("v.theRecord", returnedRecord);
                var recordCreatedEvent = $A.get("e.c:recordCreated");
                recordCreatedEvent.setParams({
                    "recordId": returnedRecord.Id,
                    "parentId": component.get("v.parentId")
                });
                recordCreatedEvent.fire();
                component.set("v.displayModal", "false");
                var i;
                for(i = 0; i < form.length; i = i + 1){
                    form[i].set("v.value", "");
                    form[i].set("v.errors", null);
                }
                this.clearErrors(component);
                var objectAPIName = component.get("v.theObjectAPIName");
                theRecord = {};
                theRecord.sobjectType = objectAPIName;
                component.set("v.theRecord", theRecord);
                component.set("v.disableSave", false);
            } else if (state === "ERROR") {
                component.set("v.disableSave", false);
                var errors = response.getError();
                var objectLabel = component.get("v.theObjectLabel");
                if (errors) {
                    if(errors[0] && errors[0].fieldErrors){
                        for (var property in errors[0].fieldErrors) {
                            if (errors[0].fieldErrors.hasOwnProperty(property)) {
                                var j;
                                for(j = 0; j < form.length; j = j + 1){
                                    if(form[j].get("v.labelClass") === property){
                                        form[j].set("v.errors", [{message: errors[0].fieldErrors[property][0].message}]);
                                    }
                                }
                            }
                        }
                    }
                    var errorMessages = [];
                    var error = {};
                    if (errors[0] && errors[0].message) {
                        error.message = errors[0].message;
                        errorMessages.push(error);
                        this.displayErrors(component, errorMessages, objectLabel + ' ' + 'could not be saved.', "error", "errorMessageComponent");
                    }
                    if(errors[0] && errors[0].pageErrors){
                        var pageErrors = errors[0].pageErrors;
                        var k;
                        for(k = 0; k < pageErrors.length; k = k + 1){
                            error.message = pageErrors[k].message;
                            errorMessages.push(error);
                        }
                        this.displayErrors(component, errorMessages, objectLabel + ' ' + 'could not be saved.', "error", "pageErrorMessageComponent");
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },

    clearErrors : function(component){
        var errorMessageComponentDiv = component.find("errorMessageComponent");
        errorMessageComponentDiv.set("v.body", []);
        var pageErrorMessageComponentDiv = component.find("pageErrorMessageComponent");
        pageErrorMessageComponentDiv.set("v.body", []);
    }
})