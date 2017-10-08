var app = {
    initialize: function() {
        this.bindEvents();
    },

    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {

    },

    receivedEvent: function(id) {
        /* Enter dummy data to the database. Runs only for the first time */
        DB.init();
    }
};
