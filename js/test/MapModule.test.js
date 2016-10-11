/*globals sinon, expect*/

;(function($, window) {
    'use strict';

    var app = window;

    describe('MapModule.test.js', function() {
        var sut = new app.Map();
        var sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('init', function() {
            beforeEach(function() {
                sandbox.spy(sut, 'initMap');
                sandbox.spy(sut, 'loadStations');
                sandbox.spy(sut, 'bindEvents');

                sut.init();
            });

            it('should init google Map', function() {
                expect(sut.initMap).to.have.been.called;
            });

            it('should load stations', function() {
                expect(sut.loadStations).to.have.been.called;
            });

            it('should bind events', function() {
                expect(sut.bindEvents).to.have.been.called;
            });
        });

        describe('bindEvents', function() {
            beforeEach(function() {
                sandbox.spy(events, 'subscribe');

                sut.bindEvents();
            });

            it('should subscribe on routesLoaded', function() {
                expect(events.subscribe).to.have.been.calledWith('routesLoaded', sinon.match.func);
            });

            it('should subscribe on pathFounded', function() {
                expect(events.subscribe).to.have.been.calledWith('pathFounded', sinon.match.func);
            });
        });

        describe('populateSelects', function() {
            beforeEach(function() {
                sandbox.spy($.fn, 'append');

                sut.populateSelects();
            });

            it('should populate selects', function() {
                expect(sut.elems.selectStart.append).to.have.been.calledWith(sinon.match.string);
                expect(sut.elems.selectEnd.append).to.have.been.calledWith(sinon.match.string);
            });
        });

        describe('_loadStationsCallback', function() {
            beforeEach(function() {
                sandbox.spy(events, 'publish');

                sut._loadStationsCallback({data: 'data'});
            });

            it('should publish routesLoaded event', function() {
                expect(events.publish).to.have.been.calledWith('routesLoaded', {data: 'data'});
            });
        });

        describe('handleSelect', function() {
            var e = {
                currentTarget: function () {}
            };

            beforeEach(function() {
                sandbox.spy(sut, 'setMapMarker');

                sut.handleSelect(e);
            });

            it('should set marker for END station', function() {
                expect(sut.setMapMarker).to.have.been.called;
            });
        });

        describe('handleMapClick', function() {
            var e = {
                latLng: {
                    lat: function() {
                        return 10;
                    },
                    lng: function() {
                        return 5;
                    }
                }
            };

            beforeEach(function() {
                sandbox.spy($.fn, 'val');
                sandbox.stub(sut, 'getClosestStationId').returns(true);

                sut.handleMapClick(e);
            });

            it('should set marker for START station', function() {
                expect(sut.elems.selectStart.val).to.have.been.called;
            });
        });

        describe('getClosestStationId', function() {
            var e = {
                latLng: {
                    lat: function() {
                        return 10;
                    },
                    lng: function() {
                        return 5;
                    }
                }
            };

            beforeEach(function() {
                sandbox.spy($.fn, 'val');
                sandbox.spy(sut, 'getClosestStationId');

                sut.stationsData = [
                    {
                        "id": "Heroiv_Dnipra",
                        "pos": {
                            "lat": 5,
                            "lng": 3
                        }
                    },
                    {
                        "id": "minska",
                        "pos": {
                            "lat": 50,
                            "lng": 30
                        }
                    }
                ];

            });

            it('should get closest station', function() {
                expect(sut.getClosestStationId(45, 20)).to.equal("minska");
            });
        });
    });

})(jQuery, window);
