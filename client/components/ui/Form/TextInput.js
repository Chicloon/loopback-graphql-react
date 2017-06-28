import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';

import Editor from '../Editor';

@inject('recordData') @observer
class TextInput extends React.Component {

	@observable active = false;

	constructor (props) {
		super(props);
		this.record = this.props.recordData.record;
		this.property = this.props.property;
	}

	get value () {
		return this.record[this.property];
	}

	set value (newValue) {
		this.record[this.property] = newValue;
	}

	render () {
		return (
			<div className={'form-input ' + (this.props.className || '')} ref={node => this.node = node}>
				<label>{this.props.label}</label>
				{!this.record.isLoading && <Editor value={this.value} {...this.props} onChange={value => this.value = value} />}
			</div>
		);
	}
}

TextInput.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	rich: PropTypes.bool,
	label: PropTypes.string,
	rows: PropTypes.number,
	limit: PropTypes.number,
};

TextInput.defaultProps = {
	rows: 1,
	rich: false,
};

export default TextInput;
