import React from 'react';
import { withRouter } from 'react-router-dom';
import DevTools from 'mobx-react-devtools'

import LayoutTitle from './LayoutTitle';
import Menu, { MenuButton } from './Menu';
import IconLink from './components/ui/IconLink';
import Switch from './components/ui/Switch';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import TestTimer from './components/ui/TestTimer';

@withRouter @inject("store", "uiStore") @observer
export default class Layout extends React.Component {

	@observable title = null;
	@observable timer = 0;

	constructor (props) {
		super(props);
		this.uiStore = props.uiStore;
		this.store = props.store;
		this.prevPath = null;
		// this.uiStore.onSetTitle = (title) => {
		// 	this.title = title;
		// }
	}

	onContentScroll (e) {
		const y = document.getElementById('main-content').scrollTop;
		this.shadow.style.opacity = Math.min(y, this.shadow.offsetHeight) / this.shadow.offsetHeight;
		// console.log('onContentScroll:', y, this.shadow.style.opacity);
	}

	componentDidMount () {
		if (!this.title) this.title = this.props.location.pathname.replace(/\//, '');
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.location !== this.props.location) {
			this.uiStore.prevPath = this.props.location.pathname;
			this.uiStore.newPath = nextProps.location.pathname;
			this.title = nextProps.location.pathname.replace(/\//, '');
		}
	}

	switchDebugInfo (on) {
		this.uiStore.switchDebugInfo(on);
	}

	render () {
		const menuState = ['hidden', 'active', 'pinned', 'pinned-hidden'][this.uiStore.menuState];

/*
		const RightElement = <div>
			{(this.uiStore.showDebugInfo && this.uiStore.width > 767) && <DevTools position={{ top: 12, right: 190 }}/>}
			<Switch active={this.uiStore.showDebugInfo} label="Debug" right={true}
			        style={{ marginRight: 10 }}
			        onChange={on => this.switchDebugInfo(on)}/>
			<IconLink label="Выход" href="#" onClick={e => this.logout(e)} icon="logout"/>
		</div>;
*/

		return (
			<div id="app-container" className={'authorized menu-' + menuState + (this.uiStore.animation ? ' animation' : '')}>
				{/*<TestTimer />*/}
				{/*<DevTools position={{ top: 12, right: 190 }}/>*/}
				<Menu ref="menu"/>
				<div className="right-wrapper">
					<div id='appbar'>
						<MenuButton />
						<div className="appbar-title">{this.uiStore.bar || 'SmartPlatform'}</div>
					</div>
					<div id="appbar-shadow" ref={node => this.shadow = node}/>
					<div id="main-content"
					     ref={node => this.content = node}
					     onScroll={e => this.onContentScroll(e)}
					     className="container-fluid">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}

