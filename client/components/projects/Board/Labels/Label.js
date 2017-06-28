import React from 'react';
import ColorUtils from '../../../ui/ColorUtils';
import './style.scss';

const Label = props => {
	const { label } = props;
	const style = {
		backgroundColor: label.color,
		color: ColorUtils.textColor(label.color),
	};
	return (
		<span className="label" style={style}>{label.name}</span>
	);
};

export default Label;
