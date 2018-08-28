var sidebar = $('#sidebar').sidebar();

var geojsonLayer = 0;

var map = L.map('map').setView([-15.22,-53.23], 5);
map.zoomControl.setPosition('topright');
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

map.createPane('bbox').style.zIndex = 320;
map.createPane('geojson').style.zIndex = 350;

var drawnItems = new L.LayerGroup().addTo(map);

var drawControl = new L.Control.Draw({
    draw: {
        polygon: false,
        marker: false,
        circlemarker: false,
        polyline: false,
        circle: false,
        rectangle: {
            shapeOptions: {
                color: '#000',
                opacity: .2,
                fillOpacity: 0.1
            }
        }
    },
    edit: false,
    position: 'topright'
});
map.addControl(drawControl);

map.on('draw:drawstart', function(e) {
    drawnItems.clearLayers();
});

map.on('draw:created', function (e) {
    var layer = e.layer;
    layer.options.pane = 'bbox'
    drawnItems.addLayer(layer);
    $('#bbox').val(layer.getBounds().toBBoxString());
});

function onEachFeature(feature, layer) {
    layer._leaflet_id = feature.properties.title;
    layer.setStyle({fillOpacity:0.01, opacity:0.8});

    layer.on('click', function (e) { 
        if(layer._quicklook)
        {
            map.removeLayer(layer._quicklook);
            layer._quicklook = null;
        }
        else{
            var imgUrl = feature.properties.icon;
            
            var anchor = [ [feature.properties.TL_Latitude, feature.properties.TL_Longitude],
                        [feature.properties.TR_Latitude, feature.properties.TR_Longitude],
                        [feature.properties.BR_Latitude, feature.properties.BR_Longitude],
                        [feature.properties.BL_Latitude, feature.properties.BL_Longitude]]

            layer._quicklook = L.imageTransform(imgUrl,anchor).addTo(map).bringToFront();
        }
    });
    layer.on('remove', function (e) { 
        if(layer._quicklook)
        {
            map.removeLayer(layer._quicklook);
            layer._quicklook = null;
        }
    });
}

/* search button */
$(function() {
    $('#searchForm').on('submit', function(event) {
        event.preventDefault();
        $.ajax({
            url: os_url + '/granule.json?',
            type: 'get',
            data: $(this).serialize(),
            dataType:"json",
            success: function(data) {
                map.removeLayer(geojsonLayer);
                geojsonLayer = L.geoJson(data, {
                    onEachFeature: onEachFeature,
                    pane: 'geojson'
                }).addTo(map);
                $('#resultList').empty();
                $('#sbfooter').show();
                $('#sbfooter').text("Total of Results: " + data.totalResults);
                $.each(data.features, function(key, feature){
                    var prop = feature.properties;
                    var card =  `<div class="margin-tb">
                                    <div class="card">
                                        <div class="row"> 
                                            <div class="col-4">
                                                <img class="w-100" src="${prop.icon}" >
                                            </div>
                                            <div class="col-8 nopadding-left">
                                                <div class="card-body nopadding-left">
                                                    <p class="card-title"><b>${prop.title}</b></p>
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-light quicklook" value="${prop.title}"><span class="fa fa-eye-slash"></span></button>
                                                        <button type="button" class="btn btn-light metadata" value="${prop.title}"><span class="fa fa-info"></span></button>
                                                        <a role="button" class="btn btn-light" id=${prop.title} data-toggle="modal" data-target="#modal" target="_blank"><span class="fa fa-download"></span></a
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                    $('#resultList').append(card);
                    $('#'+prop.title).click(prop.enclosure, function(object){
                        $('#modalBody').empty();
                        var itemsList = $('<div/>').addClass('list-group');
                        $.each(object.data, function(index, value) {
                            var color = "#FFFFFF"
                            switch (value.band) {
                                case 'blue':
                                    color = "#A9D0F5"
                                    break;
                                case 'green':
                                    color = "#CCE5CC"
                                    break;
                                case 'red':
                                    color = "#FFCCCC"
                                    break;
                             }
                            var item = `<a href="${value.url}" class="list-group-item list-group-item-action flex-column align-items-start" style="background-color: ${color}">
                                            <div class="d-flex w-100 justify-content-between">
                                               <h5 class="mb-1">${prop.title}</h5>
                                               <small class="text-muted">${value.type}</small>
                                                </div>
                                                <p class="mb-1">${value.band}</p>
                                               <div class="d-flex w-100 justify-content-between">
                                                <small class="text-muted">Radiometric Processing ${value.radiometric_processing}</small>
                                              <i class="fa fa-download"></i>
                                              </div>
                                        </a>`;
                            itemsList.append(item);
                        });
                        $('#modalBody').append(itemsList);
                    })
                   
                });
            }
        });
    });
});

/* quicklook click */
$(document).on('click', '.quicklook', function() {
    var layer = geojsonLayer.getLayer($(this).attr('value'));
    $(this).find('span').toggleClass('fa-eye-slash fa-eye');
    layer.fireEvent('click');
    layer.bringToFront();
});

/* datepickers */
$(function () {
    var datepickersOpt = {
        dateFormat: 'yy-mm-dd'
    }
    $('#startPicker').datepicker($.extend({
        onSelect: function() {
            var minDate = $(this).datepicker('getDate');
            minDate.setDate(minDate.getDate());
            $('#endPicker').datepicker( "option", "minDate", minDate);
        }
    },datepickersOpt));
    $('#endPicker').datepicker($.extend({
        onSelect: function() {
            var maxDate = $(this).datepicker('getDate');
            maxDate.setDate(maxDate.getDate());
            $('#startPicker').datepicker( "option", "maxDate", maxDate);
        }
    },datepickersOpt));
});

/* dropdowns */
$(document).ready(function() { 
    $.ajax({
        type: "GET" ,
        url: os_url ,
        dataType: "xml" ,
        success: function(xml) {
            $(xml).find('OpenSearchDescription').each(function(){
                $(this).find('Url').each(function(){
                    $(this).find('Parameter').each(function(){
                        var name = $(this).attr("name")
                        if(name == "dataset"){
                            $('<option />', {value: "", text: ""}).appendTo($('#collectionIdSelect'));
                            $(this).find("Option").each(function(){
                                var value = $(this).attr("value");
                                $('<option />', {value: value, text: value}).appendTo($('#collectionIdSelect'));
                            })
                        } else if(name == "band"){
                            $(this).find("Option").each(function(){
                                var value = $(this).attr("value");
                                $('<option />', {value: value, text: value}).appendTo($('#bandSelect'));
                            })
                        } else if(name == "radiometricProcessing"){
                            $('<option />', {value: "", text: ""}).appendTo($('#radiometricProcessingSelect'));
                            $(this).find("Option").each(function(){
                                var value = $(this).attr("value");
                                $('<option />', {value: value, text: value}).appendTo($('#radiometricProcessingSelect'));
                            })
                        } else if(name == "type"){
                            $('<option />', {value: "", text: ""}).appendTo($('#typeSelect'));
                            $(this).find("Option").each(function(){
                                var value = $(this).attr("value");
                                $('<option />', {value: value, text: value}).appendTo($('#typeSelect'));
                            })
                        }
                    })
                })
            })
        } 
    });
});