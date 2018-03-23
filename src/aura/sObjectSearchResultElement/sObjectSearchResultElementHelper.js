({
    setField : function(component, fieldToSet, labelToSet, theField, theType, theLabel, theRecord) {
        if(theRecord && theRecord["fields"] && theRecord["fields"][theField]) {
            if (theType === 'DATETIME' || theType === 'DATE') {
                var theDateTime = theRecord["fields"][theField]["displayValue"];
                if (theDateTime) {
                    var theDate = new Date(theDateTime);
                    component.set(fieldToSet, theDate.toDateString());
                }
            } else if (theType === 'REFERENCE') {
                if(theField.indexOf('__c') !== -1) {
                    theField = theField.replace('__c', '__r');
                }else{
                    theField = theField.replace('Id', '');
                }
                component.set(fieldToSet, theRecord["fields"][theField]["displayValue"]);
            } else if (theType !== 'TEXTAREA') {
                if(theRecord &&  theRecord["fields"] && theRecord["fields"][theField] && theRecord["fields"][theField]["value"]) {
                    component.set(fieldToSet, theRecord["fields"][theField]["value"]);
                }
            }
            component.set(labelToSet, theLabel);
        }
    }
})