angular.module('starter.constant', [])

.constant("DB_CONFIG",  {
    name: 'eventerDB',	
	version:'1.1',
	description: "database",
    tables: [
		{
			name: 'Voyage',
			columns: [
				{name: 'id', type: 'INTEGER  PRIMARY KEY AUTOINCREMENT'},
				{name: 'Name', type: 'text NOT NULL'},
				{name: 'datedebut', type: 'int NOT NULL'},
				{name: 'datefin', type: 'int NOT NULL'},
				{name: 'estimation', type: ' int NULL'},
				{name: 'description', type: 'text NULL'},
				{name: 'url', type: 'text NULL'}
			]
        },
		{
			name: 'VoyageParticipant',
			columns: [
				{name: 'id', type: 'INTEGER  PRIMARY KEY AUTOINCREMENT'},
				{name: 'id_Voyage', type: 'integer'},
				{name: 'id_Participant', type: 'integer'},				
				{name: 'budget', type: 'int NULL'},
				{name: 'FOREIGN KEY (id_Voyage) ', type:'REFERENCES Voyage(id)'},
				{name: 'FOREIGN KEY (id_Participant) ', type:'REFERENCES Participant(id)'}
			]
        },
		{
			name: 'Participant',
			columns: [
				{name: 'id', type: 'INTEGER  PRIMARY KEY AUTOINCREMENT'},
				{name: 'Name', type: 'text NOT NULL'},
				{name: 'url', type: 'text NULL'}
			]
        },
		{
            name: 'Article',
            columns: [
				{name: 'id', type: 'INTEGER  PRIMARY KEY AUTOINCREMENT'},
                {name: 'id_VoyageParticipant', type: 'integer NOT NULL'},
				{name: 'status', type: 'INTEGER NOT NULL'},
                {name: 'Name', type: 'text NOT NULL'},
                {name: 'Categorie', type: 'text NOT NULL'},
                {name: 'Prix', type: 'integer NOT NULL'},
                {name: 'Commentaire', type: 'text NULL'},
                {name: 'date', type: 'integer NULL'},
				{name:'FOREIGN KEY (id_VoyageParticipant) ', type:'REFERENCES VoyageParticipant(id)'}
	
            ]
        }
    ]
});