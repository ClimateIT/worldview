/*
 * NASA Worldview
 *
 * This code was originally developed at NASA/Goddard Space Flight Center for
 * the Earth Science Data and Information System (ESDIS) project.
 *
 * Copyright (C) 2013 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 */

/**
 * @module wv.layers
 */
var wv = wv || {};
wv.layers = wv.layers || {};

/**
 * @class wv.layers.modal
 */
wv.layers.modal = wv.layers.modal || function(models, ui, config) {

    var model = models.layers;
    var self = {};

    self.selector = "#layer-modal";
    self.id = "layer-modal";

    var $addBtn = $("#layers-add");
    var $header = $( self.selector + " header" );
    var $categories = $(self.selector + " #layer-categories, " +
                        self.selector + " #categories-nav");

    var $selectedCategory = $(self.selector + " #selected-category");
    var gridItemWidth = 320; //with of grid item + spacing
    var modalHeight;
    var sizeMultiplier;

    //Create container for 'by interest' filters buttons
    var $nav = $('<nav></nav>')
        .attr( 'id', 'categories-nav' );
    $header.append( $nav );
    
    //Create container for breadcrumb
    var $breadcrumb = $('<nav></nav>')
        .attr( 'id', 'category-breadcrumb' );
    $header.append( $breadcrumb );    

    var setModalSize = function(){
        var availableWidth = $( window ).width() - ( $( window ).width() * 0.15 );
        sizeMultiplier = Math.floor( availableWidth / gridItemWidth );
        modalHeight = $( window ).height() - 200;
    };
    var redo = function(){
        setModalSize();

        $( self.selector ).dialog( "option", {
            height: modalHeight,
            width: gridItemWidth * sizeMultiplier + 10,
        });

        $( '#layer-modal-main' ).css( 'height', modalHeight - 40 );

        //$( '.stamp' ).css("width", sizeMultiplier * gridItemWidth - 10 + "px");
    };
    var filterProjection = function(layer) {
        return config.layers[layer].projections[models.proj.selected.id];
    };
    var drawPage = function() {
        var projection = models.proj.selected.id;

        _.each( config.categories['hazards and disasters'].All.measurements,
                function( measurement ) {

                    _.each( config.measurements[measurement].sources,
                            function( source, sourceIndex ) {

                                _.each( source.settings, function( setting ) {

                                    var fproj = filterProjection(setting);
                                    var layer = config.layers[ setting ];
 
                                    if( fproj ) {
                                        var mm = measurement;
                                        return mm;
                                    }

                                    /*_.each( config.layers[ setting ].projections,
                                            function( proj, projId ) {

                                            }
                                          );
                                    */
                                });
                                
                            }
                          );
                    //console.log(mm);
                }
              );

        
        $selectedCategory.hide();
        drawCategories();
    };

    var resize = function(){
        if( $( self.selector ).dialog( "isOpen" ) ) {
            redo();
        }
    };
    var drawMeasurements = function(category, selectedMeasurement, selectedIndex){

        $selectedCategory.empty();
        $breadcrumb.empty();

        var $categoryList = $( '<div></div>' )
            .attr( 'id', category.id + '-list' );

        //Begin Measurement Level
        _.each( category.measurements, function( measurement, measurementName ) {

            var current = config.measurements[measurement];

            var $measurementHeader = $( '<div></div>' )
                .attr('id', 'accordion-' + category.id + '-' + current.id );

            var $measurementTitle = $( '<h3></h3>' )
                .text( current.title );

            var $measurementSubtitle = $('<h5></h5>')
                .text( current.subtitle );

            var $sourceTabs = $( '<ul></ul>' );

            var $measurementContent = $( '<div></div>' );

            $measurementContent.append( $sourceTabs );

            //Begin source level
            _.each( current.sources, function( source, souceName ) {

                var $sourceTab = $( '<li></li>' );

                var $sourceLink = $( '<a></a>' )
                    .text( source.title )
                    .attr( 'href', '#' + current.id + '-' + source.id );

                $sourceTab.append( $sourceLink );
                $sourceTabs.append( $sourceTab );

                var $sourceContent = $( '<div></div>' )
                    .attr( 'id', current.id + '-' + source.id );

                var $sourceMeta = $( '<p></p>' )
                    .text(source.description);

                $sourceContent.append( $sourceMeta );

                var $addButton = $( '<button></button>' )
                    .text( 'Add' )
                    .attr( 'id', 'add-' + current.id + '-' + source.id );
                var $removeButton = $( '<button></button>' )
                    .text( 'Remove' )
                    .attr( 'id', 'remove-' + current.id + '-' + source.id );

                if( source.settings.length !== 1 ) {
                    var $sourceSettings = $( '<form></form>' );

                    _.each( source.settings, function( setting ) {
                        var layer = config.layers[setting];
                        var title;

                        // The following complex if statement is a placeholder
                        // for truncating the layer names, until the rest of
                        // the interface is implemented

                        if( layer.title.indexOf('(') !== -1 ) {
                            var regExp = /\(([^)]+)\)/;
                            var matches = regExp.exec(layer.title);
                            title = matches[1];
                        } else if ( layer.title.indexOf( ':' ) !== -1 ){
                            
                        } else if ( layer.title.indexOf( ',' ) !== -1 ) {
                            
                        } else {

                        }

                        var $setting = $( '<input />' )
                            .attr( 'type', 'radio' )
                            .addClass( 'settings-radio')
                            .attr( 'id', 'setting-' + layer.id )
                            .attr( 'value', encodeURIComponent( layer.id ) )
                        //maybe dont need value and data-layer both
                            .attr( 'data-layer', encodeURIComponent( layer.id ) )
                            .click( function( e ) {
                                $addButton.val( $( this ).val() );
                                $removeButton.val( $( this ).val() );
                            });

                        var $label = $( '<label></label>' )
                            .attr( 'for', 'setting-' + encodeURIComponent( layer.id ) )
                            .text( title );

                        $sourceSettings.append( $setting )
                            .append( $label );

                    });

                    $sourceSettings.buttonset();

                    // might need mose more logic here, the click "checks"
                    // the radio, instead of unchecking the rest then checking
                    // the selected
                    //$sourceSettings.find( 'input.settings-radio' )
                        

                    $sourceContent.append( $sourceSettings );
                }
                // if there are no settings then just create an add button
                // for the selected source
                else {
                    //$sourceContent.append( $sourceMeta );
                    $addButton.val( source.settings[0] );
                    $removeButton.val( source.settings[0] );
                }

                $addButton.button()
                    .click( addLayer );

                $removeButton.button()
                    .click( removeLayer );

                $sourceContent.append( $addButton, $removeButton );
                $measurementContent.append( $sourceContent );

            });
            //End source level
            $measurementContent.tabs();

            $measurementHeader.append( $measurementTitle );
            $measurementHeader.append( $measurementSubtitle );

            $categoryList.append( $measurementHeader );
            $categoryList.append( $measurementContent );
            
        });
        //End measurement level

        $categoryList.accordion({
            collapsible: true,
            heightStyle: "content",
            animate: false,
            active: false
        });
        
        if( selectedMeasurement ) {
            //config.categories
            $categoryList.accordion( "option", "active", selectedIndex);
        }

        $selectedCategory.append( $categoryList );

        //Create breadcrumb crumbs
        var $homeCrumb = $( '<a></a>' )
            .text('Categories')
            .attr( 'alt', 'categories' )
            .attr( 'title', 'Back to Layer Categories')
            .click( categoriesCrumb );

        $breadcrumb.append( $homeCrumb )
            .append('<b> / ' + category.title + '</b>' );

        //Switch navs
        $('#layer-categories, #categories-nav').hide();

        $selectedCategory.show();
        $breadcrumb.show();
        
    };
    var categoriesCrumb = function( e ) {
        $selectedCategory.hide();
        $breadcrumb.hide();
        $('#layer-categories, #categories-nav').show();
        
    };
    var cssName = function(name){
        if ( name === 'hazards and disasters' ) {
            return 'legacy';
        }
        else return name;
    };

    var drawCategories = function(){

        $categories.empty();

        _.each( config.categories, function( metaCategory, metaCategoryName ) {

            _.each(config.categories[metaCategoryName], function( category, name ) {

                var $category = $( '<div></div>' )
                    .addClass( 'layer-category layer-category-' + cssName(metaCategoryName) )
                    .attr( 'id', category.id );

                var $categoryTitle = $( '<h3></h3>' );

                var $categoryLink = $( '<a></a>' )
                    .text( category.title )
                    .attr( 'alt', category.title )
                    .click( function( e ) {
                        drawMeasurements( category );
                    });

                $categoryTitle.append( $categoryLink );
                $category.append( $categoryTitle );

                var $measurements = $('<ul></ul>');

                _.each( category.measurements, function( measurement, index ) {
                    var current = config.measurements[measurement];
                    var $measurement = $( '<a></a>' )
                        .attr( 'data-category', category.id )
                        .attr( 'data-measurement', current.id )
                        .attr( 'title', category.title + ' - ' + current.title )
                        .text( current.title );

                    $measurement.click( function( e ) {
                        drawMeasurements( category, current.id, index );
                    });

                    var $measurementItem = $( '<li></li>' )
                        .addClass( 'layer-category-item' );

                    $measurementItem.append( $measurement );

                    $measurements.append( $measurementItem );
                });

                $category.append( $measurements );
                $categories.append( $category );

            });

            var $filterButton = $( '<input />' )
                .attr( 'type', 'radio')
                .text( metaCategoryName );

            var $label = $( '<label></label>' )
                .text( metaCategoryName );

            $filterButton
                .attr( 'id', 'button-filter-' + cssName(metaCategoryName) )
                .attr( 'data-filter', cssName(metaCategoryName) )
                .click( function( e ) {
                    $tiles.isotope({
                        filter: '.layer-category-' + cssName(metaCategoryName)
                    });
                });

            $label.attr('for', 'button-filter-' + cssName(metaCategoryName) );

            $nav.append( $filterButton );
            $nav.append( $label );
            //Create radiobuttons with filter buttons
            $nav.buttonset();
        });
        
        var $tiles = $( '#layer-categories' ).isotope( {
            itemSelector: '.layer-category',
            //stamp: '.stamp',
            //sortBy: 'number',
            layoutMode: 'packery',
            filter: '.layer-category-scientific',
            packery: {
                gutter: 10,
            },
            //transitionDuration: '0.2s'
        });

        _.each(config.categories, function( topCategory, name ) {
     
        });
    };
    var addLayer = function(event) {
        model.add( decodeURIComponent( $( this ).val() ) );

    };

    var removeLayer = function(event) {
        model.remove( decodeURIComponent( $( this ).val() ) );
    };

    var onLayerAdded = function(layer) {
        var $element = $( self.selector + " [data-layer='" +
                wv.util.jqueryEscape(layer.id) + "']");
    };

    var onLayerRemoved = function(layer) {
        var $element = $( self.selector + " [data-layer='" +
                wv.util.jqueryEscape(layer.id) + "']");
    };

    var render = function(){

        setModalSize();

        $( self.selector ).dialog({
            autoOpen: false,
            resizable: false,
            height: modalHeight,
            width: gridItemWidth * sizeMultiplier + 10,
            modal: true,
            dialogClass: "layer-modal no-titlebar",
            draggable: false,
            title: "Layer Picker",
            show: {
                effect: "fade",
                duration: 400
            },
            hide: {
                effect: "fade",
                duration: 200
            },
            open: function( event, ui ) {
                redo();
                
                $( "#layer-categories" ).isotope();
 
                $( ".ui-widget-overlay" ).click( function( e ) {
                    $( self.selector ).dialog( "close" );
                } );
            },
            close: function( event, ui ) {
                $( ".ui-widget-overlay" ).unbind( "click" );
            }
        });
        
        $( '#layer-modal-main' ).css( 'height', modalHeight - 40 );

        var $search = $( "<div></div>" )
            .attr( "id", "layer-search" );

        var $searchInput = $( "<input></input>" )
            .attr( "id", "layers-search-input" )
            .hide();

        var $searchBtn = $("<label></label>")
            .addClass( "search-icon" )
            .toggle( function( e ) {
                var that = this;
                //console.log('click on');
                $searchInput.show( "fast", function(e){
                    //console.log('visible');
                    //console.log(this);
                    /*$(this).focus().blur(function(e){
                        console.log('blurring');
                        $(that).toggle();
                    });
                    */
                });
                //console.log(e);
            }, function ( e ) {
                //console.log('click off');
                $searchInput.hide(function(e){
                    //console.log('unblurring');
                    //$(this).off("blur");
                });
                //console.log(e);
            } )
            .append( "<i></i>" );
        
        $search.append( $searchBtn )
            .append( $searchInput );

        $header.prepend( $search );

        drawPage();
    };

    var init = function(){
        
        model.events
            .on("add", onLayerAdded)
            .on("remove", onLayerRemoved);

        //Create tiles
        render();

        $addBtn.click(function(e){
            $( self.selector ).dialog("open");
        });

        $(window).resize(resize);
    };

    init();
    return self;
};
