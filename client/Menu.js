/* eslint jsx-a11y/anchor-has-content: off */
import React, { Component } from 'react';
import Icon from './components/ui/Icon';
import MenuItem from './components/ui/MenuItem';
import t from '../i18n';
import { observable, computed, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import IconLink from './components/ui/IconLink';

export const MenuButton = props => <Icon id="menu-toggle-btn" icon="menu" />;

export const MENU_ITEMS = [
	{
		type: 'submenu',
		id: 'management',
		label: t('management'),
		opened: true,
		icon: 'cog',
		items: [
			{ type: 'link', record: { href: '/projects', icon: 'project', label: t('projects') } },
			{ type: 'link', record: { href: '/tasks', icon: 'task', label: t('tasks') } },
			{ type: 'link', record: { href: '/persons', icon: 'person-card', label: t('persons') } },
			{ type: 'link', record: { href: '/tasks_gql', icon: 'task', label: 'tasks_gql' } },
			{ type: 'link', record: { href: '/clients', icon: 'briefcase', label: t('clients') } },
		]
	},

	{
		type: 'submenu',
		id: 'finance',
		label: t('finance'),
		opened: true,
		icon: 'cog',
		items: [
			{ type: 'link', record: { href: '/budgets', icon: 'chart-pie', label: t('budgets') } },
			{ type: 'link', record: { href: '/budgetroles', icon: 'role', label: t('budgetRoles') } },
			{ type: 'link', record: { href: '/payments', icon: 'database', label: t('payments') } },
		]
	},

	{
		type: 'submenu',
		id: 'settings',
		label: t('settings'),
		opened: true,
		icon: 'cog',
		items: [
			{ type: 'link', record: { href: '/labels', icon: 'tag', label: t('labels') } },
			{ type: 'link', record: { href: '/projectroles', icon: 'role1', label: t('projectRoles') } },
			{ type: 'link', record: { href: '/users', icon: 'user', label: t('users') } },
			{ type: 'link', record: { href: '/acls', icon: 'lock', label: t('acls') } },
		]
	},

	{
		type: 'submenu',
		id: 'administration',
		label: t('administration'),
		icon: 'cog',
		items: [
			// { type: 'link', item: { href: '/uidemo', icon: 'help-circled', label: 'UI Demo' } },
			{ type: 'link', record: { href: '/admin/projects', icon: 'project', label: t('projects') } },
			{ type: 'link', record: { href: '/admin/projectmembers', icon: 'users', label: t('projectMembers') } },
			{ type: 'link', record: { href: '/admin/projectroles', icon: 'role1', label: t('projectRoles') } },
			{ type: 'link', record: { href: '/admin/boardlists', icon: 'tasks-list', label: t('boardLists') } },
			{ type: 'link', record: { href: '/admin/budgetroles', icon: 'role', label: t('budgetRoles') } },
			{ type: 'link', record: { href: '/admin/payments', icon: 'database', label: t('payments') } },
			{ type: 'link', record: { href: '/admin/labels', icon: 'tag', label: t('labels') } },
			{ type: 'link', record: { href: '/admin/users', icon: 'user', label: t('users') } },
			{ type: 'link', record: { href: '/admin/roles', icon: 'role', label: t('roles') } },
			{ type: 'link', record: { href: '/admin/acls', icon: 'lock', label: t('acls') } },
			{ type: 'link', record: { href: '/admin/rolemappings', icon: 'role1', label: t('roleMappings') } },
		]
	},

];

@inject("store", "uiStore") @observer
class Menu extends Component {

	@observable currentItem = null;
	@observable activeSubMenus = {};

	constructor(props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.activeSubMenus = this.uiStore.activeSubMenus;
		this.bounds = {
			menu: null,
		};
	}

	componentDidMount() {
		const menuButton = document.getElementById('menu-toggle-btn');
		if (menuButton) menuButton.addEventListener('click', e => this.toggle());
		if (this.cover) this.cover.addEventListener('click', e => this.hide());
		if (this.node) this.node.addEventListener('click', e => this.handleMenuClick(e));

		this.desktopMenuState = this.uiStore.menuState;
		window.addEventListener("resize", e => this.updateDimensions());
		this.updateDimensions();

		this.setCurrentItem(window.location.pathname);
		this.uiStore.animation = true;
	}

	componentWillReceiveProps(nextProps) {
		// console.log('Menu:', nextProps.uiStore.newPath);
		if (nextProps.uiStore.newPath) this.setCurrentItem(nextProps.uiStore.newPath);
	}

	setCurrentItem(path) {
		const pathParts = path.split('/');
		if (pathParts[2] && isNaN(pathParts[2])) {
			this.currentItem = '/' + pathParts[1] + '/' + pathParts[2];
		}
		else {
			this.currentItem = '/' + pathParts[1];
		}
		// console.log('setCurrentItem:', path, pathParts[2], this.currentItem);
	}

	handleMenuItemClick(e, href) {
		if (this.uiStore.isMobile()) {
			this.uiStore.setMenuState(0);
		}
	}

	handleSubMenuClick(e, submenu, locked) {
		e.preventDefault();
		console.log('handleSubMenuClick', submenu, locked ? ', locked!' : '');
		if (!locked) this.uiStore.switchSubMenu(submenu);
	}

	handleMenuClick(e) {
		if (e.target.tagName.toLowerCase() === 'a') {
			this.hide();
		}
	}

	logout(e) {
		e.preventDefault();
		this.store.logout();
	}

	updateDimensions() {
		// console.warn('updateDimensions, current menuState:', this.uiStore.menuState);
		if (this.uiStore.isMobile()) {
			if (!this.desktopMenuState) {
				console.log('isMobile, this.oldMenuState =>', this.uiStore.menuState);
				this.desktopMenuState = this.uiStore.menuState;
			}
			this.uiStore.setMenuState(0);
		}
		else {
			if (this.desktopMenuState) {
				console.log('restore menuState', this.desktopMenuState);
				let state = this.desktopMenuState;
				if (this.desktopMenuState === 3) {
					state = 0;
				}
				this.uiStore.setMenuState(state);
				this.desktopMenuState = null;
			}
		}
	}

	isActive = () => this.uiStore.menuState === 1;

	isItemActive(menuitem) {
		// console.log('isItemActive', this.currentItem, menuitem.href);
		return menuitem.href && this.currentItem === menuitem.href;
	}

	isSubmenuActive(submenu) {
		return !!this.uiStore.activeSubMenus[submenu];
	}

	hide = () => {
		console.log('hide');
		if (this.isActive() && this.uiStore.isMobile()) {
			this.uiStore.switchMenuState(0);
		}
	};

	toggle = () => {
		this.bounds['menu'] = this.node.getBoundingClientRect();
		// 0 - hidden, 1 - active
		console.log('menu toggle', this.uiStore.menuState);
		let newState = this.uiStore.menuState + 1;
		if (this.uiStore.isMobile()) {
			this.uiStore.animation = true;
			if (newState > 1) newState = 0;
		}
		else if (newState > 1) {
			newState = 0;
			/*
			 setTimeout(() => {
			 this.uiStore.animation = false;
			 newState = 0;
			 this.uiStore.switchMenuState(newState);
			 }, 250);
			 setTimeout(() => {
			 this.uiStore.animation = true;
			 }, 300);
			 */
		}
		if (!this.uiStore.isMobile()) this.desktopMenuState = newState;
		this.uiStore.switchMenuState(newState);

	};

	render() {
		const email = this.store.user ? <div className="user-section">
			{this.store.user.email}
			<IconLink className="logout-link" href="#" onClick={e => this.logout(e)} icon="logout" />
		</div> : '';

		const menuItems = MENU_ITEMS.map((menuitem, i) => {
			// console.log('MENU_ITEMS:', i, menuitem);
			if (menuitem.type === 'section') {
				return <div key={i} className="subheader">{menuitem.title}</div>;
			}
			else if (menuitem.type === 'link') {
				return <MenuItem key={i} {...menuitem.record}
					className='link'
					onClick={this.handleMenuItemClick.bind(this)}
					isActive={_item => this.isItemActive(_item)} />;
			}
			else if (menuitem.type === 'submenu') {
				let subItemActive = false;
				let subMenuActive = this.isSubmenuActive(menuitem.id);

				const subItems = menuitem.items.map((subItem, j) => {
					if (subItem.type === 'section') {
						return <div key={'sub-' + i + '-' + j} className="subheader">{subItem.title}</div>;
					}
					else if (subItem.type === 'link') {
						const active = this.isItemActive(subItem.record);
						subItemActive = subItemActive || active;
						return <MenuItem key={'sub-' + i + '-' + j} {...subItem.record}
							className='link'
							onClick={this.handleMenuItemClick.bind(this)}
							active={active} />;
					}
				});

				if (subItemActive && !subMenuActive) {
					subMenuActive = true;
					this.uiStore.switchSubMenu(i);
				}

				return (
					<div key={i} className={"sub-menu" + (subMenuActive ? ' active' : '') + (subItemActive ? ' locked' : '')}>
						<MenuItem key={'sub-' + i} className="sub-menu-title"
							label={menuitem.label}
							onClick={e => this.handleSubMenuClick(e, menuitem.id, subItemActive)}
							rightElement={<Icon icon={subItemActive ? 'down-open' : 'right-open'} />}
						/>
						{subItems}
					</div>
				);
			}
		}
		);

		return (
			<div className="menu-container">
				<div id="menu" className={email ? 'with-user' : ''} ref={node => this.node = node}>
					<div className="logo"><Link to="/"><em>Smart</em>Platform</Link></div>
					{email && <div className="menu-title">{email}</div>}
					<div className="menu-content">
						{menuItems}
					</div>
					<div className="shadow" />
				</div>
				<div className="menu-cover" ref={node => this.cover = node} />
			</div>
		)
	};

}

export default Menu;
