({
    sendSelectedRecord : function(component, recordId, parentId) {
        component.set("v.renderResults", false);
        var listName = component.get("v.addRecordTo");
        var recordSelectedEvent = $A.get("e.c:recordSelected");
        var recordName;
        if(recordId && recordId !== ''){
            var records = component.get("v.records");
            var recordIdList = component.get("v.recordIdList");
            var index = recordIdList.indexOf(recordId);
            if(records && records[index]){
                recordName = records[index].Name;
            }
            if(recordName){
                component.set("v.searchTerm", recordName);
            }
        }
        recordSelectedEvent.setParams({
            "recordId": recordId,
            "parentId": parentId,
            "listName": listName,
            "recordName": recordName
        });
        recordSelectedEvent.fire();
    },

    determineResultVisibility : function(component){
        var records = component.get("v.records");
        var hasFocus = component.get("v.hasFocus");
        var searchTermLength = component.get("v.searchTermLength");
        var createOption = component.get("v.createOption");
        if((searchTermLength === 0 || searchTermLength > 2) && (records && records.length > 0 && hasFocus === true)){
            component.set("v.showResultList", true);
        }else if(createOption === false){
            component.set("v.showResultList", false);
        }
    },

    sendCreatedRecord : function(component, recordId, parentId) {
        component.set("v.renderResults", false);
        component.set("v.searchTerm", "");
        var recordCreatedEvent = component.getEvent("createdRecord");
        recordCreatedEvent.setParams({
            "recordId": recordId,
            "parentId": parentId
        });
        recordCreatedEvent.fire();
    },

    getRecords : function(component, sObject, theSearchField, theSearchTerm, limiters) {
        var action = component.get("c.getMatchingRecords");

        action.setStorable();
        action.setBackground();
        action.setAbortable();

        action.setParams({
            sObj: sObject,
            searchField: theSearchField,
            searchTerm: theSearchTerm,
            limiters: limiters
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var records = response.getReturnValue()['sObjectList'];
                var recordIdList = response.getReturnValue()['idList'];
                component.set("v.records", records);
                component.set("v.recordIdList", recordIdList);
            }
        });
        $A.enqueueAction(action);
    },

    getRecentRecords : function(component, sObject) {
        var limiters = component.get("v.limiters");
        var action = component.get("c.getLastViewedRecords");
        action.setStorable();

        action.setParams({
            sObj: sObject,
            limiters: limiters
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var records = response.getReturnValue()['sObjectList'];
                var recordIdList = response.getReturnValue()['idList'];
                component.set("v.records", records);
                component.set("v.recordIdList", recordIdList);
            }
        });
        $A.enqueueAction(action);
    },

    getResultDescriptionFields : function(component) {
        var objectAPIName = component.get("v.objectAPIName");
        var fieldSetName = component.get("v.resultDescriptionFieldSetName");
        var action = component.get("c.getDescriptionFieldSetFields");

        action.setParams({
            sObj: objectAPIName,
            fieldsetName: fieldSetName
        });

        action.setStorable();

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var fields = response.getReturnValue();
                var fieldList = [];
                var typeList = [];
                var labelList = [];
                for(var i = 0; (i < fields.length && i < 3); i = i + 1){
                    fieldList.push(fields[i].fieldPath);
                    typeList.push(fields[i].type);
                    labelList.push(fields[i].label);
                }
                component.set("v.resultDescriptionFields", fieldList);
                component.set("v.resultDescriptionTypes", typeList);
                component.set("v.resultDescriptionLabels", labelList);
            }
        });
        $A.enqueueAction(action);
    },

    getSearchFields : function(component) {
        var objectAPIName = component.get("v.objectAPIName");
        var fieldSetName = component.get("v.searchFieldsFieldSetName");
        var action = component.get("c.getDescriptionFieldSetFields");

        action.setParams({
            sObj: objectAPIName,
            fieldsetName: fieldSetName
        });

        action.setStorable();

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var fields = response.getReturnValue();
                this.setFields(component, fields, "searchFieldAPIName");
            }
        });
        $A.enqueueAction(action);
    },

    setFields : function(component, fields, attributeName){
        var fieldList = [];
        for(var i = 0; (i < fields.length); i = i + 1){
            fieldList.push(fields[i].fieldPath);
        }
        component.set("v." + attributeName, fieldList);
    },

    createTheRecord : function(component, sObject) {
        component.set("v.renderResults", false);
        component.set("v.searchTerm", "");
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": sObject
        });
        createRecordEvent.fire();
    },

    createTheRecordCustom : function(component) {
        component.set("v.renderResults", false);
        component.set("v.searchTerm", "");
        component.set("v.displayModal", true);
    },

    addPill : function(component, recordId) {
        var pillList = component.get("v.pillList");
        var svgIconType = component.get("v.svgIconType");
        var svgRowIcon = component.get("v.svgRowIcon");
        var parentId = component.get("v.objectAPIName");
        var pillListIds = component.get("v.pillListIds");
        var attributesMap = {};
        attributesMap["recordId"] = recordId;
        attributesMap["svgIconType"] = svgIconType;
        attributesMap["svgRowIcon"] = svgRowIcon;
        attributesMap["parentId"] = parentId;
        if(recordId){
            if(pillListIds.indexOf(recordId) === -1){
                pillListIds.push(recordId);
                component.set("v.pillListIds", pillListIds);
                var records = component.get("v.records");
                var recordIdList = component.get("v.recordIdList");
                var index = recordIdList.indexOf(recordId);
                if(records && records[index]){
                    var recordName = records[index].Name;
                    attributesMap["theLabel"] = recordName;
                    $A.createComponent(
                        "c:sObjectSearchPill",
                        attributesMap,
                        function(newComponent, status, errorMessage){
                            if (status === "SUCCESS") {
                                pillList.push(newComponent);
                                component.set("v.pillList", pillList);
                            }
                        }
                    );
                }
            }
        }
    }
})