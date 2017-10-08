var DB = {
	db: null,

	init: function(){
		this.db = window.openDatabase("db_mypharma", "1.0", "My Pharma", 200000);
		this.setupDatabase();
	},

	setupDatabase: function(){
		var self = this;
		self.db.transaction( self.populateDB, self.errorCB, function(){
            /* Enter dummy data to the database. Run only for the first time */
            //self.enterData();
        } );
	},

	populateDB: function(tx){

        /*tx.executeSql( 'DROP TABLE category' );
        tx.executeSql( 'DROP TABLE medicine' );*/
        
        tx.executeSql( 'CREATE TABLE IF NOT EXISTS category ( \
        	id INTEGER PRIMARY KEY AUTOINCREMENT, \
        	name TEXT NOT NULL, \
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
        );' );

        tx.executeSql( 'CREATE TABLE IF NOT EXISTS medicine ( \
        	id INTEGER PRIMARY KEY AUTOINCREMENT, \
        	code TEXT NOT NULL, \
        	name TEXT, \
            price TEXT, \
            category INTEGER, \
        	stock INTEGER, \
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
            FOREIGN KEY(category) REFERENCES category (id) \
        );' );

        console.log("DB created");
    },

    getCategory: function(cb){
    	var self = this;
    	self.db.transaction( function(tx){
    		tx.executeSql( 'SELECT * FROM category', [], cb, self.errorCB );
    	}, self.errorCB, function(tx){});
    },

    getMedicine: function(id, cb){
        var self = this;
        self.db.transaction( function(tx){
            tx.executeSql( 'SELECT * FROM medicine WHERE category = '+id, [], cb, self.errorCB );
        }, self.errorCB, function(tx){});
    },

    enterData: function(){
        var self = this;
        $.get( "medicines.json", function( data ) {
            $.each(data, function(key, val){
                self.db.transaction( function(tx){
                    var query = "INSERT INTO category(name) VALUES ( '"+val.name+"')";
                    tx.executeSql(query, [], function(tx, results){
                        var category_id = results.insertId;
                        
                        var medsArray = [];
                        $.each(val.medicines, function(medKey, med){
                            medsArray.push('("'+med.code+'","'+med.name.replace('"','\\"')+'","'+med.price+'",'+med.stock+','+category_id+')');
                        });

                        var query = "INSERT INTO medicine(code, name, price, stock, category) VALUES "+medsArray.join(",");
                        tx.executeSql(query, [], function(tx, results){ console.log("Inserted"); });
                        console.log(query);

                    }, self.errorCB );
                }, self.errorCB, function(tx){});
            });
        });
        
        /**/
    },

    errorCB: function(err) {
        console.error("Error processing SQL: ", err);
    }
};