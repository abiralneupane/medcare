var app = {
    categoryPage: '',

    productPage: [],

    screens: {},

    tempObj: {},

    initialize: function() {
        app.screens = {
            current: '',
            prev: ''
        };

        this.bindEvents();
    },

    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("backbutton", this.sendBack, false);
    },

    sendBack: function(){
        if(app.screens.current == "home" ){
            navigator.app.exitApp();
        }

        switch(app.screens.prev){
            case 'home':
                app.home();
            break;

            case 'medicines':
                app.medicines(app.tempObj.id, app.tempObj.title);
            break
        }
    },

    onDeviceReady: function() {
        var self = app;
        var applaunchCount = window.localStorage.getItem('launchCount');
        if(!applaunchCount){
            $('.loading').show();
        }

        DB.init(function(){
            $('.loading').hide();
            app.home();
            
            $('.btn-search').on('click', function(event){
                event.preventDefault();
                self.screens.prev = self.screens.current;
                self.screens.current = 'search';

                var btn = $(this);
                btn.find('i').removeClass('fa-search');
                btn.find('i').addClass('fa-spinner fa-spin');

                var category = $('.medicine-container').attr('data-category');
                var query =  $(this).parents('.search-bar').find('input').val();

                var html = '<h3 class="subtitle">Search result for '+query+'</h3>';

                if(typeof category == "undefined"){
                    DB.searchAllMedicineByName(query, function(tx, results){
                        $('.screen').hide();
                        if(results.rows.length > 0){
                            html += '<div class="medicine-container" >';                    
                            html += self.getMedicineHTML(results.rows);
                            html += '</div>';
                        }else{
                            html = "<p>No data available</p>";
                        }

                        $('.content').html(html);
                        
                        btn.find('i').removeClass('fa-spinner').removeClass('fa-spin');
                        btn.find('i').addClass('fa-search');

                        $('.screen').fadeIn(500);
                    });
                }else{
                    DB.searchMedicineInCategory(query, category, function(tx, results){
                        if(results.rows.length > 0){
                            html += '<div class="medicine-container" data-category="'+category+'">';                    
                            html += self.getMedicineHTML(results.rows);
                            html += '</div>';
                        }else{
                            html = "<p>No data available</p>";
                        }

                        $('.content').html(html);
                        $('.screen').fadeIn(500);
                    });
                }    
            }); 
        });
    },

    home: function(){
        var self = this;
        $('.screen').hide();
        
        self.screens.current = 'home';
        
        if( self.categoryPage != "" ){
            $('.search-bar input[type="text"]').attr('placeholder','Search medicines');
            $('.content').html(self.categoryPage);
            $('.screen').fadeIn(500);
        }else{
            DB.getCategory(function(tx, results){
                var html;
                var title;
                
                if(results.rows.length > 0){
                    html = '<h3 class="subtitle">Categories</h3>';
                    html += '<ul class="category-list">';
                    $.each(results.rows, function(key, val){
                        title = val.name;
                        html += '<li class="category"><a href="#" data-id="'+val.id+'"><span>'+title+'</span> <i class="fa fa-angle-right"></i></a><li>';
                    });    
                }else{
                    html = "<p>No data available</p>";
                }

                self.categoryPage = html;

                $('.search-bar input[type="text"]').attr('placeholder','Search medicines');

                $('.content').html(html);
                $('.screen').fadeIn(500);

                $(document).on('click','.category-list .category a', function(event){
                    event.preventDefault();
                    self.screens.prev = self.screens.current;

                    title = $(this).find('span').text();
                    var id = $(this).data('id');
                    $('.screen').hide();

                    self.tempObj = {id: id, title: title};
                    self.medicines(id, title);
                });
            });
        }
    },

    medicines: function(id, title){
        var self = this;
        self.screens.current = 'medicines';

        if(typeof self.productPage[id] != "undefined" ){
            $('.content').html(self.productPage[id]);
            $('.screen').fadeIn(500);
        }else{
            DB.getMedicine(id, function(tx, results){
                var html = '<h3 class="subtitle">'+title+'</h3>';
                if(results.rows.length > 0){
                    html += '<div class="medicine-container" data-category="'+id+'">';                    
                    html += self.getMedicineHTML(results.rows);
                    html += '</div>';
                }else{
                    html = "<p>No data available</p>";
                }

                self.productPage[id] = html;
                $('.search-bar input[type="text"]').attr('placeholder','Search medicines in '+title);

                $('.content').html(html);
                $('.screen').fadeIn(500);
            });
        }
    },

    getMedicineHTML: function(rows){
        var html = "";
        $.each(rows, function(key, val){
            html += '<div class="medicine" id="medicine-'+val.id+'">';
                html +='<h4 class="medicine-name">'+val.name+'</h4>';
                html +='<hr class="separator" />';
                html +='<p class="medicine-price"><strong>Price</strong>: '+val.price+'</p>';
                html += '<div class="medicine-meta"><span><strong>Code</strong>: '+val.code+'</span> | <span><strong>Available</strong>: '+val.stock+'</span></div>';
            html += '</div>';
        });

        return html;
    }
};
