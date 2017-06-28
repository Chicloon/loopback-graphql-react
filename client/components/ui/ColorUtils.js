const formulas = [
	({ r, g, b }) => 0.2126 * r + 0.7152 * g + 0.0722 * b, // standard for certain colour spaces
	({ r, g, b }) => 0.299 * r + 0.587 * g + 0.114 * b, // perceived option 1
	({ r, g, b }) => Math.sqrt( 0.299 * r * r + 0.587 * g * g + 0.114 * b * b ), // perceived option 2, slower
];

const DEFAULT_COLOR = '#ccc';

export default class ColorUtils {

	static formula = (num) => formulas[num];

	static componentToHex(c) {
		var hex = c.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	}

	static rgbToHex(r, g, b) {
		return "#" + ColorUtils.componentToHex(r) + ColorUtils.componentToHex(g) + ColorUtils.componentToHex(b);
	}

	static hexToRgb(hex) {
		hex = hex || DEFAULT_COLOR;
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
	}

	static brightness(hex, formula) {
		const color = ColorUtils.hexToRgb(hex);
		const _formula = formula || ColorUtils.formula(0);
		return color ? _formula(color) / 255 : '#000';
	}

	static textColor(hex, formula) {
		// console.log('hex:', hex, ', brightness:',ColorUtils.brightness(hex, formula));
		return ColorUtils.brightness(hex, formula) < 0.6 ? '#fff' : '#444';
	}

	static getColorForString(str) {
		const hashCode = str => {
			var hash = 0;
			for (var i = 0; i < str.length; i++) {
				hash = str.charCodeAt(i) + ((hash << 6) - hash);
			}
			return hash;
		};
		const c = (hashCode(str) & 0x00FFFFFF).toString(16).toUpperCase();
		const background = '#' + '00000'.substring(0, 6 - c.length) + c;
		const color = ColorUtils.textColor(background);
		return {
			background,
			color,
		};
	}

	static intHash(str, max = 16) {
		var hash = 0;
		if (str.length === 0) return hash;
		for (let i = 0; i < str.length; i++) {
			hash += str.charCodeAt(i);
		}
		hash = hash % max;
		return hash;
	}

}
