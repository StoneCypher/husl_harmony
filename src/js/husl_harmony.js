
'use strict';

/*********
 *
 *  `husl_harmony` is a color harmony generator using [husl](https://www.npmjs.com/package/husl).  `husl_harmony` can generate 
 *
 */

var husl = require('husl');

var presets = {
  'monochromatic'           : [   0                                     ],
  'complementary'           : [   0,  180                               ],
  'split-complementary'     : [   0,  150,  210                         ],
  'double-complementary'    : [   0,   30,  180,  210                   ],
  'l-double-complementary'  : [   0,  330,  180,  150                   ],
  'triad'                   : [   0,  120,  240                         ],
  'complementary-triad'     : [   0,  120,  180,  240                   ],
  'square'                  : [   0,   90,  180,  270                   ],
  'tetrad'                  : [   0,   60,  180,  240                   ],
  'pentagon'                : [   0,   72,  144,  216,  288             ],
  'hexagon'                 : [   0,   60,  120,  180,  240,  300       ],
  'l-tetrad'                : [   0,  300,  180,  120                   ],
  'analogous-3'             : [ 330,    0,   30                         ],
  'analogous-5'             : [ 300,  330,    0,   30,   60             ],
  'analogous-7'             : [ 270,  300,  330,    0,   30,   60,   90 ],
  'complementary-analogous' : [   0,  120,  150,  180,  210,  240       ]
}; 



function rotate(HSL, angle) {
  var [H,S,L] = HSL;
  return [(H + angle) % 360, S, L];
}



function hsl_interval_to_rgb(hi) {
  var [Ho, So, Lo] = hi; // they're all [0..1]; husl needs 360, 100, 100
  return husl.toHex(Ho, So, Lo);
}



function from_rgb(hex6_color, harmony) {

  if (hex6_color.length === 6) { hex6_color = '#' + hex6_color; }

  if (typeof harmony === 'string') { 
    harmony = presets[harmony]; 
    if (harmony === undefined) { throw 'no such preset'; } 
  }

  return harmony.map(angle => angle? hsl_interval_to_rgb( rotate(husl.fromHex(hex6_color), angle) ) : hex6_color )

}



function make_swatches(name, colors, size = '4em') {

  var div   = document.createElement('div'),
      head  = document.createElement('span'),
      table = document.createElement('table'),
      tbody = document.createElement('tbody'),
      row   = document.createElement('tr');

  head.innerHTML         = name;
  table.style.border     = '1px solid black';
  table.style.marginTop  = '1px solid black';
  div.style.marginBottom = '1em';

  colors.map(function(color) {

    var cell   = document.createElement('td'),
        styles = { width: size, height: size, backgroundColor: color };

    Object.keys(styles).map(key => cell.style[key] = styles[key]);

    row.appendChild(cell);

  });

  tbody.appendChild(row);
  table.appendChild(tbody);
  div.appendChild(head);
  div.appendChild(table);

  return div;

}



function make_all_swatches(color) {

  var result = document.createElement('div');
  for (var key in presets) { result.appendChild(make_swatches(key, from_rgb(color || '0088ff', key))); } 

  return result;

}



function usort(uarray) {
  return uarray.filter( (value, index, self) => self.indexOf(value) === index );
}



function many_matches(color, usage_presets = ['analogous', 'square']) {
  return usort( [].concat.apply([], usage_presets.map(scheme => from_rgb(color || '0088ff', scheme)) ) );
}



function many_swatches(color, usage_presets) {
  return make_swatches(`Many matches of <span style="display:inline-block;background-color:${color};width:0.85em;height:0.85em;overflow:hidden;border:1px solid black;margin:0 0.1em -0.15em 0.1em">&nbsp;<tt> ${color}</tt></span>`, many_matches(color, usage_presets));
}



export {rotate, from_rgb, presets, husl, hsl_interval_to_rgb, make_swatches, make_all_swatches, usort, many_matches, many_swatches};
