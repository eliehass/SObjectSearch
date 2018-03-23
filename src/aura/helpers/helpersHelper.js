({
    navigateToObject : function(objectId) {        
        if (objectId) {
            var urlEvent = $A.get("e.force:navigateToSObject");
            urlEvent.setParams({
                'recordId' : objectId
            });
            urlEvent.fire();
        }
    },
      navigateToUrl : function(url) {        
        if (url) {
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                'url' : url
            });
            urlEvent.fire();
        }
    },

    displayErrors : function(component, errors, title, severity, errorComponent){
        for (var i = 0; i < errors.length; i = i + 1) {
            $A.createComponents([
                ["ui:message", {
                    "title" : title + "\n",
                    "severity" : severity
                }],
                ["ui:outputText", {
                    "value" : errors[i].message
                }]
                ],
                function(components, status){
                    if (status === "SUCCESS") {
                        var message = components[0];
                        var outputText = components[1];
                        // set the body of the ui:message to be the ui:outputText
                        message.set("v.body", outputText);
                        var messageDiv = component.find(errorComponent);
                        // Replace div body with the dynamic component
                        messageDiv.set("v.body", message);
                    }
                }
            );
        }
    }
})