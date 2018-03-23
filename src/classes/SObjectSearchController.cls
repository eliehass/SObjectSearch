public with sharing class SObjectSearchController {
    @AuraEnabled
    public static ReturnObject getMatchingRecords(String sObj, List<String> searchField, String searchTerm, Map<String, String> limiters){
        ReturnObject ro = new ReturnObject(Utilities.searchAnyObjectByField(sObj, searchField, searchTerm, limiters));
        return ro;
    }

    @AuraEnabled
    public static SObject getRecord(String sObj, String recordId){
        return Utilities.getRecord(recordId, sObj);
    }

    @AuraEnabled
    public static List<SObject> getChildRecords(String sObj, String lookUpFieldName, String parentId){
        return Utilities.getChildRecords(sObj, lookUpFieldName, parentId);
    }

    @AuraEnabled
    public static sObject getRecordName(String recordId, String fieldName, String objectName){
        return Utilities.getRelatedRecordName(recordId, fieldName, objectName);
    }

    @AuraEnabled
    public static ReturnObject getLastViewedRecords(String sObj, Map<String, String> limiters){
        ReturnObject ro = new ReturnObject(Utilities.getLastViewedObjects(sObj, 3, limiters));
        System.debug('ro: ' + ro);
        return ro;
    }

    @AuraEnabled
    public static SObject createRecord(SObject newRecord){
        return Utilities.insertSObject(newRecord, true)[0];
    }

    @AuraEnabled
    public static List<Utilities.FieldSetWrapper> getDescriptionFieldSetFields(String sObj, String fieldsetName){
        return Utilities.getFieldSetWrapperFields(sObj, fieldsetName);
    }

    @AuraEnabled
    public static Map<String, List<String>> getFieldSetFields(String sObj, String fieldsetName, Boolean limited){
        if(limited == null){
            limited = false;
        }
        List<Schema.FieldSetMember> fieldSetList = Utilities.getFieldSet(sObj, fieldsetName);
        Map<String, List<String>> fieldAPINametoLabelMap = new Map<String, List<String>>();
        Set<String> dtSet = new Set<String>();
        //these are the field types we support, anything else will be ignored
        dtSet.add('STRING');
        dtSet.add('TEXTAREA');
        dtSet.add('INTEGER');
        dtSet.add('DOUBLE');
        dtSet.add('PERCENT');
        dtSet.add('BOOLEAN');
        dtSet.add('DATE');
        dtSet.add('DATETIME');
        dtSet.add('PICKLIST');
        dtSet.add('MULTIPICKLIST');
        dtSet.add('PHONE');
        dtSet.add('ADDRESS');
        dtSet.add('URL');

        for(Schema.FieldSetMember fsm : fieldSetList){
            String theType = String.valueOf(fsm.getType());
            if(dtSet.contains(theType) || !limited){
                List<String> fieldList = new List<String>();
                fieldList.add(fsm.getLabel());
                fieldList.add(String.valueOf(fsm.getType()));
                fieldAPINametoLabelMap.put(fsm.getFieldPath(), fieldList);
            }
        }
        return fieldAPINametoLabelMap;
    }

    @AuraEnabled
    public static String getUIThemeDescription() {
        String theme = UserInfo.getUiThemeDisplayed();
        return theme;
    }

    public class ReturnObject{
        @AuraEnabled
        public List<sObject> sObjectList{get;set;}
        @AuraEnabled
        public List<Id> idList{get;set;}

        public ReturnObject(List<sObject> objectList){
            this.sObjectList = objectList;
            this.idList = new List<Id>();
            for(sObject anObj : sObjectList){
                idList.add(anObj.Id);
            }
        }
    }
}