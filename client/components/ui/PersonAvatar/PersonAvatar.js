import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import _ from 'lodash';
import { ColorUtils } from '../../ui';

const avatarColors = [
	'#e88',
	'#fa4',
	'#fd6',
	'#ad4',
	'#6aa',
	'#6cf',
	'#67d',
	'#85f',
	'#daf',
	'#f8c',
	'#da9',
	'#9be',
	'#fccccc',
	'#ffe7cc',
	'#fff8cc',
	'#eef8cc',
	'#cceee7',
	'#daf5ff',
	'#cce4f8',
	'#e7ddff',
	'#f5ccff',
	'#ffccf5',
	'#f8eeeb',
];

const sizes = {
	small: [22, 10],
	medium: [28, 12],
	default: [34, 14],
	large: [40, 16],
};

const fullName = person => ((person.firstName || '') + ' ' + (person.middleName || '') + ' ' + (person.lastName || ''));

const emptyAvatarData = person => {
	let initials = (person.firstName ? person.firstName.charAt(0) : '') + (person.lastName ? person.lastName.charAt(0) : '');
	// console.log(person, 'initials:', initials);
	if (initials.length < 1) initials = person.id;
	const background = avatarColors[ColorUtils.intHash(fullName(person), avatarColors.length)];
	const color = ColorUtils.textColor(background);
	const data = { background, color };
	return {
		...data,
		initials,
	};
};

const PersonAvatar = (props) => {
	console.log("Avatar props", props);
	let { person, size, style, badge, className } = props;
	const sendProps = _.omit(props, ['className', 'style', 'person', 'size', 'badge']);
	let pxSize = 34;
	let fontSize = 14;
	if (typeof(size) === 'number') {
		pxSize = size;
		fontSize = Math.round(size / 2.3);
	}
	else {
		size = size || 'default';
		pxSize = sizes[size][0];
		fontSize = sizes[size][1];
	}
	// console.log('size:', size);
	const data = emptyAvatarData(person);
	// console.log('PersonAvatar:', person);
	return person.avatar ? (
			<span className={"avatar " + (className || '')} style={{...style, width: pxSize + 'px', height: pxSize + 'px',}}>
				<img src={person.downloadFile('avatar')} style={{width: pxSize + 'px', height: pxSize + 'px',}}/>
				<em />
				{badge && <span className={'person-badge ' + (badge.className || '')}>{badge.label}</span>}
			</span>
		)
		:
		<span className={"empty-avatar " + (className || '')}
		      {...sendProps}
		      style={{
			      ...style,
			      backgroundColor: data.background,
			      color: data.color,
			      width: pxSize + 'px',
			      height: pxSize + 'px',
			      lineHeight: pxSize + 'px',
			      fontSize: fontSize + 'px',
		      }}>{data.initials}
			{badge && <span className={'person-badge ' + (badge.className || '')}>{badge.label}</span>}
		</span>;
};

PersonAvatar.propTypes = {
	person: PropTypes.object.isRequired,
	size: PropTypes.any,
	badge: PropTypes.object,
	className: PropTypes.string,
};

export default PersonAvatar;
