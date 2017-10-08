var DB = {
	db: null,

	init: function(){
		this.db = window.openDatabase("db_mypharma", "1.0", "My Pharma", 200000);
		this.setupDatabase();
	},

	setupDatabase: function(){
		var self = this;
		self.db.transaction( self.populateDB, self.errorCB, function(){
            self.enterData();
        } );
	},

	populateDB: function(tx){

        //tx.executeSql( 'DROP TABLE category' );
        // tx.executeSql( 'DROP TABLE medicine' );
        
        tx.executeSql( 'CREATE TABLE IF NOT EXISTS category ( \
        	id INTEGER PRIMARY KEY AUTOINCREMENT, \
        	name TEXT NOT NULL, \
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
        );' );

        tx.executeSql( 'CREATE TABLE IF NOT EXISTS medicine ( \
        	id INTEGER PRIMARY KEY AUTOINCREMENT, \
        	code TEXT NOT NULL, \
        	name TEXT, \
        	category TEXT, \
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
        );' );
    },

    getCategory: function(cb){
    	var self = this;
    	self.db.transaction( function(tx){
    		tx.executeSql( 'SELECT * FROM category', [], cb, self.errorCB );
    	}, self.errorCB, function(tx){});
    },

    getMedicine: function(id, cb){
        var self = this;
        /*let playlistObj = {
            id: 0,
            title: '',
            songs: []
        };
        self.db.transaction( function(tx){
            tx.executeSql( 'SELECT * FROM playlist WHERE id='+id, [], function(tx, playlist){
                let row = playlist.rows[0];
                playlistObj.id = row.id;
                playlistObj.title = row.title;

                let songs = JSON.parse(row.songs);

                if(songs.length > 0 ){
                    let songQueryPart = '';
                    for(var i=0; i<songs.length; i++){
                        songQueryPart += 'id = '+songs[i];
                        if( i < songs.length - 1 ){
                            songQueryPart += ' OR ';
                        }
                    }
                    
                    tx.executeSql( 'SELECT * FROM songs WHERE '+songQueryPart, [], function(tx, songs){
                        playlistObj.songs = songs.rows;

                        cb(playlistObj);

                    }, self.errorCB );

                }else{
                    cb(playlistObj);
                }
            }, self.errorCB );
        }, self.errorCB, function(tx){});*/
    },

    enterData: function(){
        self.db.transaction( function(tx){
            let query = "INSERT INTO category(name) VALUES ( 'test')";
            tx.executeSql(query, [], function(){
                // insert medicine forthat category
                
            }, self.errorCB );
        }, self.errorCB, function(tx){});
    },

    errorCB: function(err) {
        console.error("Error processing SQL: ", err);
    }
};