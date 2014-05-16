/*
 * NASA Worldview
 *
 * This code was originally developed at NASA/Goddard Space Flight Center for
 * the Earth Science Data and Information System (ESDIS) project.
 *
 * Copyright (C) 2013 - 2014 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 */

buster.testCase("wv.palettes.model", function() {

    var self = {};

    var config, models;

    self.setUp = function() {
        config = fixtures.config();
        models = fixtures.models(config);
        this.stub($, "getJSON");
    };

    self["Set a custom palette"] = function(done) {
        models.palettes.events.on("set-custom", function(layerId) {
            var palette = models.palettes.get(layerId);
            buster.assert.equals(palette.scale.colors[0], fixtures.light_blue);
            buster.assert.equals(palette.scale.labels[0], "0");
            done();
        });
        models.layers.add("terra-aod");
        models.palettes.setCustom("terra-aod", "blue-1");
    };

    self["Exception setting a custom palette when no layer exists"] = function() {
        buster.assert.exception(function() {
            models.palette.setCustom("no-layer", "blue-1");
        });
    };

    self["Exception setting an invalid custom palette"] = function() {
        buster.assert.exception(function() {
            models.palette.setCustom("terra-aod", "no-palette");
        });
    };

    self["Exception setting a custom palette on a imagery layer"] = function() {
        buster.assert.exception(function() {
            models.palette.setCustom("terra-cr", "blue-1");
        });
    };

    self["Clear a custom palette"] = function() {
        this.stub(models.palettes.events, "trigger");

        models.layers.add("aqua-aod");
        models.palettes.setCustom("terra-aod", "blue-1");
        models.palettes.clearCustom("terra-aod");

        var palette = models.palettes.get("terra-aod");
        buster.assert.equals(palette.scale.colors[0], fixtures.green);
        buster.assert.equals(palette.scale.labels[0], "0");

        buster.assert.calledWith(models.palettes.events.trigger, "clear-custom");
        buster.assert.calledWith(models.palettes.events.trigger, "change");
    };

    self["Set a minimum threshold"] = function() {
        this.stub(models.palettes.events, "trigger");

        models.layers.add("terra-aod");
        models.palettes.setRange("terra-aod", 1, 2);

        var palette = models.palettes.get("terra-aod");
        buster.assert.equals(palette.min, 1);
        buster.assert(_.isUndefined(palette.max));
        buster.assert.equals(palette.scale.colors[0], "00000000");
        buster.assert.equals(palette.scale.colors[1], fixtures.yellow);
        buster.assert.equals(palette.scale.colors[2], fixtures.red);

        buster.assert.calledWith(models.palettes.events.trigger, "range");
        buster.assert.calledWith(models.palettes.events.trigger, "change");
    };

    self["Set a maximum threshold"] = function() {
        this.stub(models.palettes.events, "trigger");

        models.layers.add("terra-aod");
        models.palettes.setRange("terra-aod", 0, 1);

        var palette = models.palettes.get("terra-aod");
        buster.assert.equals(palette.max, 1);
        buster.assert(_.isUndefined(palette.min));
        buster.assert.equals(palette.scale.colors[0], fixtures.green);
        buster.assert.equals(palette.scale.colors[1], fixtures.yellow);
        buster.assert.equals(palette.scale.colors[2], "00000000");

        buster.assert.calledWith(models.palettes.events.trigger, "range");
        buster.assert.calledWith(models.palettes.events.trigger, "change");
    };

    self["Save custom palette"] = function() {
        models.layers.add("aqua-aod");
        models.layers.add("terra-aod");
        models.palettes.setCustom("terra-aod", "blue-1");
        models.palettes.setCustom("aqua-aod", "red-1");

        var state = {};
        models.layers.save(state);
        models.palettes.save(state);
        buster.assert.equals(state.l, [
            { id: "terra-aod", attributes: [{ id: "palette", value: "blue-1" }] },
            { id: "aqua-aod",  attributes: [{ id: "palette", value: "red-1"  }] }
        ]);
    };

    self["Save threshold minimum"] = function() {
        models.layers.add("terra-aod");
        models.palettes.setRange("terra-aod", 1, 2);

        var state = {};
        models.layers.save(state);
        models.palettes.save(state);
        buster.assert.equals(state.l, [
            { id: "terra-aod", attributes: [{ id: "min", value: 1 }] }
        ]);
    };

    self["Save threshold maximum"] = function() {
        models.layers.add("terra-aod");
        models.palettes.setRange("terra-aod", 0, 1);

        var state = {};
        models.layers.save(state);
        models.palettes.save(state);
        buster.assert.equals(state.l, [
            { id: "terra-aod", attributes: [{ id: "max", value: 1 }] }
        ]);
    };

    self["Save threshold range"] = function() {
        models.layers.add("terra-aod");
        models.palettes.setRange("terra-aod", 1, 1);

        var state = {};
        models.layers.save(state);
        models.palettes.save(state);
        buster.assert.equals(state.l, [
            { id: "terra-aod", attributes: [
                { id: "min", value: 1 },
                { id: "max", value: 1 }
            ]}
        ]);
    };

    self["No save when not active"] = function() {
        models.layers.add("terra-aod");

        var state = {};
        models.layers.save(state);
        models.palettes.save(state);
        buster.assert.equals(state.l, [
            { id: "terra-aod", attributes: [] }
        ]);
    };

    self["Load state"] = function() {
        var state = {
            l: [
                {id: "terra-aod", attributes: [
                    { id: "palette", value: "blue-1" },
                    { id: "min",     value: "1" },
                    { id: "max",     value: "1" }
                ]}
            ]
        };
        var errors = [];
        models.layers.load(state, errors);
        models.palettes.load(state, errors);
        var palette = models.palettes.get("terra-aod");
        buster.assert.equals(palette.custom, "blue-1");
        buster.assert.equals(palette.min, 1);
        buster.assert.equals(palette.max, 1);
        buster.assert.equals(errors.length, 0);
    };

    self["Error loading non-existing palette"] = function() {
        var state = {
            l: [{id: "terra-aod", attributes: [{id: "palette", value: "none"}]}]
        };
        var errors = [];
        models.layers.load(state, errors);
        models.palettes.load(state, errors);
        buster.assert.equals(errors.length, 1);
    };

    self["Error loading invalid minimum"] = function() {
        var state = {
            l: [ {id: "terra-aod", attributes: [{ id: "min", value: "x"}]}]
        };
        var errors = [];
        models.layers.load(state, errors);
        models.palettes.load(state, errors);
        buster.assert.equals(errors.length, 1);
    };

    self["Error loading invalid maximum"] = function() {
        var state = {
            l: [ {id: "terra-aod", attributes: [{ id: "max", value: "x"}]}]
        };
        var errors = [];
        models.layers.load(state, errors);
        models.palettes.load(state, errors);
        buster.assert.equals(errors.length, 1);
    };

    self["Canvas not in use"] = function() {
        buster.refute(models.palettes.inUse());
    };

    self["Canvas in use with custom palette"] = function() {
        models.layers.add("terra-aod");
        models.palettes.setCustom("terra-aod", "blue-1");
        buster.assert(models.palettes.inUse());
    };

    self["Canvas in use with threshold ranges"] = function() {
        models.layers.add("terra-aod");
        models.palettes.setRange("terra-aod", 1);
        buster.assert(models.palettes.inUse());
    };

    self["Canvas not in use when not active layers have a palette"] = function() {
        models.layers.add("terra-aod");
        models.palettes.setCustom("terra-aod", "blue-1");
        models.layers.remove("terra-aod");
        buster.refute(models.palettes.inUse());
    };

    return self;

}());
