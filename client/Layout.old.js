import React from 'react';
import { withRouter } from 'react-router-dom';
import DevTools from 'mobx-react-devtools'

import LayoutTitle from './LayoutTitle';
import Menu, { MenuButton } from './Menu';
import IconLink from './components/ui/IconLink';
import Switch from './components/ui/Switch';
import { inject, observer } from 'mobx-react';

@withRouter @inject("store", "uiStore") @observer
export default class Layout extends React.Component {

	constructor(props) {
		super(props);
		this.uiStore = props.uiStore;
		this.store = props.store;
		this.prevPath = null;
	}

	componentDidMount () {
	}

	componentDidUpdate() {
		this.content.scrollTop = 0;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.location !== this.props.location) {
			this.uiStore.prevPath = this.props.location.pathname;
			this.uiStore.newPath = nextProps.location.pathname;
		}
	}

	switchDebugInfo(on) {
		this.uiStore.switchDebugInfo(on);
	}

	logout (e) {
		e.preventDefault();
		this.store.logout ();
	}

	render () {
		if (this.store.isAuthorized) {
			const menuState = ['hidden', 'active', 'pinned', 'pinned-hidden'][this.uiStore.menuState];

			const RightElement = <div>
				{(this.uiStore.showDebugInfo && this.uiStore.width > 767) && <DevTools position={{ top: 12, right: 190 }}/>}
				<Switch active={this.uiStore.showDebugInfo} label="Debug" right={true}
				        style={{ marginRight: 10 }}
				        onChange={on => this.switchDebugInfo(on)}/>
				<IconLink label="Выход" href="#" onClick={e => this.logout(e)} icon="logout"/>
			</div>;

			return (
				<div id="app-container" className={'authorized menu-' + menuState + (this.uiStore.animation ? ' animation' : '')}>
					<div id="appbar">
						<div className="menu-btn"><MenuButton /></div>
						<div className="appbar-title">{<LayoutTitle />}</div>
						<div className="appbar-actions">
							{RightElement}
						</div>
					</div>
					<Menu ref="menu"/>
					<div id="main-content" ref={node => this.content = node} className="container-fluid">
						{this.props.children}
					</div>
					{/*<Notification />*/}
					<div className="notifications">
						{
							this.uiStore.notifications
								.values()
								.filter(n => n.active)
								.map(n =>
									<div className="notification" key={'notification'+n.time}>{n.text}</div>
								)
						}
						<div className="lastNotification">
							{this.uiStore.notifications.size} : {this.uiStore.lastNotification}
						</div>
					</div>
				</div>
			);
		}
		else {
			return (
				<div id="app-container" className={'unauthorized'}>
					<div id="main-content" className="container-fluid">
						{this.props.children}
					</div>
				</div>
			);
		}
	}
}

