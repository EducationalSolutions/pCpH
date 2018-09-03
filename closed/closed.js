;(function ( $, JXG, window, document, undefined ) {
	var pluginName = 'pcph_closed';
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
			$('.concentrations .diprotic, .concentrations .triprotic, .concentrations .monoprotic').addClass('hide');
			$('.concentrations .' + $plugin._activeValues['systemType']).removeClass('hide'); 
			// update pka views
			$('.pka').removeClass('hide');
			switch($plugin._activeValues['systemType']) {
				case 'monoprotic':
					$('.pkas .diprotic, .pkas .triprotic').addClass('hide');
				break;
				case 'diprotic':
					$('.pkas .triprotic').addClass('hide');
				break;
			}
			
			// plot
			$plugin._buildClosedGraph();
			
			// call ourself if something changes
			$('.pcphClosed').off('change', 'input,select');
			$('.pcphClosed').on('change', 'input,select', function() {
				$plugin.init();
				// then update the url so we don't lose our place
				var currentState = URI(window.location);
				currentState.setSearch($plugin._activeValues);
				history.pushState({id: 'pcphClosed'}, 'pcphClosed', currentState.toString());
			});

		},
		_loadFormValues: function() {
			var $plugin = this;
			$plugin._formValues = {
				systemType : $('select.systemType').val(),
				conc : Number($('input.conc').val()),
				pka1 : Number($('input.pka1').val()),
				pka2 : Number($('input.pka2').val()),
				pka3 : Number($('input.pka3').val()),
				pka4 : Number($('input.pka4').val())
			};

			//console.log($plugin._formValues)
		},
		_setActiveValues: function() {
			var $plugin = this;
			// default to the form values
			$plugin._activeValues = $plugin._formValues;
		},			
		_buildClosedGraph: function() {
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
			$plugin._boards['closedBoard'] = JXG.JSXGraph.initBoard('closedGraph', {	
				boundingbox: boundingBox, 
				axis: false, 
				showCopyright:false,
				showNavigation: false
			});
			// xAxis
			var xAxis = $plugin._boards['closedBoard'].create('line', [[0,0],[1,0]], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				strokeWidth: 1,
				fixed: true
			});
			var ticksX = $plugin._boards['closedBoard'].create('ticks', [xAxis, 1], {
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
			var yAxis = $plugin._boards['closedBoard'].create('line', [[0,0],[0,1]], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				strokeWidth: 1,
				fixed: true
			});
			var ticksY = $plugin._boards['closedBoard'].create('ticks', [yAxis, 1], {
				drawLabels: true,
				drawZero: false,
				generateLabelText: function (tick, zero) {
					return -tick.usrCoords[2];
				},
				label: {
					offset: [10, 0]
				}
			});
			$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
				return x - 14;
			}], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				highlightStrokeWidth: 1
			});
			$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
				return -x;
			}], {
				strokeColor: '#000000', 
				highlightStrokeColor: '#000000',
				highlightStrokeWidth: 1
			});
			switch(values['systemType']) {
				case 'monoprotic':
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._monoprotic1(x);
					}], {
						strokeColor: $plugin._colors['a'], 
						highlightStrokeColor: $plugin._colors['a'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._monoprotic2(x);
					}], {
						strokeColor: $plugin._colors['b'], 
						highlightStrokeColor: $plugin._colors['b'],
						highlightStrokeWidth: 1
					});
				break;
				case 'diprotic':
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._diprotic1(x);
					}], {
						strokeColor: $plugin._colors['c'], 
						highlightStrokeColor: $plugin._colors['c'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._diprotic2(x);
					}], {
						strokeColor: $plugin._colors['a'], 
						highlightStrokeColor: $plugin._colors['a'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._diprotic3(x);
					}], {
						strokeColor: $plugin._colors['b'], 
						highlightStrokeColor: $plugin._colors['b'],
						highlightStrokeWidth: 1
					});
				break;
				case 'triprotic':
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._triprotic1(x);
					}], {
						strokeColor: $plugin._colors['d'], 
						highlightStrokeColor: $plugin._colors['d'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._triprotic2(x);
					}], {
						strokeColor: $plugin._colors['c'], 
						highlightStrokeColor: $plugin._colors['c'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._triprotic3(x);
					}], {
						strokeColor: $plugin._colors['a'], 
						highlightStrokeColor: $plugin._colors['a'],
						highlightStrokeWidth: 1
					});
					$plugin._boards['closedBoard'].create('functiongraph', [function(x) {
						return $plugin._triprotic4(x);
					}], {
						strokeColor: $plugin._colors['b'], 
						highlightStrokeColor: $plugin._colors['b'],
						highlightStrokeWidth: 1
					});
				break;
			}
			//console.log(xAxis);
			$plugin._boards['closedBoard'].on('mousemove', function(e) {
				var i;
				if (e[JXG.touchProperty]) {
						// index of the finger that is used to extract the coordinates
						i = 0;
				}
				coords = $plugin._getMouseCoords(e, i, 'closedBoard');

				var x = coords.usrCoords[1];
				var y = 0;
				switch($plugin._activeValues['systemType']) {
					case 'monoprotic':
						y = $plugin._monoprotic1(x);
						if($plugin._points['monoprotic1Point'] != undefined) {
							$plugin._points['monoprotic1Point'].remove();
						}
						$plugin._points['monoprotic1Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['monoprotic1Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['monoprotic1Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .ha strong').text(y);
					
						y = $plugin._monoprotic2(x);
						if($plugin._points['monoprotic2Point'] != undefined) {
							$plugin._points['monoprotic2Point'].remove();
						}
						$plugin._points['monoprotic2Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['monoprotic2Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['monoprotic2Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .a strong').text(y);
					break;
					case 'diprotic':
						y = $plugin._diprotic1(x);
						if($plugin._points['diprotic1Point'] != undefined) {
							$plugin._points['diprotic1Point'].remove();
						}
						$plugin._points['diprotic1Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['diprotic1Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['diprotic1Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .ha strong').text(y);
					
						y = $plugin._diprotic2(x);
						if($plugin._points['diprotic2Point'] != undefined) {
							$plugin._points['diprotic2Point'].remove();
						}
						$plugin._points['diprotic2Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['diprotic2Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['diprotic2Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .a strong').text(y);
						
						y = $plugin._diprotic3(x);
						if($plugin._points['diprotic3Point'] != undefined) {
							$plugin._points['diprotic3Point'].remove();
						}
						$plugin._points['diprotic3Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['diprotic3Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['diprotic3Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .h2a strong').text(y);
					break;
					case 'triprotic':
						y = $plugin._triprotic1(x);
						if($plugin._points['triprotic1Point'] != undefined) {
							$plugin._points['triprotic1Point'].remove();
						}
						$plugin._points['triprotic1Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['triprotic1Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['triprotic1Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .ha strong').text(y);
					
						y = $plugin._triprotic2(x);
						if($plugin._points['triprotic2Point'] != undefined) {
							$plugin._points['triprotic2Point'].remove();
						}
						$plugin._points['triprotic2Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['triprotic2Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['triprotic2Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .a strong').text(y);
						
						y = $plugin._triprotic3(x);
						if($plugin._points['triprotic3Point'] != undefined) {
							$plugin._points['triprotic3Point'].remove();
						}
						$plugin._points['triprotic3Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['triprotic3Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['triprotic3Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .h2a strong').text(y);
						
						y = $plugin._triprotic4(x);
						if($plugin._points['triprotic4Point'] != undefined) {
							$plugin._points['triprotic4Point'].remove();
						}
						$plugin._points['triprotic4Point'] = $plugin._boards['closedBoard'].create('point', [x, y], {strokeWidth: 1, dash:2, showInfobox: false});
						$plugin._points['triprotic4Point'].clearTrace();
						x = $plugin._formatForDisplay(x);
						y = -$plugin._formatForDisplay(y);
		
						$plugin._points['triprotic4Point'].setLabelText('(' + x + ', ' + y + ')');
						$('.concentrations .h3a strong').text(y);
					break;
				}
			});
			
			
			// labels
			$('.y-axis-label.closedGraph').html('pC');
			$('.x-axis-label.closedGraph').html('pH');
			
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
		
		_calculateAlphaH3: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.pow(Math.pow(10, -x), 3) / (Math.pow(10, -values['pka1']) * Math.pow(10, -values['pka2']) * Math.pow(10, -values['pka3'])) + Math.pow(Math.pow(10, -x), 2) / (Math.pow(10, -values['pka2']) * Math.pow(10, -values['pka3'])) + Math.pow(10, -x)/(Math.pow(10, -values['pka3'])) + 1;
		},
		_calculateAlphaH2: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.pow(Math.pow(10, -x), 2) / (Math.pow(10, -values['pka2'])*Math.pow(10, -values['pka1'])) + Math.pow(10, -x) / (Math.pow(10, -values['pka2'])) + 1;
		},
		_monoprotic1: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -x) / (Math.pow(10, -x) + Math.pow(10, -values['pka1']))) / Math.log(10);
		},
		_monoprotic2: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -values['pka1']) / (Math.pow(10, -x) + Math.pow(10, -values['pka1']))) / Math.log(10);
		},
		_diprotic1: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -x) / (Math.pow(10, -values['pka2']) * ($plugin._calculateAlphaH2(x)))) / Math.log(10);
		},
		_diprotic2: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			
			return Math.log(values['conc']/($plugin._calculateAlphaH2(x)))/Math.log(10);
		},
		_diprotic3: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
	/*_root.EQ3 = "-Math.log("+overallConcNum+"*Math.pow(10, -X)/(Math.pow(10, -"+k2Num+")*("+alphaH2+")))/Math.log(10)";
		_root.EQ4 = "-Math.log("+overallConcNum+"/("+alphaH2+"))/Math.log(10)";
		
		_root.EQ5 = "-Math.log("+overallConcNum+"*Math.pow(Math.pow(10, -X), 2)/(Math.pow(10, -"+k1Num+")*Math.pow(10, -"+k2Num+")*("+alphaH2+")))/Math.log(10)";
		*/
			return Math.log(values['conc'] * Math.pow(Math.pow(10, -x), 2) / (Math.pow(10, -values['pka1'])*Math.pow(10, -values['pka2'])*($plugin._calculateAlphaH2(x))))/Math.log(10);
			return Math.log(values['conc'] * Math.pow(10, -x) / (Math.pow(10, -values['pka2']) * ($plugin._calculateAlphaH2(x)))) / Math.log(10);
		},
		_triprotic1: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(10, -x) / (Math.pow(10, -values['pka3']) * ($plugin._calculateAlphaH3(x)))) / Math.log(10);
		},
		_triprotic2: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] / ($plugin._calculateAlphaH3(x))) / Math.log(10);
		},
		_triprotic3: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(Math.pow(10, -x), 2) / (Math.pow(10, -values['pka2']) * Math.pow(10, -values['pka3']) * ($plugin._calculateAlphaH3(x)))) / Math.log(10);
		},
		_triprotic4: function(x) {
			var $plugin = this;
			var values = $plugin._activeValues;
			return Math.log(values['conc'] * Math.pow(Math.pow(10, -x), 3) / (Math.pow(10, -values['pka1']) * Math.pow(10, -values['pka2']) * Math.pow(10, -values['pka3']) * ($plugin._calculateAlphaH3(x)))) / Math.log(10);
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
	
	// then initialize closed system
	$('.pcph-closed-form').pcph_closed();
})(jQuery);
