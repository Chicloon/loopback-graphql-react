import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import ColorPicker from '../ColorPicker';

@inject('recordData') @observer
class ColorInput extends React.Component {

	// @observable value = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.record = this.props.recordData.record;
		this.property = this.props.property;
	}

	get value() {
		return this.record[this.property];
	}

	set value(newValue) {
		this.record[this.property] = newValue;
	}

	@action handleChange(color) {
		this.value = color;
	}

	render() {
		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<ColorPicker color={this.value} onPickColor={color => this.handleChange(color)} />
			</div>
		);
	}
}

ColorInput.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	label: PropTypes.string,
};

ColorInput.defaultProps = {
};

export default ColorInput;
