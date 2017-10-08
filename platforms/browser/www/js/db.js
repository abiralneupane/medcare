var DB = {
	db: null,

	init: function(callback){
		this.db = window.openDatabase("db_mypharma", "1.0", "My Pharma", 200000);
		this.setupDatabase(callback);
	},

	setupDatabase: function(callback){
		var self = this;
        /* Install Database and enter dummy content. Run only for the first time */
        var applaunchCount = window.localStorage.getItem('launchCount');
        if(!applaunchCount){    
            self.db.transaction( self.populateDB, self.errorCB, function(){
                self.enterData(function(tx){
                    window.localStorage.setItem('launchCount',1);
                    callback();
                });
            } );
        }else{
            callback();
        }
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

    searchAllMedicineByName: function(name, callback){
        var self = this;
        self.db.transaction( function(tx){
            tx.executeSql( 'SELECT * FROM medicine WHERE name LIKE "%'+name+'%" OR code = "'+name+'"', [], callback, self.errorCB );
        }, self.errorCB, function(tx){});
    },

    searchMedicineInCategory: function(name, category_id, callback){
        var self = this;
        self.db.transaction( function(tx){
            console.log('SELECT * FROM medicine WHERE ( name LIKE "%'+name+'%" OR code = "'+name+'") AND category ='+category_id);
            tx.executeSql( 'SELECT * FROM medicine WHERE ( name LIKE "%'+name+'%" OR code = "'+name+'") AND category ='+category_id, [], callback, self.errorCB );
        }, self.errorCB, function(tx){});
    },


    enterData: function(cb){
        var self = this;
        var path = window.location.href.replace('index.html', '');
        $.getJSON(path + "medicines.json", function(data){
        //$.get( "medicines.json", function( data ) {
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

                    }, self.errorCB );
                }, self.errorCB, cb);
            });
        });
        
        /**/
    },

    errorCB: function(err) {
        console.error("Error processing SQL: ", err);
    }
};