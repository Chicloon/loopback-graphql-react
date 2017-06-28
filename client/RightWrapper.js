import React from 'react';
import { MenuButton } from './Menu';

class RightWrapper extends React.Component {

	constructor (props) {
		super (props);
		// console.log('props:', props);
	}

	render() {
		const Bar = this.props.bar;
		console.log('props.bar:', Bar);
		return <div className="right-wrapper">
			<div id='appbar'>
				<MenuButton />
				{Bar ? <Bar /> : 'no bar'}
			</div>
			<div id="appbar-shadow" ref={node => this.shadow = node}/>
			<div id="main-content"
			     ref={node => this.content = node}
			     onScroll={e => this.onContentScroll(e)}
			     className="container-fluid">
				{this.props.children}
			</div>
		</div>;
	}

}

export default RightWrapper;
