;(function($, window) {
    'use strict';

    var app = window;

    var Graph = function() {
        this.structure = [];

        this.init();
    };

    $.extend(Graph.prototype, {
        init: function() {
            events.subscribe(app.EVENTS.ROUTES_LOADED, this.createGraph.bind(this));
            events.subscribe(app.EVENTS.SELECTS_WAS_SET, this.findShortPath.bind(this));
        },

        createGraph: function(data) {
            for (var prop in data.edges) {
                if (data.edges.hasOwnProperty(prop)) {
                    if (!this.structure[data.edges[prop].start]) {
                        this.structure[data.edges[prop].start] = [];
                    }

                    this.structure[data.edges[prop].start][data.edges[prop].end] = data.edges[prop].distance;

                    if (!this.structure[data.edges[prop].end]) {
                        this.structure[data.edges[prop].end] = [];
                    }

                    this.structure[data.edges[prop].end][data.edges[prop].start] = data.edges[prop].distance;
                }
            }
        },

        // Dijkstra's algorithm
        findShortPath: function(points) {
            var START_POINT = points.startPoint;
            var END_POINT = points.endPoint;

            var queue = $.extend({}, this.structure);
            var queueProp;

            var distances = [];
            var tempDistances = [];
            var tempDistancesProp;

            var currentMinNode;
            var currentMinWeight;

            var shortestPath = [];
            var predecessor = {};

            var currentNodeInQueue;
            var currentNodeNeighbor;

            if (START_POINT === END_POINT) {
                events.publish(app.EVENTS.PATH_FOUNDED);
                events.publish(app.EVENTS.SHOW_MESSAGE, 'Please, select two different stations');

                return;
            }

            // set all unknown distances to Infinity
            for (queueProp in queue) {
                if (queue.hasOwnProperty(queueProp)) {
                    distances[queueProp] = Infinity;
                }
            }

            distances[START_POINT] = 0; // start point will be 0
            tempDistances[START_POINT] = 0; // need for min weight calculation

            while (Object.keys(queue).length) {

                // get node with smallest weight
                currentMinWeight = Infinity;

                for (tempDistancesProp in tempDistances) {
                    if (tempDistances.hasOwnProperty(tempDistancesProp)) {
                        if (tempDistances[tempDistancesProp] < currentMinWeight) {
                            currentMinWeight = tempDistances[tempDistancesProp];
                            currentMinNode = tempDistancesProp;
                        }
                    }
                }

                currentNodeInQueue = queue[currentMinNode];

                queue[currentMinNode] = null; // memory optimization
                delete queue[currentMinNode]; // remove currentMinNode from queue

                for (currentNodeNeighbor in currentNodeInQueue) {
                    if (currentNodeInQueue.hasOwnProperty(currentNodeNeighbor)) {
                        var distanceBetweenNodes = currentNodeInQueue[currentNodeNeighbor];
                        var resultDistance = distances[currentMinNode] + distanceBetweenNodes;

                        if (!queue[currentNodeNeighbor]) { // skip already processed node (it was removed from queue)
                            continue;
                        }

                        predecessor[currentNodeNeighbor] = currentMinNode;

                        if (resultDistance < distances[currentNodeNeighbor]) {
                            distances[currentNodeNeighbor] = tempDistances[currentNodeNeighbor] = resultDistance;
                        }

                        if (currentNodeNeighbor === END_POINT) {
                            while (currentNodeNeighbor !== START_POINT) {
                                shortestPath.push(currentNodeNeighbor);
                                currentNodeNeighbor = predecessor[currentNodeNeighbor];
                            }

                            shortestPath.push(START_POINT);
                            shortestPath.reverse();

                            events.publish(
                                app.EVENTS.SHOW_MESSAGE,
                                'Shortest path was found!<br>Distance: ' + resultDistance.toFixed(2) + ' km.'
                            );

                            events.publish(app.EVENTS.PATH_FOUNDED, shortestPath);

                            return;
                        }
                    }
                }

                tempDistances[currentMinNode] = null; // memory optimization
                delete tempDistances[currentMinNode];
            }
        }
    });

    var GraphModule = new Graph();
    app.Graph = Graph;

})(jQuery, window);