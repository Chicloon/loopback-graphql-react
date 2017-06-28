import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ icon, className, ...props }) =>
	<i className={'icon-'+icon + ' ' + (className || '')} {...props} />;

Icon.propTypes = {
	icon: PropTypes.string.isRequired,
};

export default Icon;
