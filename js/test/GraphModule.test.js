/*globals sinon, expect*/

;(function($, window) {
    'use strict';

    var app = window;

    describe('GraphModule.test.js', function() {
        var sut = new app.Graph();
        var sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('findShortPath', function() {
            beforeEach(function() {
                sandbox.stub(events, 'publish').returns(true);

                sut.findShortPath({
                    startPoint: 'minska',
                    endPoint: 'minska'
                });
            });

            it('should publish event pathFounded', function() {
                expect(events.publish).to.have.been.calledWith('pathFounded');
            });

            it('should publish event showMessage', function() {
                expect(events.publish).to.have.been.calledWith('showMessage', sandbox.match.string);
            });
        });
    });

})(jQuery, window);
