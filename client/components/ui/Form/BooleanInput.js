import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Switch } from '../index';

@inject('recordData') @observer
class BooleanInput extends React.Component {

	@observable value = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.record = this.props.recordData.record;
		this.value = this.record[this.props.property] || false;
	}

	handleChange(newValue) {
		this.value = newValue;
		this.record[this.props.property] = this.value;
	}

	render() {
		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<Switch active={this.value} left="true"
				        onChange={on => this.handleChange(on)} />
			</div>
		);
	}
}

BooleanInput.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	label: PropTypes.string,
};

BooleanInput.defaultProps = {
};

export default BooleanInput;
