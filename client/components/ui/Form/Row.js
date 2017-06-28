import React from 'react';
import PropTypes from 'prop-types';

const Row = props => {
	const count = props.children.length ? props.children.length : 1;
	const cols = 12 / count;
	// console.log('cols:', count, cols, Math.round(cols));
	if (cols !== Math.round(cols)) {
		throw RangeError('invalid children count in a Row!');
	}
	const colClassName = `col-xs-12 col-sm-12 col-md-${cols} col-lg-${cols}`;
	return <div className={'row ' + (props.className || '')}>
		{React.Children.map(props.children, element => {
			const className = colClassName + ' ' + (element.props.className || '');
			return React.cloneElement(element, { className })
		})}
	</div>
};

Row.propTypes = {
	className: PropTypes.string,
};

export default Row;
