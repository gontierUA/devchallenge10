;(function($, window, document, google) {
    'use strict';

    var app = window;

    var DEFAULTS = {
        SELECTORS: {
            SELECT_START: '#stationStart',
            SELECT_END: '#stationEnd'
        },
        SELECT_TYPE: {
            SELECT_START: 'stationStart',
            SELECT_END: 'stationEnd'
        },
        APP_DATA: 'data/data.json'
    };

    var Map = function(options) {
        this.options = $.extend({}, this.defaults, options);

        this.elems = {
            selectStart: $(this.options.SELECTORS.SELECT_START),
            selectEnd: $(this.options.SELECTORS.SELECT_END)
        };

        this.map = null;
        this.mapPath = null;

        this.stationsData = null;

        this.markerStart = null;
        this.markerEnd = null;
        this.markersSet = 0;

        this.selectStartVal = null;
        this.selectEndVal = null;

        this.init();
    };

    $.extend(Map.prototype, {
        defaults: DEFAULTS,

        init: function() {
            this.initMap();
            this.loadStations();

            this.bindEvents();
        },

        initMap: function() {
            this.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 14,
                center: {lat: 50.448021, lng: 30.525301}
            });

            this.map.setOptions({
                streetViewControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: true
            });
        },

        bindEvents: function() {
            this.elems.selectStart.on('change', this.handleSelect.bind(this));
            this.elems.selectEnd.on('change', this.handleSelect.bind(this));

            google.maps.event.addListener(this.map, 'click', this.handleMapClick.bind(this));

            events.subscribe(app.EVENTS.ROUTES_LOADED, this.populateSelects.bind(this));
            events.subscribe(app.EVENTS.PATH_FOUNDED, this.drawPath.bind(this));
        },

        handleMapClick: function(e) {
            var pointLat = e.latLng.lat();
            var pointLng = e.latLng.lng();

            if (!this.elems.selectStart.val()) {
                this.elems.selectStart
                    .val(this.getClosestStationId(pointLat, pointLng))
                    .trigger('change');

                this.markersSet++;
            } else {
                this.elems.selectEnd
                    .val(this.getClosestStationId(pointLat, pointLng))
                    .trigger('change');
            }
        },

        handleSelect: function(e) {
            var $select = $(e.currentTarget);
            var selectValue = $select.val();

            if ($select[0].id === DEFAULTS.SELECT_TYPE.SELECT_START) {
                this.selectStartVal = selectValue;
                this.setMapMarker(selectValue, DEFAULTS.SELECT_TYPE.SELECT_START);
            } else {
                this.selectEndVal = selectValue;
                this.setMapMarker(selectValue, DEFAULTS.SELECT_TYPE.SELECT_END);
            }

            if (this.selectEndVal && this.selectEndVal) {
                events.publish(app.EVENTS.SELECTS_WAS_SET, {
                    startPoint: this.selectStartVal,
                    endPoint: this.selectEndVal
                });
            }
        },

        loadStations: function() {
            $.getJSON(DEFAULTS.APP_DATA, this._loadStationsCallback.bind(this));
        },

        _loadStationsCallback: function (data) {
            this.stationsData = data.stations;

            events.publish(app.EVENTS.ROUTES_LOADED, data);
        },

        populateSelects: function() {
            var options = '';

            for (var prop in this.stationsData) {
                if (this.stationsData.hasOwnProperty(prop)) {
                    options += '<option value="' + this.stationsData[prop].id + '">' + this.stationsData[prop].name + '</option>';
                }
            }

            this.elems.selectStart.append(options);
            this.elems.selectEnd.append(options);
        },

        setMapMarker: function(markerId, markerType) {
            if (markerType === DEFAULTS.SELECT_TYPE.SELECT_START) {
                (this.markerStart) ? this.markerStart.setMap(null) : '';
            } else {
                (this.markerEnd) ? this.markerEnd.setMap(null) : '';
            }

            for (var prop in this.stationsData) {
                if (this.stationsData.hasOwnProperty(prop)) {
                    if (markerId === this.stationsData[prop].id) {
                        if (markerType === DEFAULTS.SELECT_TYPE.SELECT_START) {
                            this.markerStart = new google.maps.Marker({
                                map: this.map,
                                draggable: false,
                                position: this.stationsData[prop].pos,
                                icon: 'img/startPoint.png'
                            });
                        } else {
                            this.markerEnd = new google.maps.Marker({
                                map: this.map,
                                draggable: false,
                                position: this.stationsData[prop].pos,
                                icon: 'img/endPoint.png'
                            });
                        }
                    }
                }
            }
        },

        drawPath: function(path) {
            var pointsArr = [];

            if (this.mapPath) {
                this.mapPath.setMap(null);
            }

            this.mapPath = new google.maps.Polyline({
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 3,
                map: this.map
            });

            for (var i = 0; i < path.length; i++) {
                for (var prop in this.stationsData) {
                    if (this.stationsData.hasOwnProperty(prop)) {
                        if (path[i] === this.stationsData[prop].id) {
                            pointsArr.push(this.stationsData[prop].pos);
                        }
                    }
                }
            }

            this.mapPath.setPath(pointsArr);
        },

        getClosestStationId: function(userLat, userLng) {
            var pathToCurrentStation;
            var nearestStationPath;
            var stationIndex;

            var EARTH_CURVATURE = 1.1515;
            var KM_IN_MILE = 1.60934;

            function _getRoadLength(userLat, userLng, currentLat, currentLng) {
                var radlat1 = Math.PI * userLat / 180;
                var radlat2 = Math.PI * currentLat / 180;

                var theta = userLng - currentLng;
                var radtheta = Math.PI * theta / 180;

                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

                return Math.acos(dist) * 180 / Math.PI * 60 * EARTH_CURVATURE * KM_IN_MILE;
            }

            for (var i = 0; i < this.stationsData.length; i++) {
                pathToCurrentStation = _getRoadLength(userLat, userLng, this.stationsData[i].pos.lat, this.stationsData[i].pos.lng);

                if (i === 0) {
                    nearestStationPath = pathToCurrentStation;
                    stationIndex = i;
                } else {
                    if (pathToCurrentStation < nearestStationPath) {
                        nearestStationPath = pathToCurrentStation;
                        stationIndex = i;
                    }
                }
            }

            return this.stationsData[stationIndex].id;
        }
    });

    var MapModule = new Map();
    app.Map = Map;

})(jQuery, window, document, window.google);
