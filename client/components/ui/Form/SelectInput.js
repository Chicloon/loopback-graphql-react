import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';

@inject('recordData') @observer
class SelectInput extends React.Component {

	constructor (props) {
		super(props);
		this.props = props;
		this.record = this.props.recordData.record;
		this.model = this.props.recordData.model;
		this.property = this.props.property;
		// console.log('SelectInput:', this.record.isLoading);
		this.isLoading = this.record.isLoading;
	}

	componentDidMount() {
		// console.log('+ SelectInput: componentDidMount');
		if (this.record[this.property] === undefined) {
			this.isLoading = true;
		}
		else {
			this.isLoading = false;
			if (this.props.onMount) this.props.onMount({
				record: this.record,
				property: this.property,
				value: this.record[this.property],
			});
		}
	}

	componentDidUpdate() {
		if (this.isLoading && !this.record.isLoading && this.props.onMount) {
			this.props.onMount({
				record: this.record,
				value: this.value,
			});
			this.isLoading = false;
			// console.log('called onMount:', this.record, this.property, this.value);
		}
	}

	get value() {
		return this.record[this.property];
	}

	set value(newValue) {
		this.record[this.property] = newValue;
	}

	handleChange(e) {
		this.value = e.target.value;
		if (this.props.onChange) {
			this.props.onChange({
				record: this.record,
				value: this.value,
			});
		}
	}

	render() {
		// console.log('SelectInput render:', this.record, this.value);

		const items = this.props.items.map((item, i) => {
			const { value, label } = item instanceof Object ? item : { value: item, label: item };
			return <option key={i} value={value}>{label}</option>;
		});

		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<select value={this.value || ''} className="form-control" onChange={e => this.handleChange(e)}>
					<option />
					{items}
				</select>
			</div>
		);
	}
}

SelectInput.propTypes = {
	items: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object,
	]).isRequired,
	property: PropTypes.string,
	relation: PropTypes.string,
	label: PropTypes.string,
	onChange: PropTypes.func,
	onMount: PropTypes.func,
};

SelectInput.defaultProps = {
};

export default SelectInput;
