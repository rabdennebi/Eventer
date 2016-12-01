angular.module('starter.services', [])

.factory('model', function($q, DB_CONFIG, $ionicPlatform) {
	var self = this;
	self.db = null;

	self.init = function() {
		self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
		angular.forEach(DB_CONFIG.tables, function(table) {
			var columns = []; 
			angular.forEach(table.columns, function(column) {
				columns.push(column.name + ' ' + column.type);
			}); 
			var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
			self.query(query);
		});
	};

	self.query = function(query, bindings) {
		bindings = typeof bindings !== 'undefined' ? bindings : [];
		var deferred = $q.defer(); 
		$ionicPlatform.ready(function () {
			self.db.transaction(function(transaction) {
				transaction.executeSql(query, bindings, function(transaction, result) {
					deferred.resolve(result);
				}, function(transaction, error) {
					deferred.reject(error);
				});
			}); 
		});
		return deferred.promise;		
	};
 
	self.fetchAll = function(result) {
		var output = []; 
		for (var i = 0; i < result.rows.length; i++) {
			output.push(result.rows.item(i));
		}  
		return output;
	};
 
	self.fetch = function(result) {
		if(result.rows.length > 0) {
          return result.rows.item(0);
       } else {
		return null;
       }			
	};
 
	return self;
})
	
.factory('Voyage', function(model) {
	var self = this;
	
	self.currentVoyage = function() {
		var datefin = Date.now();
		return model.query('SELECT * FROM Voyage WHERE datefin < ?', [datefin])
		.then(function(result){
			return model.fetchAll(result);
		});
	}
	
	self.allVoyages =  function() {  
		return model.query('SELECT * FROM Voyage')
		.then(function(result){
			return model.fetchAll(result);
		});
		
	};	
	
	self.getById = function(id) {
		return model.query('SELECT * FROM Voyage WHERE id = ?', [id])
		.then(function(result){
			return model.fetch(result);
		});
	}; 
	
	self.getAllVoyage =  function(idVoyage) {
		var parameters = [idVoyage];			
		return model.query('SELECT * FROM Voyage JOIN VoyageParticipant ON VoyageParticipant.id_Voyage = Voyage.id JOIN Participant ON Participant.id = VoyageParticipant.id_Participant WHERE Participant.id=(?)', parameters)
		.then(function(result){
			return model.fetchAll(result);
		});
		
	};
	
	self.addVoyages = function(insertVoyage) {
		var parameters = [insertVoyage.Name,insertVoyage.datedebut,insertVoyage.datefin,insertVoyage.description, insertVoyage.url, insertVoyage.estimation];
		return model.query("INSERT INTO Voyage (Name, datedebut, datefin, description, url, estimation) VALUES (?,?,?,?,?,?)", parameters);
	};
	self.removeVoyage = function(removeVoyage) {
		var parameters = [removeVoyage];
		model.query('SELECT id,id_Participant FROM VoyageParticipant WHERE id_Voyage = (?)', parameters)	
		.then(function(result){
			var datas= model.fetchAll(result);								
			angular.forEach(datas, function(data) {

		//console.log(data.id);			
				model.query("DELETE FROM Participant WHERE id = (?)", [data.id_Participant]);
				model.query("DELETE FROM Article WHERE id_VoyageParticipant = (?)", [data.id]);
			});
			//console.log(data);
			model.query("DELETE FROM VoyageParticipant WHERE id_Voyage = (?)", parameters);
			model.query("DELETE FROM Voyage WHERE id = (?)", parameters);
		});
		
	}
	
	self.updateVoyage = function(updateVoyage) {
		var parameters = [updateVoyage.Name, updateVoyage.description, updateVoyage.url, updateVoyage.estimation, updateVoyage.id];
		return model.query("UPDATE Voyage SET Name = (?), description = (?), url = (?), estimation = (?) WHERE id = (?)", parameters);
	}
	
	self.Algo = function(id_voyage){
		var parameters=[id_voyage];	var totale=0;var returnResultat;
		var ResultatVoyage={ 
			"Total": 0, 
			"Participant": [] 
		};				
		return model.query("SELECT id,  id_Participant FROM VoyageParticipant WHERE id_Voyage = (?)",parameters)
		.then(function(result){	
				var data= model.fetchAll(result);					
				for (var i = 0; i < data.length; i++) {	
					var  parameters=[data[i].id,data[i].id_Participant];
					returnResultat =model.query("SELECT SUM(Prix) , Participant.Name  FROM Article JOIN VoyageParticipant ON VoyageParticipant.id=Article.id_VoyageParticipant"
					+" JOIN Participant ON  Participant.id = VoyageParticipant.id_Participant"
					+" WHERE Article.id_VoyageParticipant = (?) AND VoyageParticipant.id_Participant=(?) AND Article.status=1",parameters)
					.then(function(result){							
						var data = model.fetch(result);
						ResultatVoyage.Participant.push({"Name":data["Name"],"Prix":data["SUM(Prix)"],"arg3":0,"rest":0,"ki":[]});
						ResultatVoyage.Total+=data["SUM(Prix)"];
						return ResultatVoyage;							
					});
				}
				return returnResultat;	
				})
		.then(function(result){
			for (var i = 0; i < result.Participant.length; i++) {
				result.Participant[i].arg3=result.Participant[i].rest=result.Total/result.Participant.length-result.Participant[i].Prix;
				
			}
			result.Participant.sort(function (a, b) {
				  if (a.Prix > b.Prix) {
					return -1;
				  }
				  if (a.Prix < b.Prix) {
					return 1;
				  }
				  return 0;
			});				
			return result;})
		.then(function(result){					
			for (var i = 0; i < result.Participant.length; i++) {
				var rest=result.Participant[i].rest;
				for (var j =result.Participant.length-1; j > 0; j--) {
					if(i!=j){
						if(Math.sign(result.Participant[j].rest)==1){
							var toto= result.Participant[j].rest+result.Participant[i].rest;
							if(Math.sign(toto)==1){								
								//200-400 beaucoup tro
								result.Participant[i].ki.push({"Name":result.Participant[j].Name,"Prix":-result.Participant[i].rest});					
								result.Participant[j].ki.push({"Name":result.Participant[i].Name,"Prix":-result.Participant[i].rest});
								result.Participant[j].rest=toto;
								result.Participant[i].rest=0;
								//continue;
									
							}else{
								if(Math.sign(toto)==0){									
											
									result.Participant[i].ki.push({"Name":result.Participant[j].Name,"Prix":result.Participant[j].rest});					
									result.Participant[j].ki.push({"Name":result.Participant[i].Name,"Prix":result.Participant[j].rest});
											
									result.Participant[i].rest=0;
									result.Participant[j].rest=0;
									//continue;
								}else{
									if(Math.sign(toto)==-1){								
									result.Participant[i].ki.push({"Name":result.Participant[j].Name,"Prix":result.Participant[j].rest});					
									result.Participant[j].ki.push({"Name":result.Participant[i].Name,"Prix":result.Participant[j].rest});
										
									result.Participant[i].rest+=result.Participant[j].rest;
									result.Participant[j].rest=0;
									}
								}
							}
						}
					}
				}				
			}	
			return result;
		});
};
	
	return self;
})

.factory('Participant', function(model) {
	var self = this;
	
	self.allParticipant =  function() {
		return model.query('SELECT * FROM Participant')
		.then(function(result){
			return model.fetchAll(result);
		});
		
	};
	
	self.getAllParticipant =  function(idVoyage) {
		var parameters = [idVoyage];			
		return model.query('SELECT Participant.*,VoyageParticipant.budget FROM Participant  JOIN VoyageParticipant ON Participant.id = VoyageParticipant.id_Participant'
		+' WHERE VoyageParticipant.id_Voyage =(?)', parameters)
		.then(function(result){
			return model.fetchAll(result);
		});
	};
	
	/*
	var insertuser={
		id_Voyage:1,
		Name:"onizuka",
		budget:23,
		url:'aaaaaaaaaaa'
	}
	*/
	self.insertParticipant = function(insertuser){
		var parameters=[insertuser.Name,insertuser.url];			
		return model.query("INSERT INTO Participant(Name, url) VALUES(?,?)", parameters).then(function(result){				
				var parameters1=[insertuser.id_Voyage,result.insertId,insertuser.budget];
				return model.query("INSERT INTO VoyageParticipant (id_Voyage,id_Participant, budget) VALUES (?,?,?)", parameters1);
			
		});
	};
	
	/*
	var insertuser={
		idVoyage:1,
		idParticipant:1
	}*/
	self.getParticipant =  function(Participant) {
		var parameters = [Participant.idVoyage,Participant.idParticipant];
		return model.query('SELECT Participant.*,VoyageParticipant.budget FROM Participant  JOIN VoyageParticipant ON Participant.id = VoyageParticipant.id_Participant'
		+' WHERE VoyageParticipant.id_Voyage =(?) AND Participant.id=(?)', parameters)
		.then(function(result){
			return model.fetchAll(result);
		});
	};
	
	self.getByIdParticipant = function(id) {
		return model.query('SELECT * FROM Participant WHERE id = ?', [id])
		.then(function(result){
			return model.fetch(result);
		});
	}; 
	
	self.addParticipant = function(insertParticipant) {
		var parameters = [insertParticipant.Name, insertParticipant.url];
		return model.query("INSERT INTO Participant(Name, url) VALUES(?,?)", parameters);
	};
	
	self.removeParticipant = function(removeParticipant) {
		var parameters = [removeParticipant];
		var idVP=model.query('SELECT id FROM VoyageParticipant WHERE id_Participant = (?)', parameters)
		.then(function(result){
			var datas= model.fetchAll(result);								
			angular.forEach(datas, function(data) {

			console.log(data.id);					
				model.query("DELETE FROM Article WHERE id_VoyageParticipant= (?)", [data.id]);
			});
				
			model.query("DELETE FROM VoyageParticipant WHERE id_Participant = (?)", parameters);
			model.query("DELETE FROM Participant WHERE id = (?)", parameters);
		});
	}
	/*
	var updatParticipant = {
		Name:"RABAH",
		url:"GTO",
		id:4,
		budget:10000	
	}
	*/
	self.updatParticipant = function(updatParticipant) {
		var parameters1 =[updatParticipant.Name,updatParticipant.url,updatParticipant.id];
		var parameters2 =[updatParticipant.budget,updatParticipant.id];
		model.query("UPDATE Participant SET Name = (?), url = (?) WHERE id = (?)", parameters1);
		return model.query("UPDATE VoyageParticipant SET budget = (?) WHERE id_Participant = (?)", parameters2);
	}
	
	return self;
})

.factory('Article', function(model) {
	var self = this;
	
	self.allArticle =  function() {
		return model.query('SELECT * FROM Article')
		.then(function(result){
			return model.fetchAll(result);
		});
	};
	
	self.getByIdArticle = function(id) {
		return model.query('SELECT * FROM Article WHERE id = ?', [id])
		.then(function(result){
			return model.fetch(result);
		});
	}; 
	
	self.addArticle = function(insertArticle) {
		var parameters = [insertArticle.id_VoyageParticipant, insertArticle.status,insertArticle.Name,insertArticle.Categorie,insertArticle.Prix, insertArticle.Commentaire, insertArticle.date];
		return model.query("INSERT INTO Article (id_VoyageParticipant, status, Name, Categorie, Prix, Commentaire, date) VALUES (?,?,?,?,?,?,?)", parameters);
	};
	
	self.removeArticle = function(removeArticle) {
		var parameters = [removeArticle];
		return model.query("DELETE FROM Article WHERE id = (?)", parameters);
	}
	/*
	var updateArticle = { 
		status:0,
		Name:"essence",
		Categorie:"ion-autre",
		Prix:200,
		Commentaire:"je sais pas ", 
		date:12345678,
		id:9,	
		id_VoyageParticipant:3			
	}
	*/
	self.updateArticle = function(updateArticle) {			
			var parameters = [updateArticle.id_VoyageParticipant, updateArticle.status,updateArticle.Name,updateArticle.Categorie,updateArticle.Prix, updateArticle.Commentaire, updateArticle.date, updateArticle.id];
			model.query("UPDATE Article SET id_VoyageParticipant= (?), status = (?), Name = (?),Categorie = (?),Prix = (?),Commentaire = (?), date = (?) WHERE id = (?)", parameters);
	}	
	
	/*var getuser={
		id_Voyage:1,
		id_Participant:42
	}*/
	self.articlesByUser = function(getuser){
		var parameters=[getuser.id_Voyage,getuser.id_Participant];			
		return model.query("SELECT Article.* FROM Article JOIN VoyageParticipant ON VoyageParticipant.id=Article.id_VoyageParticipant"
		+" WHERE VoyageParticipant.id_voyage = ? AND VoyageParticipant.id_Participant = ?", parameters)
		.then(function(result){
			return model.fetchAll(result);
		});
	};
	
	self.articles = function(id){
		var parameters=[id];			
		return model.query("SELECT Article.* FROM Article JOIN VoyageParticipant ON VoyageParticipant.id=Article.id_VoyageParticipant"
		+" WHERE VoyageParticipant.id_voyage = ?", parameters)
		.then(function(result){
			return model.fetchAll(result);
		});
	};
	
	/*var getuser={
		id_Voyage:1,
		id_Participant:42,
		id_Article:2
	}*/
	self.getArticleById = function(getuser){
		var parameters=[getuser.id_Voyage,getuser.id_Participant,getuser.id_Article];			
		return model.query("SELECT Article.* FROM Article JOIN VoyageParticipant ON VoyageParticipant.id=Article.id_VoyageParticipant"
		+" WHERE VoyageParticipant.id_voyage = ? AND VoyageParticipant.id_Participant = ? AND Article.id = ?", parameters)
		.then(function(result){
			return model.fetch(result);

		});
	};
	
	/*
	ajouter un article avec l'id d'un utilisateur et l'id d'un voyage 	
	var insertArticle = {
		id_Voyage:1,
		id_Participant:42,
		status:0,
		Name:'gto',
		Categorie : 'ion-pizza',
		Prix:200,
		Commentaire:'je sais pas j ai oublier j ai pas toucher',
		date:1431255776*/
	self.addArticleToUser = function(insertArticle){
		var parameters=[insertArticle.id_Voyage,insertArticle.id_Participant];			
		return model.query("SELECT id FROM VoyageParticipant  WHERE VoyageParticipant.id_voyage = ? AND VoyageParticipant.id_Participant = ? ", parameters)
		.then(function(result){
			var parameters = [model.fetch(result).id, insertArticle.status,insertArticle.Name,insertArticle.Categorie,insertArticle.Prix, insertArticle.Commentaire, insertArticle.date];
			return model.query("INSERT INTO Article (id_VoyageParticipant, status, Name, Categorie, Prix, Commentaire, date) VALUES (?,?,?,?,?,?,?)", parameters);
		});
	};
	/* getPrixArticles = {
			idVoyage:1,
			idParticipant:3,
			status:1
		}
	*/
		self.getPrixArticles =  function(getPrixArticles) {
			var parameters = [getPrixArticles.idVoyage,getPrixArticles.idParticipant,getPrixArticles.status];			
			return model.query('SELECT SUM( Prix ) FROM Article JOIN VoyageParticipant ON VoyageParticipant.id=Article.id_VoyageParticipant WHERE VoyageParticipant.id_Voyage = (?)  AND VoyageParticipant.id_Participant= (?) AND Article.status = (?)',parameters)
			.then(function(result){
				var datas=model.fetch(result);
				if(datas["SUM( Prix )"]!=null){
					return datas;
				}
				return 0;
			});			
		};
	return self;
})

.factory('VoyageParticipant', function(model) {
	var self = this;

	self.allVoyageParticipant =  function() {
		return model.query('SELECT * FROM VoyageParticipant')
		.then(function(result){
			return model.fetchAll(result);
		});
	};
	
	self.getByIdVoyageParticipant = function(id) {
		return model.query('SELECT * FROM VoyageParticipant WHERE id = ?', [id])
		.then(function(result){
			return model.fetch(result);
		});
	};
	
	self.addVoyageParticipant = function(insertVoyageParticipant) {
		var parameters = [insertVoyageParticipant.id_Voyage, insertVoyageParticipant.id_Participant,insertVoyageParticipant.budget];
		return model.query("INSERT INTO VoyageParticipant (id_Voyage, id_Participant, budget) VALUES (?,?,?)", parameters);
	};
	
	self.removeVoyageParticipant = function(removeVoyageParticipant) {
		var parameters = [removeVoyageParticipant];
		return model.query("DELETE FROM VoyageParticipant WHERE id = (?)", parameters);
	};
	
	self.updateVoyageParticipant = function(updateVoyageParticipant) {
		var parameters = [updateVoyageParticipant.id_Voyage, updateVoyageParticipant.id_Participant,updateVoyageParticipant.budget,updateVoyageParticipant.id];
		return model.query("UPDATE VoyageParticipant SET id_Voyage= (?), id_Participant = (?), budget = (?) WHERE id = (?)", parameters);
	};
	
	return self;
});














			/*self.db.transaction(function(tx) {
				tx.executeSql("DROP TABLE "+table.name,[], 
				    function(tx,results){
				    	console.log(table.name + " Successfully Dropped");
				    },
				    function(tx,error){
				    	console.log(table.name + "Could not delete");
			    });
			});*/






















