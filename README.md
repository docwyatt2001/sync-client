# Introduction
SyncProxy-client is a javascript client for SyncProxy that enables one-single line of code implementation of synchronization for javascript offline applications using embedded database (IndexedDB, SQL Lite, WebSQL...). Used with the SyncProxy server (www.syncproxy.com) to access the backend database (MySQL, SQL Server, MongoDB...), this is the shortest way to make mobile offline applications synchronize bi-directionally in realtime using reactive sync technology.

# Installation
```
$ git clone https://github.com/syncproxy/sync-client
```
# Example
Simply copy the library, then load the SyncProxy client script from within your main index.html page:

```html
<script src="sync-client/sync-client.js" proxyID="<proxy Id>" connectorType="IndexedDB or WebSQL or SQLite or IonicStorage" dbName="your client db name"></script> 
```

(the script params can also be retrieved directly from my.syncproxy.com when creating a sync proxy)

## Custom params
Sync client script can be invoked with custom params that are inserted as attributes of the **&lt;script&gt;** tag:

**src (mandatory)**  
path to the client sync script (recommended: "client-sync/client-sync.js")

**proxyID (mandatory)**  
Id attributed by SyncProxy to  your proxy on creation

**connectorType**  
values: "IndexedDB", "WebSQL", "SQLite", "LocalStorage", "IonicStorage"  
default: "IndexedDB"

**dbName**  
Name of your embedded database in mobile app.  
default: "SyncProxy"

**protocol**  
values: "ws" (websocket) or "wss" (secured websoket)  
default: "wss"

**serverUrl**  
Url of the server hosting SyncProxy  
default: "my.syncproxy.com"

**serverPort**  
Port listened on by SyncProxy server  
default value: 4501

**autoUpgradeDB**  
values: "true", "false"
If true, the embedded database's structure will be automatically upgraded (if this is relevant to the type of database) during sync after a database schema update.
Set to false if application creates and upgrades database schema by itself.  
default: "true"

**autoInit**  
values: "true", "false"
If true, sync client will be started automatically. If false, sync client should be created by calling SyncClient.initClient(params)  
default: "true"

**reactiveSync**  
values: "true", "false"
If true, enables reactive sync. Reactivity for each table + direction (server->client and client->server) is configured on server side  
default: "true"

**syncButton**  
values: "true", "false"
If true, a popup sync button is displayed. If false, application must take care to launch sync by itself  
default: "true"

**tablesToSync**  
When using Auto Backendless database or NoSQL database without server database schema, you have the ability to discover schema from client's data. In that case, attribute tablesToSync must be set with the list of tables to sync from client to server. 
default: ""

**customCredentials**  
If set, defines a custom credential function. Typically returns a {login, password} object which will be sent as-is to the server. If left blank, the credentials are managed by sync client using a login prompt.  
default: ""

**loginSource**  
If set, defines a user login source object within the application, for instance: "document.getElementById('inputLogin').value"  
default: ""

**passwordSource**  
If set, defines a user password source object within the application, for instance: "document.getElementById('inputPassword').value"  
default: ""

**welcomeMessage**  
Message that will popup in the app before the first synchronization.  
default: "To begin, please press Sync button"

**utcDates**
If true (default), all datetimes will be stored as ISO-8601 strings, otherwise as "YYYY-MM-DD HH:MI:SS" (without timezone information).
default: "true"

**onSyncEnd**  
Handler function called each time synchronization ends

## Testing
Like us, test your mobile and progressive web apps with

[<img src="https://p14.zdusercontent.com/attachment/1015988/xhbf3TBMImSwSmvre7tih36sU?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..COsnFxS-SgN1cn9JihtFaw.N8jUlNaqw59Ds-CRovWcf4miZx5tIU9Lhs8KEQ2JOEZr5XwRQbo2K2LPS3rUndakRvv6z-dnHz8spRW-umW1dyBqrx43LC_EhKXSSdrXnPE2Byjq4yDPA1Y0HMVHfZLxkGz3mXVyqb2zNRIotsSNjMEluIOcXjXpInIz2iOnt2GarlXRcGOp5ssQMUJ4vNcdihvIOxY3lYUkjDoWlnWgyMfqVn2eBtZVXPrm52gjfexXwi4Ct-MGYtQC1iZJ5iiAbCjsyeew51v8ZJqE5lYM7eQsoLx2No7mkGuCUnl6iDg.-VRGokd_4kLCE3N0xBxArw" width="300px">](http://www.browserstack.com)

## Documentation
Read our tutorial on how to setup SyncProxy client with an Ionic hybrid mobile application
https://github.com/syncproxy/syncproxy-quickstart-ionic
