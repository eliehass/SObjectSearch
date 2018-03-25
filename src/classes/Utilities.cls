/* Class:		Utilities
 * Author:		ElieHassan
 * Created On:	July 27, 2017
 * Description: Class for generic utility methods
 */
public with sharing class Utilities {

    public class InvalidParameterException extends Exception {}

    public static SObject[] searchAnyObjectByField(String sObjectName, String[] searchField, String searchTerm, Map<String, Boolean> sortFieldsMap, Map<String, String> whereClauseMap) {
        if (searchField == null) {
            throw new InvalidParameterException('The searchField parameter cannot be null.');
        }
        if (searchField.isEmpty()) {
            throw new InvalidParameterException('The searchField parameter cannot be an empty list.');
        }
        for (String sf: searchField) {
            if (String.isBlank(sf)) {
                throw new InvalidParameterException('The searchField list fields cannot be null or an empty string.');
            }
        }
        if(String.isBlank(sObjectName) || String.isBlank(searchTerm) || whereClauseMap == null) {
            throw new InvalidParameterException('sObjectName, searchField, searchTerm, and whereClauseMap are required parameters!');
        }
        String whereClause = '';
        for(String key : whereClauseMap.keySet()){
            whereClause += String.escapeSingleQuotes(key);
            if(!whereClauseMap.get(key).contains(')')) {
                if(whereClauseMap.get(key) != 'true' && whereClauseMap.get(key) != 'false' && whereClauseMap.get(key) != 'null') {
                    whereClause += +'\'' + String.escapeSingleQuotes(whereClauseMap.get(key)) + '\'';
                }else{
                    whereClause += String.escapeSingleQuotes(whereClauseMap.get(key));
                }
            }else{
                String theString = whereClauseMap.get(key);
                theString = theString.replace(')', '');
                whereClause += '\'' + String.escapeSingleQuotes(theString) + '\')';
            }
        }
        String queryableFields = getReadableFields(sObjectName);
        String query = 'select '+String.escapeSingleQuotes(queryableFields)+' from '+String.escapeSingleQuotes(sObjectName)+' where (';
        Schema.DisplayType dispType;
        boolean firstField = true;
        for(String sf: searchField) {
            Schema.SObjectField sfDescription = getFieldDescription(sObjectName, sf);
            if (sfDescription != null) {
                if (sfDescription.getDescribe().isFilterable()) {
                    dispType = sfDescription.getDescribe().getType();
                    if (!firstField) {
                        query += ' OR ' + String.escapeSingleQuotes(sf);
                    } else {
                        query += String.escapeSingleQuotes(sf);
                        firstField = false;
                    }
                    if (isLikeable(dispType)) {
                        query +=' like \'%' + String.escapeSingleQuotes(searchTerm) + '%\'';
                    } else {
                        if (useQuotes(dispType)) {
                            query +=' = \'' + String.escapeSingleQuotes(searchTerm) + '\'';
                        } else {
                            query +=' = ' + searchTerm;
                        }
                    }
                }
            } else {
                throw new InvalidParameterException('The field ' + sf + ' does not exist in the ' + sObjectName + ' object.');
            }
        }
        if (firstField) {
            throw new InvalidParameterException('There is a problem with the search fields. Although large text fields are ignored, having only large text fields is not allowed.');
        }
        query += ')' + whereClause;
        if(sortFieldsMap != null && !sortFieldsMap.isEmpty()) {
            query += ' order by ';
            for(String field : sortFieldsMap.keySet()) {
                query += field;
                Boolean isDescend = sortFieldsMap.get(field);
                if(isDescend != null && isDescend) {
                    query += ' desc';
                }
                query += ',';
            }
            //Remove trailing comma
            query = query.left(query.lastIndexOf(','));
        }
        query += ' LIMIT 25';
        System.debug('query: ' + query);
        return Database.query(query);
    }

    public static SObject[] searchAnyObjectByField(String sObjectName, String[] searchFields, String searchTerm, Map<String, Boolean> sortFieldsMap) {
        return searchAnyObjectByField(sObjectName, searchFields, searchTerm, sortFieldsMap, new Map<String, String>());
    }

    public static SObject[] searchAnyObjectByField(String sObjectName, String[] searchFields, String searchTerm) {
        return searchAnyObjectByField(sObjectName, searchFields, searchTerm, null, new Map<String, String>());
    }

    public static SObject[] searchAnyObjectByField(String sObjectName, String[] searchFields, String searchTerm, Map<String, String> whereClauseMap) {
        return searchAnyObjectByField(sObjectName, searchFields, searchTerm, null, whereClauseMap);
    }

    public static SObject[] searchAnyObjectByField(String sObjectName, String searchField, String searchTerm, Map<String, Boolean> sortFieldsMap, Map<String, String> whereClauseMap) {
        return searchAnyObjectByField(sObjectName, new List<String>{searchField}, searchTerm, sortFieldsMap, whereClauseMap);
    }
    public static SObject[] searchAnyObjectByField(String sObjectName, String searchField, String searchTerm, Map<String, Boolean> sortFieldsMap) {
        return searchAnyObjectByField(sObjectName, new List<String>{searchField}, searchTerm, sortFieldsMap, new Map<String, String>());
    }

    public static SObject[] searchAnyObjectByField(String sObjectName, String searchField, String searchTerm) {
        return searchAnyObjectByField(sObjectName, new List<String>{searchField}, searchTerm, null, new Map<String, String>());
    }

    public static SObject[] searchAnyObjectByField(String sObjectName, String searchField, String searchTerm, Map<String, String> whereClauseMap) {
        return searchAnyObjectByField(sObjectName, new List<String>{searchField}, searchTerm, null, whereClauseMap);
    }

    public static SObject getRecord(String recordId, String objectName){
        objectName = objectName.trim();
        String queryableFields = getReadableFields(objectName);
        String query = 'select '+ String.escapeSingleQuotes(queryableFields)+' from ' + String.escapeSingleQuotes(objectName) + ' where id = \'' + recordId + '\' limit 1';
        return Database.query(query);
    }

    public static String getReadableFields(String sObjectName) {
        Schema.SObjectField[] objectFields = Schema.getGlobalDescribe().get(sObjectName).getDescribe().fields.getMap().values();
        String[] readableFieldsCSV = new String[]{};
        for(Schema.SObjectField objectField : objectFields) {
            Schema.DescribeFieldResult fieldDescribe = objectField.getDescribe();
            String fieldName = fieldDescribe.getName();
            if(fieldDescribe.isAccessible()) {
                readableFieldsCSV.add(fieldName);
            }
        }
        return String.join(readableFieldsCSV, ',');
    }

    public static Schema.SObjectField getFieldDescription(String objectApiName, String fieldName) {
        Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
        Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get(objectApiName);
        Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();

        return DescribeSObjectResultObj.fields.getMap().get(fieldName);
    }

    private static boolean useQuotes(Schema.DisplayType dispType) {
        if (dispType == Schema.DisplayType.Integer || dispType == Schema.DisplayType.Double || dispType == Schema.DisplayType.Boolean ||
                dispType == Schema.DisplayType.Currency || dispType == Schema.DisplayType.Percent) {
            return false;
        }
        return true;
    }

    private static boolean isLikeable(Schema.DisplayType dispType) {
        if (dispType == Schema.DisplayType.String || dispType == Schema.DisplayType.Address || dispType == Schema.DisplayType.Email ||
                dispType == Schema.DisplayType.Phone || dispType == Schema.DisplayType.Picklist || dispType == Schema.DisplayType.TextArea) {
            return true;
        }
        return false;
    }

    public static sObject getRelatedRecordName(String recordId, String fieldName, String objectName){
        String query = 'SELECT ' + String.escapeSingleQuotes(fieldName) + ' FROM ' + String.escapeSingleQuotes(objectName) + ' WHERE Id = \'' + String.escapeSingleQuotes(recordId) +'\'';
        return Database.query(query);
    }

    /* Will return last numberToReturn objects viewed of type objectName*/
    public static List<SObject> getLastViewedObjects(String objectName, integer numberToReturn, Map<String, String> whereClauseMap) {
        if (String.isBlank(objectName)) {
            throw new InvalidParameterException('No object name was passed.');
        }
        if (numberToReturn == null) {
            throw new InvalidParameterException('No number to return was passed.');
        }
        if (whereClauseMap == null) {
            throw new InvalidParameterException('No whereClause cannot be null.');
        }
        List<Id> sObjectIds = new List<Id>();
        List<RecentlyViewed> lastViewedIds = [SELECT Id FROM RecentlyViewed WHERE Type = :objectName ORDER BY LastViewedDate DESC LIMIT 100];
        for(RecentlyViewed rv: lastViewedIds) {
            sObjectIds.add(rv.Id);
        }
        getReadableFields(objectName);
        String whereClause = '';
        for(String key : whereClauseMap.keySet()){
            whereClause += String.escapeSingleQuotes(key);
            if(!whereClauseMap.get(key).contains(')')) {
                if(whereClauseMap.get(key) != 'true' && whereClauseMap.get(key) != 'false' && whereClauseMap.get(key) != 'null') {
                    whereClause += +'\'' + String.escapeSingleQuotes(whereClauseMap.get(key)) + '\'';
                }else{
                    whereClause += String.escapeSingleQuotes(whereClauseMap.get(key));
                }
            }else{
                String theString = whereClauseMap.get(key);
                theString = theString.replace(')', '');
                whereClause += '\'' + String.escapeSingleQuotes(theString) + '\')';
            }
        }
        String queryString = 'SELECT ' + getReadableFields(ObjectName) + ' FROM ' + String.escapeSingleQuotes(objectName) + ' WHERE Id IN :sObjectIds' + whereClause + ' ORDER BY LastViewedDate DESC LIMIT :numberToReturn';
        System.debug('queryString: ' + queryString);
        return Database.query(queryString);
    }

    public static List<SObject> getLastViewedObjects(String objectName, integer numberToReturn) {
        return getLastViewedObjects(objectName, numberToReturn, new Map<String, String>());
    }

    public static List<SObject> getChildRecords(String objectName, String lookUpFieldName, String parentId) {
        if (String.isBlank(objectName)) {
            throw new InvalidParameterException('No object name was passed.');
        }
        if (String.isBlank(lookUpFieldName)) {
            throw new InvalidParameterException('No lookUpFieldName was passed.');
        }
        if (String.isBlank(parentId)) {
            throw new InvalidParameterException('No parentId was passed.');
        }
        getReadableFields(objectName);
        String queryString = 'SELECT ' + getReadableFields(ObjectName) + ' FROM ' + String.escapeSingleQuotes(objectName) + ' WHERE ' + lookUpFieldName + ' = \'' + parentId + '\'';
        List<SObject> returnList = Database.query(queryString);
        return returnList;
    }

    //Will allow for insert of any SObject
    public static List<SObject> insertSObject(List<SObject> sobjects, boolean requery) {
        if (sobjects == null || sobjects.isEmpty()) {
            throw new InvalidParameterException('Cannot insert SObject, no object was passed.');
        }

        insert sobjects;
        String sObjName = sobjects[0].Id.getSObjectType().getDescribe().getName();
        if (requery) {
            String allSObjectFields = getReadableFields(sObjName);
            String query = 'select ' + allSObjectFields + ' FROM ' + sObjName + ' WHERE Id = :sobjects';
            return Database.query(query);
        } else {
            return sobjects;
        }
    }

    //Will allow for insert of any SObject (singular method)
    public static List<SObject> insertSObject(SObject sObj, boolean requery) {
        if (sObj == null) {
            throw new InvalidParameterException('Cannot insert SObject, no object was passed.');
        }
        return insertSObject(new List<SObject>{sObj}, requery);
    }

    public static List<Schema.FieldSetMember> getFieldSet(String objectApiName, String fieldSetName) {
        Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
        Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get(objectApiName);
        Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();
        Schema.FieldSet fieldSetObj = DescribeSObjectResultObj.FieldSets.getMap().get(fieldSetName);
        return fieldSetObj.getFields();
    }

    /*
    Wrapper class for Schema.FieldSetMember (and an access method) since Lightning Components can't recieve 
    Schema.FieldSetMember directly
    */
    public static List<FieldSetWrapper> getFieldSetWrapperFields(String sObj, String fieldsetName){
        List<Schema.FieldSetMember> fieldSetList = getFieldSet(sObj, fieldsetName);
        List<FieldSetWrapper> fset = new List<FieldSetWrapper>();
        for (Schema.FieldSetMember f: fieldSetList) {
            fset.add(new FieldSetWrapper(f));
        }
        return fset;
    }

    public class FieldSetWrapper {

        public FieldSetWrapper(Schema.FieldSetMember f) {
            this.DBRequired = f.DBRequired;
            this.fieldPath = f.fieldPath;
            this.label = f.label;
            this.required = f.required;
            this.type = '' + f.getType();
        }

        public FieldSetWrapper(Boolean DBRequired) {
            this.DBRequired = DBRequired;
        }

        @AuraEnabled
        public Boolean DBRequired { get;set; }

        @AuraEnabled
        public String fieldPath { get;set; }

        @AuraEnabled
        public String label { get;set; }

        @AuraEnabled
        public Boolean required { get;set; }

        @AuraEnabled
        public String type { get; set; }
    }
}