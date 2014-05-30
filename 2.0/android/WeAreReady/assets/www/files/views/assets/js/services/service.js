/*
 * Services
 */

var GetCheckPoints = new Apperyio.RestService({
    'url': 'http://weareready.apphb.com/api/Breeze/GetCheckPoints',
    'dataType': 'json',
    'type': 'get',
});

var LoginService = new Apperyio.RestService({
    'url': 'http://weareready.apphb.com/api/Breeze/LoginUser',
    'dataType': 'json',
    'type': 'get',
});

var GetUserProfile = new Apperyio.RestService({
    'url': 'http://weareready.apphb.com/api/Breeze/GetUserProfile',
    'dataType': 'json',
    'type': 'get',
});

var logActivityWithStatus = new Apperyio.RestService({
    'url': 'http://weareready.apphb.com/api/Breeze/AddLog',
    'dataType': 'json',
    'type': 'get',
});

var CreateNewUserProfile = new Apperyio.RestService({
    'url': 'http://weareready.apphb.com/api/Breeze/AddUserProfile',
    'dataType': 'json',
    'type': 'get',
});

var getUserDetails = new Apperyio.RestService({
    'url': 'http://weareready.apphb.com/api/Breeze/GetUserProfile',
    'dataType': 'json',
    'type': 'get',
});

/*
 * Data models
 */
Apperyio.models = {
    "AAB7DD8B-612F-6E85-DA32-0D74E1330AA0": {
        "name": "String",
        "type": "string",
        "parentGuid": null,
        "reference": null
    },
    "ABB7DD8B-612F-6E85-DA32-0D74E1330AA1": {
        "name": "Number",
        "type": "number",
        "parentGuid": null,
        "reference": null
    },
    "ACB7DD8B-612F-6E85-DA32-0D74E1330AA2": {
        "name": "Boolean",
        "type": "boolean",
        "parentGuid": null,
        "reference": null
    }

};

/*
 * Data storages
 */
Apperyio.storages = {};