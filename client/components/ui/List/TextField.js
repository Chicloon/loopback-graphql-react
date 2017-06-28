import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Field from './Field';

@observer
class TextField extends React.PureComponent {

	constructor (props) {
		super(props);
		this.props = props;
	}

	addClassName (value) {
		return this.props.fullText ? ' full-text' : ' short-text';
	}

	render() {
		return <Field {...this.props} addClassName={this.addClassName.bind(this)}/>;
	}

}

TextField.propTypes = {
	property: PropTypes.string,
	relation: PropTypes.string,
	computed: PropTypes.func,
	className: PropTypes.string,
	headerClass: PropTypes.string,
	fullText: PropTypes.bool,
};

TextField.defaultProps = {
	dataClass: 'data-text',
	className: 'left',
	headerClass: 'left',
	fullText: false,
};

export default TextField;
