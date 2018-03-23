({
    doInit : function(component, event, helper){
        helper.getRecordCreateFields(component);
    },

    saveRecord : function(component, event, helper) {
        component.set("v.disableSave", true);
        helper.clearErrors(component);
        var theRecord = component.get("v.theRecord");
        var form = component.get("v.form");
        for(var i = 0; i < form.length; i = i + 1){
            form[i].set("v.errors", null);
        }
        helper.insertTheRecord(component, theRecord);
    },

    closeModal : function(component, event, helper) {
        component.set("v.displayModal", "false");
        helper.clearErrors(component);
        var form = component.get("v.form");
        for(var i = 0; i < form.length; i = i + 1){
            form[i].set("v.value", "");
            form[i].set("v.errors", null);
        }
    },

    handleValueChange: function(component, event) {
        var inputToField = component.get('v.inputToField');
        var field = inputToField[event.getSource().getGlobalId()];
        var theRecord = component.get('v.theRecord');
        if (!theRecord[field]) {
            // Have to make a copy of the object to set a new property - thanks LockerService!
            theRecord = JSON.parse(JSON.stringify(theRecord));
        }
        theRecord[field] = event.getSource().get('v.value');
        component.set('v.theRecord', theRecord);
    }
})