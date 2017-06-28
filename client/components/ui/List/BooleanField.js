import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Icon from '../Icon';
import Field from './Field';

@observer
class BooleanField extends React.Component {

	constructor (props) {
		super(props);
		this.props = props;
	}

	addClassName (value) {
		return value ? ' true' : ' false';
	}

	printValue (value) {
		return value ? <Icon icon="ok" /> : this.props.falseField;
	}

	render () {
		return <Field {...this.props}
		              printValue={this.printValue.bind(this)}
		              addClassName={this.addClassName}/>;
	}

}

BooleanField.propTypes = {
	property: PropTypes.string.isRequired,
	relation: PropTypes.string,
	className: PropTypes.string,
	falseField: PropTypes.string,
	headerClass: PropTypes.string,
};

BooleanField.defaultProps = {
	dataClass: 'data-boolean',
	className: 'center',
	headerClass: 'center',
	falseField: '',
};

export default BooleanField;
