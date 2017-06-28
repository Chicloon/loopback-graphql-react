import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import {
	Icon,
	IconLink,
	TabMenu,
	MenuItem,
	Switch,
	ColorUtils,
} from './index';

import { icons } from './icons';

@observer
export default class UIDemo extends React.Component {

	@observable activeTab = 'tab-home';
	@observable hash = null;

	constructor (props) {
		super(props);
		this.hash = 'A';
	}

	isItemActive (item) {
		return item.id === this.activeTab;
	}

	selectTab (e) {
		e.preventDefault();
		this.activeTab = e.target.id;
		console.log('activeTab:', this.activeTab);
	}

	calcHash (e) {
		const str = e.target.value;
		this.hash = ColorUtils.intHash(str);
		console.log('calcHash:', this.hash, str);
	}

	render () {

		return (
			<div className="ui-demo">
				<h2>UI demo</h2>

				<div className="block"
				     onTouchStart={e => console.log('touch start')}
				     onTouchEnd={e => console.log('touch end')}
				     onClick={e => console.log('click')}
				     style={{background: '#ccc', padding: 15, height: 200}}>
					TOUCH TEST
				</div>

				<div className="block">
					<h3>Icons</h3>
					{icons.map((icon, i) => <div className="ui-icon" key={i}>
						<Icon icon={icon}/>
						<span>{icon}</span>
					</div>)}
				</div>

				<div className="block">
					<h3>TabMenu</h3>
					<TabMenu>
						<MenuItem id="tab-home" href="#" icon="home" label="Home" onClick={e => this.selectTab(e)} isActive={item => this.isItemActive(item)}/>
						<MenuItem id="tab-users" href="#" icon="user" label="Users" onClick={e => this.selectTab(e)} isActive={item => this.isItemActive(item)}/>
						<MenuItem id="tab-projects" href="#" icon="project" label="Projects" onClick={e => this.selectTab(e)} isActive={item => this.isItemActive(item)}/>
						<MenuItem id="tab-tags" href="#" icon="tag" label="Tags" onClick={e => this.selectTab(e)} isActive={item => this.isItemActive(item)}/>
					</TabMenu>
				</div>

				<div className="block">
					<h3>Switch</h3>
					<Switch active={false} label="Default" />
				</div>

				<div className="block">
					<h3>Integer hash</h3>
					<input type="text" size="50" onChange={e => this.calcHash(e)} />
					hash: {JSON.stringify(this.hash)}
				</div>

			</div>
		);
	}

}
