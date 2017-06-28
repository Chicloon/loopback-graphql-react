import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import ColorUtils from '../ColorUtils';
import './style.scss';

const defaultColor = '#ccc';

export const predefinedColors = [
	'#e00',
	'#f80',
	'#fd0',
	'#ad0',
	'#0a8',
	'#4cf',
	'#07d',
	'#85f',
	'#c0f',
	'#f0c',
	'#da9',
	'#9be',
	'#fccccc',
	'#ffe7cc',
	'#fff8cc',
	'#eef8cc',
	'#cceee7',
	'#daf5ff',
	'#cce4f8',
	'#e7ddff',
	'#f5ccff',
	'#ffccf5',
	'#f8eeeb',
	defaultColor,
];

@inject('uiStore') @observer
class ColorPicker extends React.Component {

	@observable color = defaultColor;
	@observable active = false;

	constructor(props) {
		super(props);
		this.uiStore = props.uiStore;
		this.color = props.color || defaultColor;
		this.subscriberId = props.uiStore.subscribeToGlobalEvent('mousedown', this.onMouseDown.bind(this))
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromGlobalEvent('mousedown', this.subscriberId);
	}

	onMouseDown (e) {
		if (this.active) {
			if (!this.node || !this.node.contains(e.target)) {
				this.active = false;
			}
		}
	}

	static get defaultColor() {
		return defaultColor;
	}

	togglePicker(e) {
		e.preventDefault();
		this.active = !this.active;
	}

	@action pickColor (e, color) {
		e.preventDefault();
		this.props.onPickColor(color);
		this.active = false;
		this.color = color;
	};

	closePicker() {
		this.setState({
			active: false,
		});
	}

	render() {
		return (
			<div className="color-picker" ref={node => this.node = node}>
				<a href="#" className="color-picker-button"
				   style={{backgroundColor: this.color}}
				   onClick={e => this.togglePicker(e)}>&nbsp;</a>
				{this.active && (
					<div className="color-picker-popover">
						{predefinedColors.map((color, i) => (
							<a className="color" href="#" key={i}
							   style={{backgroundColor: color, color: ColorUtils.textColor(color)}}
							   onClick={e => this.pickColor(e, color)}>&nbsp;</a>
						))}
					</div>
				)}
			</div>
		)
	}

}

ColorPicker.propTypes = {
	color: PropTypes.string,
	onPickColor: PropTypes.func.isRequired,
};

export default ColorPicker;
