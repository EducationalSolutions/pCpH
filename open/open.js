;(function ( $, JXG, window, document, undefined ) {
	var pluginName = 'pcph_open';
	var defaults = {};

	function Plugin(element, options) {
		this.element = element;
		// override any passed options with url parameters
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults; // store the original defaults
		this._name = pluginName;
		this._calculated = {};
		this._formValues = {};
		this._activeValues = {};
		this._boards = {};
		this._points = {};
		this._colors = {
			a : '#BF6083',
			b : '#1197B4',
			c : '#A69F3F',
			d : '#D94F30',
			e : '#4d4698',
			f : '#8e3500'
		};
		this.init();
	}
	Plugin.prototype = {
		init: function() {
			var $plugin = this;
			$plugin._loadFormValues();
							
			// determine what values we're actually using
			$plugin._setActiveValues();
			
			// update concentration views
			$('.concentrations .aerobic, .concentrations .anearobic').addClass('hide');
			$('.concentrations .' + $plugin._activeValues['systemType']).removeClass('hide'); 
			
			// plot
			$plugin._buildOpenGraph();
			
			// call ourself if something changes
			$('.pcphOpen').off('change', 'input,select');
			$('.pcphOpen').on('change', 'input,select', function() {
				$plugin.init();
				// then update the url so we don't lose our place
				var currentState = URI(window.location);
				currentState.setSearch($plugin._activeValues);
				history.pushState({id: 'pcphOpen'}, 'pcphOpen', currentState.toString());
			});

		},
		_loadFormValues: function() {
			var $plugin = this;
			$plugin._formValues = {
				systemType : $('select.systemType').val(),
				conc : Number($('input.conc').val())
			};

			//console.log($plugin._formValues)
		},
		_setActiveValues: function() {
			var $plugin = this;
			// default to the form values
			$plugin._activeValues = $plugin._formValues;
		},			
		_buildOpenGraph: function() {
			var $plugin = this;
			var values = $plugin._activeValues;	
			
			var boundingBox = [
				0, // x min
				0, // y max
				14, // x max
				-14 // y min
			];
			//console.log(boundingBox);
			JXG.Options.text.useMathJax = true;
			$plugin._boards['openBoard'] = JXG.JSXGraph.initBoard('openGraph', {	
				boundingbox: boundingBox, 
				axis: false, 
				showCopyright:false,
				showNavigation: false
			});
			// xAxis
			var xAxis = $plugin._boards['openBoard'].create('line', [[0,0],[1,0]], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				strokeWidth: 1,
				fixed: true
			});
			var ticksX = $plugin._boards['openBoard'].create('ticks', [xAxis, 1], {
				drawLabels: true,
				drawZero: false,
				generateLabelText: function (tick, zero) {
					return tick.usrCoords[1];
				},
				label: {
					offset: [-5, -15]
				}
			});
			// yAxis
			var yAxis = $plugin._boards['openBoard'].create('line', [[0,0],[0,1]], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				strokeWidth: 1,
				fixed: true
			});
			var ticksY = $plugin._boards['openBoard'].create('ticks', [yAxis, 1], {
				drawLabels: true,
				drawZero: false,
				generateLabelText: function (tick, zero) {
					return -tick.usrCoords[2];
				},
				label: {
					offset: [10, 0]
				}
			});
			$plugin._boards['openBoard'].create('functiongraph', [function(x) {
				return x - 14;
			}], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				highlightStrokeWidth: 1
			});
			$plugin._boards['openBoard'].create('functiongraph', [function(x) {
				return -x;
			}], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				highlightStrokeWidth: 1
			});
			switch(values['systemType']) {
				case 'aerobic':
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._aerobic1(x);
					}], {
						strokeColor: $plugin._colors['a'], 
						highlightStrokeColor: $plugin._colors['a'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._aerobic2(x);
					}], {
						strokeColor: $plugin._colors['b'], 
						highlightStrokeColor: $plugin._colors['b'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._aerobic3(x);
					}], {
						strokeColor: $plugin._colors['c'], 
						highlightStrokeColor: $plugin._colors['c'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._aerobic4(x);
					}], {
						strokeColor: $plugin._colors['d'], 
						highlightStrokeColor: $plugin._colors['d'],
						highlightStrokeWidth: 1
					});
				break;
				case 'anearobic':
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._anearobic1(x);
					}], {
						strokeColor: $plugin._colors['a'], 
						highlightStrokeColor: $plugin._colors['a'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._anearobic2(x);
					}], {
						strokeColor: $plugin._colors['b'], 
						highlightStrokeColor: $plugin._colors['b'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._anearobic3(x);
					}], {
						strokeColor: $plugin._colors['c'], 
						highlightStrokeColor: $plugin._colors['c'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['openBoard'].create('functiongraph', [function(x) {
						return $plugin._anearobic4(x);
					}], {
						strokeColor: $plugin._colors['d'], 
						highlightStrokeColor: $plugin._colors['d'],
						highlightStrokeWidth: 1
					});
				break;
				
			}
			//console.log(xAxis);
			$plugin._boards['openBoard'].on('mousemove', function(e) {
				var i;
				if (e[JXG.touchProperty]) {
						// index of the finger that is used to extract the coordinates
						i = 0;
				}
				coords = $plugin._getMouseCoords(e, i, 'openBoard');

				var x = coords.usrCoords[1];
				var y = 0;
				switch($plugin._activeValues['systemType']) {
					case 'aerobic':
						y = $plugin._aerobic1(x);
						if($plugin._points['aerobic1Point'] != undefined) {
							$plugin._points['aerobic1Point'].remove();
						}
						$plugin._points['aerobic1Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['aerobic1Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['aerobic1Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .h2co3 strong').text(y);
					
						y = $plugin._aerobic2(x);
						if($plugin._points['aerobic2Point'] != undefined) {
							$plugin._points['aerobic2Point'].remove();
						}
						$plugin._points['aerobic2Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['aerobic2Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['aerobic2Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .hco3 strong').text(y);
						
						y = $plugin._aerobic3(x);
						if($plugin._points['aerobic3Point'] != undefined) {
							$plugin._points['aerobic3Point'].remove();
						}
						$plugin._points['aerobic3Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['aerobic3Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['aerobic3Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .co3 strong').text(y);
						
						y = $plugin._aerobic4(x);
						if($plugin._points['aerobic4Point'] != undefined) {
							$plugin._points['aerobic4Point'].remove();
						}
						$plugin._points['aerobic4Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['aerobic4Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['aerobic4Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .totalc strong').text(y);
					break;
					case 'anearobic':
						y = $plugin._anearobic1(x);
						if($plugin._points['anearobic1Point'] != undefined) {
							$plugin._points['anearobic1Point'].remove();
						}
						$plugin._points['anearobic1Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['anearobic1Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['anearobic1Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .h2s strong').text(y);
					
						y = $plugin._anearobic2(x);
						if($plugin._points['anearobic2Point'] != undefined) {
							$plugin._points['anearobic2Point'].remove();
						}
						$plugin._points['anearobic2Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['anearobic2Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['anearobic2Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .hs strong').text(y);
						
						y = $plugin._anearobic3(x);
						if($plugin._points['anearobic3Point'] != undefined) {
							$plugin._points['anearobic3Point'].remove();
						}
						$plugin._points['anearobic3Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['anearobic3Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['anearobic3Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .s strong').text(y);
						
						y = $plugin._anearobic4(x);
						if($plugin._points['anearobic4Point'] != undefined) {
							$plugin._points['anearobic4Point'].remove();
						}
						$plugin._points['anearobic4Point'] = $plugin._boards['openBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['anearobic4Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['anearobic4Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .totals strong').text(y);
					break;
				}
			});
			
			
			// labels
			$('.y-axis-label.openGraph').html('pC');
			$('.x-axis-label.openGraph').html('pH');
			
		},
		_getMouseCoords: function(e, i, boardName) {
			var $plugin = this;
			var cPos = $plugin._boards[boardName].getCoordsTopLeftCorner(e, i),
				absPos = JXG.getPosition(e, i),
				dx = absPos[0] - cPos[0],
				dy = absPos[1] - cPos[1];
			return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], $plugin._boards[boardName]);
		},
		_formatForDisplay: function(x) {
			if((x < 0.01 && x > 0) || (x > -0.01 && x < 0) || x > 900000 || x < -90000)   {
				x = x.toExponential(3);
				//x = x;
			}
			else {
				x = Math.round(x * 1000) / 1000; 
			}
			return x;
		},
		
		/*
		if (_root.openSystemType == "aerobic") {
		_root.EQ3 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*3.39*Math.pow(10, -2))/Math.log(10)";
		_root.EQ4 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*3.39*Math.pow(10, -2)*Math.pow(10,-6.35)/(Math.pow(10, -X)))/Math.log(10)";
		_root.EQ5 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*3.39*Math.pow(10, -2)*Math.pow(10,-6.35)*Math.pow(10, -10.33)/Math.pow(Math.pow(10, -X), 2))/Math.log(10)";
		_root.EQ6 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*3.39*Math.pow(10, -2)+(" + openPCO2 + "*Math.pow(10, -6)*3.39*Math.pow(10, -2)*Math.pow(10,-6.35)/(Math.pow(10, -X)))+(" + openPCO2 + "*Math.pow(10, -6)*3.39*Math.pow(10, -2)*Math.pow(10,-6.35)/(Math.pow(10, -X))*Math.pow(10, -10.33)/Math.pow(10, -X)))/Math.log(10)";
	}
	if (_root.openSystemType == "anaerobic") {
		_root.EQ3 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*1.05*Math.pow(10, -1))/Math.log(10)";
		_root.EQ4 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*1.05*Math.pow(10, -1)*Math.pow(10, -7.03)/(Math.pow(10, -X)))/Math.log(10)";
		_root.EQ5 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*1.05*Math.pow(10, -1)*Math.pow(10, -7.03)*Math.pow(10, -14)/Math.pow(Math.pow(10, -X), 2))/Math.log(10)";
		_root.EQ6 = "-Math.log(" + openPCO2 + "*Math.pow(10, -6)*1.05*Math.pow(10, -1)+(" + openPCO2 + "*Math.pow(10, -6)*1.05*Math.pow(10, -1)*Math.pow(10,-7.03)/(Math.pow(10, -X)))+(" + openPCO2 + "*Math.pow(10, -6)*1.05*Math.pow(10, -1)*Math.pow(10,-7.03)/(Math.pow(10, -X))*Math.pow(10, -14)/Math.pow(10, -X)))/Math.log(10)";
	}
*/

		_aerobic1: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 3.39 * Math.pow(10, -2)) / Math.log(10);
		},
		_aerobic2: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 3.39 * Math.pow(10, -2) * Math.pow(10,-6.35) / (Math.pow(10, -x))) / Math.log(10);
		},
		_aerobic3: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 3.39 * Math.pow(10, -2) * Math.pow(10,-6.35) * Math.pow(10, -10.33) / Math.pow(Math.pow(10, -x), 2)) / Math.log(10);
		},
		_aerobic4: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 3.39 * Math.pow(10, -2) + (values['conc'] * Math.pow(10, -6) * 3.39 * Math.pow(10, -2) * Math.pow(10,-6.35) / (Math.pow(10, -x))) + (values['conc'] * Math.pow(10, -6) * 3.39 * Math.pow(10, -2) * Math.pow(10,-6.35) / (Math.pow(10, -x)) * Math.pow(10, -10.33) / Math.pow(10, -x))) / Math.log(10);
		},
		_anearobic1: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 1.05 * Math.pow(10, -1)) / Math.log(10);
		},
		_anearobic2: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 1.05 * Math.pow(10, -1) * Math.pow(10, -7.03) / (Math.pow(10, -x))) / Math.log(10);
		},
		_anearobic3: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 1.05 * Math.pow(10, -1) * Math.pow(10, -7.03) * Math.pow(10, -14) / Math.pow(Math.pow(10, -x), 2)) / Math.log(10);
		},
		_anearobic4: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -6) * 1.05 * Math.pow(10, -1) + (values['conc'] * Math.pow(10, -6) * 1.05 * Math.pow(10, -1) * Math.pow(10,-7.03) / (Math.pow(10, -x))) + (values['conc'] * Math.pow(10, -6) * 1.05 * Math.pow(10, -1) * Math.pow(10,-7.03) / (Math.pow(10, -x)) * Math.pow(10, -14) / Math.pow(10, -x))) / Math.log(10);
		}
	};

	$.fn[pluginName] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};
})(jQuery, JXG, window, document);

// call the plugin
(function($){
	// load any form elements if we have any in the url

	var query = URI(window.location).query(true);
	$.each(query, function(k,v) {
		$('.' + k).val(v);
	});
	
	// then initialize open system
	$('.pcph-open-form').pcph_open();
})(jQuery);
