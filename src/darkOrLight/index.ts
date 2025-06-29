import { cache } from '../cache';

const hexOrRgbRegExp = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;

/**
 * @param color string CSS Color
 * @returns  'dark' | 'light'
 */
export const darkOrLight = cache((color: any) => {
  // const colorStr = typeof color === 'number' 
  //   ? `#${color.toString(16).padStart(6, '0')}` 
  //   : color;

  let r, g, b, hsp;
  // Check the format of the color, HEX or RGB?
  if(color.match(/^rgb/)){
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(hexOrRgbRegExp);

    r = color[1];
    g = color[2];
    b = color[3];
  }else{
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }
  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(
    0.299 * (r * r) + 
    0.587 * (g * g) + 
    0.114 * (b * b)
  );

  // Using the HSP value, determine whether the color is light or dark
  return hsp > 127.5 ? 'light' : 'dark';
});
