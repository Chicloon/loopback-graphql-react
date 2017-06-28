import React from 'react';
import PropTypes from 'prop-types';
import { IconLink } from './index';

class Button extends React.Component {

	onClick (e) {
		e.preventDefault();
		if (this.props.onClick) this.props.onClick(e);
	}

	render () {
		let className = 'btn ';
		if (!this.props.className || (this.props.className && this.props.className.search(/btn-/ig) === -1)) className += 'btn-default ';
		className += this.props.className || '';
		return <IconLink {...this.props} className={className} onClick={this.onClick.bind(this)} />;
	}

}

Button.propTypes = {
	icon: PropTypes.any,
	onClick: PropTypes.func,
	label: PropTypes.string,
	className: PropTypes.string,
};

export default Button;

