import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

const timerStyle = {
	position: 'absolute',
	background: '#000',
	color: '#fff',
	zIndex: 5000,
	width: 30,
	height: 20,
	left: 0,
	top: 0,
	lineHeight: '20px',
	textAlign: 'center',
};

@observer
class TestTimer extends React.Component {

	@observable time = 0;

	constructor (props) {
		super (props);
		setInterval(() => this.time++, 1000);
	}

	render () {
		// return <div style={timerStyle}>4</div>;
		return <div style={timerStyle}>{this.time}</div>;
	}

}

export default TestTimer;
