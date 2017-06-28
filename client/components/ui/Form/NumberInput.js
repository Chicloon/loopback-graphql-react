import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';

@inject('recordData') @observer
class NumberInput extends React.Component {

	// @observable value = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.record = this.props.recordData.record;
		this.property = this.props.property;
	}

	get value() {
		if (this.props.type === 'percent') {
			// return this.record[this.property] * 100;
		}
		return this.record[this.property];
	}

	set value(newValue) {
		if (this.props.type === 'percent') {
			// console.log('percent:', parseFloat(newValue), parseFloat(newValue) / 100);
			// newValue = parseFloat(newValue) / 100;
		}
		this.record[this.property] = newValue;
	}

	@action handleChange(e) {
		let newValue = String(e.target.value);
		let oldValue = String(this.value);
		newValue = newValue.replace(/,/, '.');
		newValue = newValue.replace(/[^0-9.]/, '');
		if (oldValue.length > 0 && oldValue.search(/\./)) {
			const dotMatches = newValue.match(/\./g);
			if (dotMatches === null || (dotMatches && dotMatches.length < 2)) {
				this.value = newValue;
			}
		}
		else {
			this.value = newValue;
		}
	}

	render() {
		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<input type="text" className="form-control"
				       value={this.value || ''}
				       onChange={e => this.handleChange(e)} />
			</div>
		);
	}
}

NumberInput.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	label: PropTypes.string,
};

NumberInput.defaultProps = {
};

export default NumberInput;
