/* globals APP_NAME */
import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

const LayoutTitle = ({ subtitle }) => (
    <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.2em' }}>
        Smart<span style={{color:'#2af'}}>Platform</span>{subtitle && <span> | {subtitle}</span>}
    </Link>
);

LayoutTitle.propTypes = {
    subtitle: PropTypes.string,
};

export default LayoutTitle;
