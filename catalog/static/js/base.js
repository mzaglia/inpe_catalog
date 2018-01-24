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

$(function() {
    $('#searchForm').on('submit', function(event) {
        event.preventDefault();
        $.ajax({
            url: 'http://www.dpi.inpe.br/opensearch/granule.json?',
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
                                                        <a role="button" class="btn btn-light" href="${prop.enclosure}" target="_blank"><span class="fa fa-download"></span></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;                      
                    $('#resultList').append(card);
                });
               
            }
        });
    });
});

$(document).on('click', '.quicklook', function() {
    var layer = geojsonLayer.getLayer($(this).attr('value'));
    $(this).find('span').toggleClass('fa-eye-slash fa-eye');
    layer.fireEvent('click');
    layer.bringToFront();
});