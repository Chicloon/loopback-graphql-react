import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const LabelSmall = props => {
	const { label, className } = props;
	const backgroundColor = label.color;
	return (
		<span className={"label-small " + (className || '')} style={{backgroundColor}} />
	);
};

LabelSmall.propTypes = {
	label: PropTypes.object,
	className: PropTypes.string,
};

export default LabelSmall;
