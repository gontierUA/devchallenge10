/*globals sinon, expect*/

;(function($) {
    'use strict';

    var app = window;

    describe('MessageModule.test.js', function() {
        var sut = new app.Message();
        var sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('init', function() {
            beforeEach(function() {
                sandbox.spy($.fn, 'html');
                sandbox.spy(events, 'subscribe');

                sut.init();
            });

            it('should subscribe to showMessage event', function() {
                expect(events.subscribe).to.have.been.calledWith('showMessage', sinon.match.func);
            });

            it('should print message', function() {
                sut.showMessage();

                expect(sut.elems.messageBox.html).to.have.been.calledWith(sinon.match.string);
            });
        });
    });

})(jQuery, window);
