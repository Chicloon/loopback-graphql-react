import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as Datetime from 'react-datetime'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as moment from 'moment';

@inject('recordData') @observer
class DateInput extends React.Component {

	@observable value = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.record = this.props.recordData.record;
	}

	handleChange(value) {
		if (typeof value === 'object') {
			this.record[this.props.property] = value.format();
		}
		else {
			this.record[this.props.property] = null;
		}
	}

	render() {
		const stringValue = this.record[this.props.property];
		const value = moment(stringValue);
		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<DatePicker selected={stringValue ? value : ''}
				            dateFormat="DD.MM.YYYY"
				            fixedHeight
				            onChange={moment => this.handleChange(moment)} />
			</div>
		);
	}
}

DateInput.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	label: PropTypes.string,
};

DateInput.defaultProps = {
};

export default DateInput;
