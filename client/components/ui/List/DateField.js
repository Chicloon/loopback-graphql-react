import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// import 'react-widgets/lib/less/react-widgets.less';

// const locales = 'ru';
// const options = { hour12: false };

// const dateFormat = require('dateformat');

// const momentLocalizer = require('react-widgets/lib/localizers/moment');
// momentLocalizer(moment);
// const DateTimePicker = require('react-widgets/lib/DateTimePicker');

const LOADING = "LOADING";
const ERROR = "ERROR";
const SUCCESS = "SUCCESS";

@inject(
	'store',
	'uiStore',
	'recordData',
)
@observer
class DateField extends React.PureComponent {

	@observable active = false;

	constructor (props) {
		super(props);
		this.props = props;
		this.record = props.recordData.record;
		this.result = LOADING;
	}

	get value () {
		let { property } = this.props;
		this.result = SUCCESS;
		if (!this.record) return null;

		if (this.record.isLoading) {
			this.result = LOADING;
			return null;
		}

		const value = this.record[property];
		if (value === undefined || value === null) {
			return null;
		}
		return moment(value);
	}

	handleChange (value) {
		if (value && typeof value === 'object') {
			this.record[this.props.property] = value.format();
		}
		else {
			this.record[this.props.property] = null;
		}
		console.log('handleChange:', this.record[this.props.property]);
	}

	handleClick(e) {
		if (this.props.editable) e.stopPropagation();
	}

	render () {
		let content = '...';
		const value = this.value;
		const props = value ? { selected: value } : {};

		if (this.result !== LOADING) {
			content = this.props.editable ? (
					<div className="inline-date">
						<DatePicker {...props}
						            placeholderText={this.props.emptyField}
						            dateFormat="DD.MM.YYYY"
						            onChange={moment => this.handleChange(moment)}/>
					</div>
			)
			:
			<span>{value ? value.format('DD.MM.YYYY') : this.props.emptyField}</span>;
		}

		return this.props.recordData.form ?
			<div className={this.props.dataClass} onClick={e => this.handleClick(e)}>{content}</div> :
			<td className={this.props.dataClass} onClick={e => this.handleClick(e)}>{content}</td>;

		// return <Field {...this.props} processValue={this.processValue} printValue={this.printValue.bind(this)}/>;
	}
}

DateField.propTypes = {
	format: PropTypes.string,
	property: PropTypes.string.isRequired,
	relation: PropTypes.string,
	className: PropTypes.string,
	headerClass: PropTypes.string,
	emptyField: PropTypes.string,
};

DateField.defaultProps = {
	dataClass: 'data-date',
	format: 'dd.mm.yy, HH:MM',
	className: 'left',
	headerClass: 'left',
	emptyField: '-',
};

export default DateField;
