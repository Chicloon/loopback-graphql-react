import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import omit from 'lodash/omit';

const IconLink = (props) => {
	const { href, icon, label, rightElement } = props;

	const sendProps = omit(props, ['href', 'icon', 'label', 'rightElement']);

	// console.log('props:', sendProps);

	return href !== undefined && href !== '#' ? (
		<Link to={href} {...sendProps}>
			{icon && <Icon icon={icon} />}
			{icon ? <span className="text">{label}</span> : label}
			{rightElement && <span className="right-element">{rightElement}</span>}
		</Link>
	) : (
		<a href='#' {...sendProps}>
			{icon && <Icon icon={icon} />}
			{icon ? <span className="text">{label}</span> : label}
			{rightElement && <span className="right-element">{rightElement}</span>}
		</a>
	);

};

IconLink.propTypes = {
	href: PropTypes.string,
	icon: PropTypes.string,
	label: PropTypes.string,
	className: PropTypes.string,
};

export default IconLink;
