import React from 'react';
import PropTypes from 'prop-types';
import IconLink from './IconLink';
import _ from 'lodash';

const MenuItem = (props) => {
	const { active, isActive, href, className, onClick } = props;

	let _active = false;
	if (isActive) _active = isActive(props);
	if (active) _active = active;

	const sendProps = _.omit(props, ['className', 'isActive', 'active', 'onClick']);

	sendProps.onClick = (e) => {
		if (onClick) onClick(e, href);
	};

	// console.log('props:', sendProps);

	return (
		<IconLink className={(className || '') + (_active ? ' active' : '')}
		          {...sendProps}/>
	)
};

MenuItem.propTypes = {
	href: PropTypes.string,
	icon: PropTypes.string,
	className: PropTypes.string,
	rightElement: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.object,
	]),
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	isActive: PropTypes.func,
	active: PropTypes.bool,
};

export default MenuItem;
