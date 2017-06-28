import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

@observer
class Value extends React.Component {

	@observable value = null;

	constructor (props) {
		super(props);
		this.props = props;
	}

	render() {
		const value = this.props.record[this.props.property];
		const printValue = !this.props.computed ? value : this.props.computed(value);
		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label}</label>
				<input className="form-control readonly" value={printValue || ''} readOnly={true} />
			</div>
		);
	}
}

Value.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	label: PropTypes.string,
};

export default Value;
