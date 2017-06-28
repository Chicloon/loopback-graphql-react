import React from 'react';
import PropTypes from 'prop-types';
import Field from './Field';

class NumberField extends React.PureComponent {

	constructor (props) {
		super(props);
		this.props = props;
		// console.log('NumberField', props);
	}

	addClassName (value) {
		return value < 0 ? 'negative' : '';
	}

	printValue (value) {
		const { locales, type } = this.props;

		const style = type || 'decimal';
		const options = { style };
		options.minimumFractionDigits = 0;
		options.maximumFractionDigits = 2;
		if (type === 'currency') {
			options.currency = 'RUB';
			options.minimumFractionDigits = 0;
			options.maximumFractionDigits = 2;
		}
		// if (type === 'currency') console.log('value:', value);
		value = value ? value.toLocaleString(locales, options) : value;
		return value;
	}

	processValue (value) {
		if (this.props.type === 'percent') {
			const numberValue = parseFloat(value);
			if (isNaN(numberValue)) {
				value = '';
			}
			else {
				value = numberValue * 100;
			}
			console.log('processValue: percent:', value);
		}
		return value;
	}

	handleChange (oldValue, value) {
		if (value.length < 1) return '';
		oldValue = oldValue || '';
		const newValue = value.replace(/,/, '.').replace(/[^0-9.]/, '');
		if (oldValue.length > 0 && oldValue.search(/\./)) {
			const dotMatches = newValue.match(/\./g);
			if (dotMatches === null || (dotMatches && dotMatches.length < 2)) {
				return newValue;
			}
		}
		else {
			return newValue;
		}
		return oldValue;
	}

	saveValue (value) {
		if (this.props.type === 'percent') {
			value = parseFloat(value) / 100;
		}
		console.log('saveValue:', value !== null ? value : 'null');
		return value;
	}

	render () {
		const props = {
			printValue: this.printValue.bind(this),
			addClassName: this.addClassName,
		};
		if (this.props.type === 'percent') {
			props.processValue = this.processPercent;
			props.saveValue = this.saveValue;
		}
		return <Field {...this.props} {...props}
		              saveValue={this.saveValue.bind(this)}
		              printValue={this.printValue.bind(this)}
		              processValue={this.processValue.bind(this)}
		              handleChange={this.handleChange.bind(this)}/>;
	}

}

NumberField.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	type: PropTypes.oneOf(['currency', 'percent']),
	computed: PropTypes.func,
	className: PropTypes.string,
	headerClass: PropTypes.string,
};

NumberField.defaultProps = {
	dataClass: 'data-number',
	className: 'right',
	headerClass: 'right',
	emptyField: '-',
};

export default NumberField;
