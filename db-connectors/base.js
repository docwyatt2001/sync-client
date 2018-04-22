////////////////////
// Sync functions //
////////////////////
DBConnector.getItem = function(key){
	var item = localStorage.getItem(key);
	return item;
}

DBConnector.setItem = function(key, val){
	localStorage.setItem(key, val);
}

DBConnector.prototype.getChangesKeyName = function(tableName, ope){		// ope: Deletes/Upserts/Sending
	return this.name + "." + this.dbName + "." + tableName + "." + ope;
};

DBConnector.removeItem = function(key){
	return localStorage.removeItem(key, val);
}

DBConnector.prototype.getTableChangesKeys = function(tableName, ope){
	var item = DBConnector.getItem(this.getChangesKeyName(tableName, ope));
	if ( item )
		return JSON.parse(item);
	else
		return [];
};

DBConnector.prototype.getUpsertsKeys = function(tableName) {
	var upserts = this.getTableChangesKeys(tableName, "Upserts");
	var sendings = this.getTableChangesKeys(tableName, "Sendings");
	if (sendings)
		upserts = upserts.filter(x=>sendings.indexOf(x)==-1);		// filter out all keys already being sent
	return upserts;
};

DBConnector.prototype.getDeletesKeys = function(tableName) {
	var deletes = this.getTableChangesKeys(tableName, "Deletes");
	var sendings = this.getTableChangesKeys(tableName, "Sendings");
	if (sendings)
		deletes = deletes.filter(x=>sendings.indexOf(x)==-1);		// filter out all keys already being sent
	return deletes;
};

DBConnector.prototype.markAsUpserted = function(tableName, arrKeys){
	if ( !arrKeys || (arrKeys.length == 0) )
	return;
	var upserts = this.getTableChangesKeys(tableName, "Upserts");
	if ( !upserts )
		upserts = [];
	// Ignore keys that are already marked as upserted.
	arrKeys = arrKeys.filter(i=>upserts.indexOf(i) == -1);
	upserts = upserts.concat(arrKeys);
	DBConnector.setItem(this.getChangesKeyName(tableName, "Upserts"), JSON.stringify(upserts));	
	// Remove newly upserted keys from Deletes array, if any.
	var deletes = this.getTableChangesKeys(tableName, "Deletes");
	if ( !deletes )
		deletes = [];
	deletes = deletes.filter(i=>arrKeys.indexOf(i) == -1);
	DBConnector.setItem(this.getChangesKeyName(tableName, "Deletes"), JSON.stringify(deletes));
	if ( this.syncClient )
		this.syncClient.onClientChanges(tableName);
};

DBConnector.prototype.markAsDeleted = function(tableName, arrKeys){
	if ( !arrKeys || (arrKeys.length == 0) )
	return;
	var item = this.getTableChangesKeys(tableName);
	var upserts = this.getTableChangesKeys(tableName, "Upserts");
	var deletes = this.getTableChangesKeys(tableName, "Deletes");
	if ( !deletes )
		deletes = [];
	if ( !upserts )
		upserts = [];
	// Ignore keys that are already marked as deleted.
	arrKeys = arrKeys.filter(function(i){
		return (deletes.indexOf(i) == -1);
	});
	deletes = deletes.concat(arrKeys);
	// Remove newly deleted keys from Upserts array, if any.
	upserts = upserts.filter(function(i){
		return (arrKeys.indexOf(i) == -1);
	});
	DBConnector.setItem(this.getChangesKeyName(tableName, "Upserts"), JSON.stringify(upserts));
	DBConnector.setItem(this.getChangesKeyName(tableName, "Deletes"), JSON.stringify(deletes));
	if ( this.syncClient )
		this.syncClient.onClientChanges(tableName);
};

DBConnector.prototype.markAsBeingSent = function(tableName, arrKeys){
	if ( !arrKeys || (arrKeys.length == 0) )
		return;
	var sendings = this.getTableChangesKeys(tableName, "Sendings");
	if ( !sendings )
	sendings = [];
	// Ignore keys that are already marked as being sent.
	arrKeys = arrKeys.filter(function(i){
		return (sendings.indexOf(i) == -1);
	});
	sendings = sendings.concat(arrKeys);
	DBConnector.setItem(this.getChangesKeyName(tableName, "Sendings"), JSON.stringify(sendings));
};

// Return true if all changes have been sent, otherwise if some Upserts or Deletes remain to be sent
DBConnector.prototype.resetSentChanges = function(tableName){
	var upserts = this.getTableChangesKeys(tableName, "Upserts");
	var deletes = this.getTableChangesKeys(tableName, "Deletes");
	var sendings = this.getTableChangesKeys(tableName, "Sendings");
	if ( !deletes )
		deletes = [];
	if ( !upserts )
		upserts = [];
	if ( !sendings )
		sendings = [];
	// Remove Deletes keys that have been sent.
	deletes = deletes.filter(function(i){
		return (sendings.indexOf(i) == -1);
	});
	// Remove Upserts keys that have been sent.
	upserts = upserts.filter(function(i){
		return (sendings.indexOf(i) == -1);
	});
	// Void Sending keys.
	DBConnector.setItem(this.getChangesKeyName(tableName, "Upserts"), JSON.stringify(upserts));
	DBConnector.setItem(this.getChangesKeyName(tableName, "Deletes"), JSON.stringify(deletes));
	localStorage.removeItem(this.getChangesKeyName(tableName, "Sendings"));
	return !( (upserts && upserts.length) || (deletes && deletes.length) );
};

DBConnector.prototype.getUpserts = function(tableName) {
	var self = this;
	var keys = self.getUpsertsKeys(tableName)
	return self.getMany(tableName, keys);
};

DBConnector.prototype.getAllDeletes = function(tables) {
	var self = this;
	return new Promise(function(resolve,reject){
		if ( !tables || !tables.length )
			return reject("No tables");
		var allDeletes = {};
		for ( var t in tables ){
			deletesKeys = self.getDeletesKeys(tables[t]);
			if ( deletesKeys && (deletesKeys.length > 0) )
				allDeletes[tables[t]] = deletesKeys;
		}
		return resolve(allDeletes);
	});
};
	
DBConnector.prototype.getAllUpserts = function(tables){
	if ( !tables || !tables.length )
		return Promise.reject("No tables");
	var self = this;
	var allUpserts = {};
	const promises = [];
	var addTableUpsertPromise = function(promises, tableName){		// declaring a function is necessary to scope tableName within for loop
		promises.push(
			self.getUpserts(tableName)
			.then(res=>{if (res.length) allUpserts[tableName] = res;})
			.catch(err=>{
				console.log("getAllUpserts: " + err);
				return Promise.reject(err);
			})
		);
	}
	for ( var t in tables )
		addTableUpsertPromise(promises, tables[t]);
	return Promise.all(promises)
	.then(()=>allUpserts);
}

// Retrieve best available storage following Ionic Storage's choice order: SQLite, IndexedDB, WebSQL or LocalStorage
DBConnector.getPreferredIonicStorage = function(){
	if ( typeof SQLite != "undefined" )
		return "SQLite";
	if ( indexedDB || window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB )
		return "IndexedDB";
	if ( typeof openDatabase != "undefined" )
		return "WebSQL";
	if ( typeof "Storage" != "undefined" )
		return "LocalStorage";
	return null;
};

DBConnector.prototype.getDBVersion = function(){
	var v = DBConnector.getItem("dbVersion");
	if ( v )
		return parseInt(v);
	return 0;
};

DBConnector.prototype.setDBVersion = function(version){
	DBConnector.setItem("dbVersion", parseInt(version));
};

DBConnector.prototype.upgradeDatabase = function(newSchema){
};

function DBConnector(dbName, syncClient)
{
	this.name = "DBConnector";
	if ( !dbName )
		return;
	this.dbName = dbName;
	if ( syncClient )
		this.syncClient = syncClient;
}