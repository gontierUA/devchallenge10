;(function($, window) {
    'use strict';

    var app = window;

    var DEFAULTS = {
        SELECTORS: {
            MESSAGE_BOX: '.message-box'
        }
    };

    var Message = function(options) {
        this.options = $.extend({}, this.defaults, options);

        this.elems = {
            messageBox: $(this.options.SELECTORS.MESSAGE_BOX)
        };

        this.init();
    };

    $.extend(Message.prototype, {
        defaults: DEFAULTS,

        init: function() {
            var _this = this;

            events.subscribe(app.EVENTS.SHOW_MESSAGE, _this.showMessage.bind(this));
        },

        showMessage: function(text) {
            var _this = this;

            _this.elems.messageBox.html(String(text));
        }
    });

    var MessageModule = new Message();
    app.Message = Message;

})(jQuery, window);