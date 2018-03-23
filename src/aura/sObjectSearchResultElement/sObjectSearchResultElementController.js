({
    doInit : function(component, event, helper) {
        var theRecord = component.get('v.theRecord');
        if(theRecord && theRecord.Id) {
            component.set("v.recordId", theRecord.Id);
        }
        var resultDescriptionFields = component.get('v.resultDescriptionFields');
        var resultDescriptionTypes = component.get('v.resultDescriptionTypes');
        var resultDescriptionLabels = component.get('v.resultDescriptionLabels');

        if(resultDescriptionFields && resultDescriptionFields.length >= 3){
            helper.setField(component, "v.fieldValueOne", "v.labelValueOne", resultDescriptionFields[0], resultDescriptionTypes[0], resultDescriptionLabels[0], theRecord);
            helper.setField(component, "v.fieldValueTwo", "v.labelValueTwo", resultDescriptionFields[1], resultDescriptionTypes[1], resultDescriptionLabels[1], theRecord);
            helper.setField(component, "v.fieldValueThree", "v.labelValueThree", resultDescriptionFields[2], resultDescriptionTypes[2], resultDescriptionLabels[2], theRecord);

            component.set("v.displayThreeFields", true);
            component.set("v.displayTwoFields", false);
            component.set("v.displayOneField", false);
            component.set("v.displayNoFields", false);
        }else if(resultDescriptionFields && resultDescriptionFields.length === 2){
            helper.setField(component, "v.fieldValueOne", "v.labelValueOne", resultDescriptionFields[0], resultDescriptionTypes[0], resultDescriptionLabels[0], theRecord);
            helper.setField(component, "v.fieldValueTwo", "v.labelValueTwo", resultDescriptionFields[1], resultDescriptionTypes[1], resultDescriptionLabels[1], theRecord);

            component.set("v.displayThreeFields", false);
            component.set("v.displayTwoFields", true);
            component.set("v.displayOneField", false);
            component.set("v.displayNoFields", false);
        }else if(resultDescriptionFields && resultDescriptionFields.length === 1){
            helper.setField(component, "v.fieldValueOne", "v.labelValueOne", resultDescriptionFields[0], resultDescriptionTypes[0], resultDescriptionLabels[0], theRecord);

            component.set("v.displayThreeFields", false);
            component.set("v.displayTwoFields", false);
            component.set("v.displayOneField", true);
            component.set("v.displayNoFields", false);
        }else{
            component.set("v.displayThreeFields", false);
            component.set("v.displayTwoFields", false);
            component.set("v.displayOneField", false);
            component.set("v.displayNoFields", true);
        }
    }
})