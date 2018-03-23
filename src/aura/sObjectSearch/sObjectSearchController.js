({
    doInit : function(component, event, helper) {
        var sObject = component.get("v.objectAPIName");
        var searchFieldSingle = component.get("v.searchFieldAPINameSingle");
        var addRecord = component.get("v.addRecord");
        var multiSelect = component.get("v.multiSelect");
        if(addRecord || multiSelect){
            component.set("v.usePills", false);
        }
        if(searchFieldSingle){
            searchFieldSingle = searchFieldSingle.split(",");
            component.set("v.searchFieldAPIName", searchFieldSingle);
        }
        var objectName = component.get("v.objectName");
        if(objectName){
            objectName = objectName.toLowerCase();
        }
        var parentId = component.get("v.parentId");
        if(!parentId) {
            component.set("v.parentId", component.get("v.objectAPIName"));
        }
        var rowIcon = component.get("v.svgRowIcon");
        if(!rowIcon || rowIcon === ''){
            component.set("v.svgRowIcon", objectName);
        }
        helper.getRecentRecords(component, sObject);
        helper.getSearchFields(component);
        helper.getResultDescriptionFields(component);
    },

    selectRecord : function(component, event, helper) {
        var recordId = event.currentTarget.id;
        var parentId = component.get("v.parentId");
        helper.sendSelectedRecord(component, recordId, parentId);
        if(recordId && recordId !== ''){
            var usePills = component.get("v.usePills");
            if(usePills){
                var recordIdList = component.get("v.recordIdList");
                var index = recordIdList.indexOf(recordId);
                var records = component.get("v.records");
                if(records){
                    component.set("v.theSelectedRecord", records[index]);
                    component.set("v.recordSelected", true);
                }
            }
        }
    },

    determineResultVisibility : function(component, event, helper){
        helper.determineResultVisibility(component);
    },

    hideList : function(component, event, helper) {
        var runHide = true;
        if(event && event.getParam){
            var parentId = event.getParam("parentId");
            var objectAPIName = component.get("v.objectAPIName");
            if(parentId.indexOf('SelectedListElement') !== -1 || parentId !== objectAPIName){
                runHide = false;
            }
        }
        if(runHide) {
            component.set("v.showResultList", false);
            component.set("v.hasFocus", false);
            /*var searchBar = component.find("searchTextInput");
            if(searchBar && searchBar.set){
                searchBar.set("v.value", "");
            }*/
            if (event && event.currentTarget && event.currentTarget.value) {
                event.currentTarget.value = "";
            }
            var multiSelect = component.get("v.multiSelect");
            if (event && event.getParam) {
                var recordId = event.getParam("recordId");
                var myRecordId = component.get("v.theSelectedRecord");
                if (recordId !== myRecordId) {
                    component.set("v.recordSelected", false);
                    component.set("v.searchTerm", "");
                    var parentId = component.get("v.parentId");
                }
                var eventParentId = event.getParam("parentId");
                var objectAPIName = component.get("v.objectAPIName");
                if (multiSelect && eventParentId === objectAPIName) {
                    helper.addPill(component, recordId);
                }
            }
        }
    },

    createRecord : function(component, event, helper) {
        var sObject = component.get("v.objectAPIName");
        helper.createTheRecord(component, sObject);
    },

    createRecordCustom : function(component, event, helper) {
        helper.createTheRecordCustom(component);
    },

    searchForRecord : function(component, event, helper) {
        var searchTerm = event.target.value;
        component.set("v.searchTerm", searchTerm);
        var sObject = component.get("v.objectAPIName");
        var searchField = component.get("v.searchFieldAPIName");
        var whereClause = component.get("v.limiters");
        component.set("v.hasFocus", true);
        component.set("v.renderResults", true);
        component.set("v.searchTermLength", searchTerm.length);
        component.set("v.showResultList", component.get("v.createOption"));

        if(searchTerm.length === 0){
            component.set("v.renderResults", true);
            helper.getRecentRecords(component, sObject);
        }else if(searchTerm.length > 2){
            component.set("v.renderResults", true);
            helper.getRecords(component, sObject, searchField, searchTerm, whereClause);
        }else{
            component.set("v.renderResults", false);
            component.set("v.records", null);
        }
    },

    sendCreatedRecord : function(component, event, helper) {
        var recordId = event.getParam("recordId");
        var parentId = component.get("v.parentId");
        helper.sendtheCreatedRecord(component, recordId, parentId);
    },

    removeSelection : function(component, event, helper) {
        component.set("v.recordSelected", false);
        component.set("v.searchTerm", "");
        component.set("v.defaultRecord", false);
        var parentId = component.get("v.parentId");
        helper.sendSelectedRecord(component, '', parentId);
    },

    updatePillList : function(component, event, helper){
        var recordId = event.getParam("recordId");
        var eventParentId = event.getParam("parentId");
        var objectAPIName = component.get("v.objectAPIName");
        if(objectAPIName === eventParentId){
            var pillList = component.get("v.pillList");
            var pillListIds = component.get("v.pillListIds");
            var index = pillListIds.indexOf(recordId);
            if (index > -1) {
                pillListIds.splice(index, 1);
                pillList.splice(index, 1);
            }
            component.set("v.pillList", pillList);
            component.set("v.pillListIds", pillListIds);
        }
    }
})