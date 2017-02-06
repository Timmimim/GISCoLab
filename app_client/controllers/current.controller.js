(function() {

    angular
        .module('giscolab')
        .controller('currentCtrl', currentCtrl);
    currentCtrl.$inject = ['$location', 'meanData', 'userService', '$scope', 'leafletDrawEvents', 'projectService', '$rootScope'];
    function currentCtrl($location, meanData, userService, $scope, leafletDrawEvents, projectService, $rootScope) {
        console.log("current Controller is running!!!");

       var vm = this;
        vm.project = {};

        var pid = projectService.getID();

        // You must have picked a project
        if(pid !== undefined) {
            meanData.getProject(pid)
                .success(function (data) {
                    vm.project = data;
                    var proKey = vm.project.uniqueKey;
                    $rootScope.uniKey = proKey;
                    loadnewjson();
                })
                .error(function (e) {
                    console.log(e);
                });
        } else {
        alert("kein Projekt ausgewählt. Bitte erst eins auswählen!");
        };

        // Setting the vars for the tree
        var loadnewjson = function () {
            $.ajax({
                url: "api/loadTreedata/" + $rootScope.uniKey,
                type: "Get",
                success: function (data) {
                    var old = JSON.stringify(data).replace(/children/g, "data"); //convert to JSON string
                    var newjson = JSON.parse(old); //convert back to array
                    console.log(newjson);

                    $rootScope.newjson = newjson;
                },
                error: function (msg) { alert(msg); }
            });
        };

        /* start leaflet */
        var drawnItems = new L.FeatureGroup();
        angular.extend(vm, {
            center: {
                lat: 51.964711,
                lng: 7.628496,
                zoom: 12
            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                        type: 'xyz'
                    },
                    hotosm: {
                        name: 'Humanitarian OSM',
                        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }
                },
                overlays:{

                }
            },

            drawOptions: {
                position: "bottomright",
                draw: {
                    polyline: false,
                    polygon: {
                        metric: false,
                        showArea: true,
                        drawError: {
                            color: '#b00b00',
                            timeout: 1000
                        },
                        shapeOptions: {
                            color: 'blue'
                        }
                    },
                    circle: false,
                    marker: false
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: true
                }
            }
        });

        var handle = {
            created: function (e, leafletEvent, leafletObject, model, modelName) {

                var layerJSON = leafletEvent.layer.toGeoJSON();
                //console.log(layerJSON);
                var xMin = layerJSON.geometry.coordinates["0"]["0"]["0"].toString(),
                    xMax = layerJSON.geometry.coordinates["0"]["2"]["0"].toString(),
                    yMin = layerJSON.geometry.coordinates["0"]["0"]["1"].toString(),
                    yMax = layerJSON.geometry.coordinates["0"]["2"]["1"].toString();

                appendElement(xMin, xMax, yMin, yMax);

                drawnItems.addLayer(leafletEvent.layer.bindPopup(
                        "<b>Values for bbox1 variable: </b> <br>" +
                        "xMin: " + layerJSON.geometry.coordinates["0"]["0"]["0"].toString() + "<br>" +
                        "xMax: " + layerJSON.geometry.coordinates["0"]["2"]["0"].toString() + "<br>" +
                        "yMin: " + layerJSON.geometry.coordinates["0"]["0"]["1"].toString() + "<br>" +
                        "yMax: " + layerJSON.geometry.coordinates["0"]["2"]["1"].toString()
                    )
                )
            },
            edited: function(arg) {},
            deleted: function(arg) {
                var layers;
                layers = arg.layers;
                drawnItems.removeLayer(layer);
            },
            drawstart: function(arg) {},
            drawstop: function(arg) {},
            editstart: function(arg) {},
            editstop: function(arg) {},
            deletestart: function(arg) {},
            deletestop: function(arg) {}
        };
        var drawEvents = leafletDrawEvents.getAvailableEvents();
        drawEvents.forEach(function(eventName){
            $scope.$on('leafletDirectiveDraw.' + eventName, function(e, payload) {
                //{leafletEvent, leafletObject, model, modelName} = payload
                var leafletEvent, leafletObject, model, modelName; //destructuring not supported by chrome yet :(
                leafletEvent = payload.leafletEvent, leafletObject = payload.leafletObject, model = payload.model,
                    modelName = payload.modelName;
                handle[eventName.replace('draw:','')](e,leafletEvent, leafletObject, model, modelName);
            });
        });


        // Download the Project as zip
        $scope.download = function(key){
            window.open('/api/download/'+key);
        };

        // Treeview
        var tree = new webix.ui({
            container:"treebox",
            id: "myTree",
            view:"tree",
            select:"true",
            on: {"itemClick": function () {alert("item has just been clicked");}},
            template:"{common.icon()} {common.folder()} <span onclick='treeData();'>#name#<span>",
            data: $rootScope.newjson
        });

        // Load the selected data in the right areas
        treeData = function() {
            var id = tree.getSelectedId();
            var item = tree.getItem(id);
            var path = item.path;
            var itemname = item.name;
            var ending = item.extension
            if (ending == ".txt") {
                var txtstring = "/txtFiles/";
            }
            else if (ending == '.r') {
                var txtstring = "/rScripts/";
            }else if(ending == '.html'){
                var txtstring = "/Layers/";
            }
            if (ending !== undefined) {
                if (ending !== ".html") {
                    $.ajax({
                        type: "GET",
                        url: "api/loadTreedata2/" + $rootScope.uniKey + txtstring + itemname,
                        success: function (data) {
                            if (ending == '.r') {
                                $('#codearea').html(data);
                                itemname = itemname.replace(".R", "");
                                $('#fileName').html(itemname);
                            } else if (ending == '.txt') {
                                $('#txtview').html(data);
                                itemname = itemname.replace(".txt", "");
                                $('#noteFName').html(itemname);
                            }
                        }
                    })
                }
                else
                    if (ending == '.html') {
                        $.ajax({
                            type: "GET",
                            url: "api/loadTreedata3/" + $rootScope.uniKey + txtstring + itemname,
                            success: function (data) {
                                vm.layers.overlays.push(data);
                            }
                        });
                    }
            }
        }


        function appendElement(xMin, xMax, yMin, yMax) {
            angular.element('#codearea').append(
                '<textarea id="xMin" ng-hide="true">'+xMin+'</textarea>' +
                '<textarea id="xMax" ng-hide="true">'+xMax+'</textarea>' +
                '<textarea id="yMin" ng-hide="true">'+yMin+'</textarea>' +
                '<textarea id="yMax" ng-hide="true">'+yMax+'</textarea>'
            );
        }

        // Functions for setting the active class in the navbars
        $scope.buttonCodeToggle = function(){
            angular.element( document.querySelector('#code')).addClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');
            angular.element( document.querySelector('#txt')).removeClass('active');
            angular.element( document.querySelector('#options')).removeClass('active');
        };
        $scope.buttonTreeToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).addClass('active');
            angular.element( document.querySelector('#txt')).removeClass('active');
            angular.element( document.querySelector('#options')).removeClass('active');
        };
        $scope.buttonTxtToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');
            angular.element( document.querySelector('#txt')).addClass('active');
            angular.element( document.querySelector('#options')).removeClass('active');
        }
        $scope.buttonOptionsToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');
            angular.element( document.querySelector('#txt')).removeClass('active');
            angular.element( document.querySelector('#options')).addClass('active');

        }
        $scope.buttonshowthemapToggle = function(){
            angular.element( document.querySelector('#showthemap')).addClass('active');
            angular.element( document.querySelector('#showtheresult')).removeClass('active');

        }
        $scope.buttonshowtheresultToggle = function(){
            angular.element( document.querySelector('#showthemap')).removeClass('active');
            angular.element( document.querySelector('#showtheresult')).addClass('active');

        }

    }
})();