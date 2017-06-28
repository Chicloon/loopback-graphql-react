import React from 'react';
import { Route } from 'react-router-dom';
import { observer, inject } from 'mobx-react';

import { MenuItem, TabMenu, IconLink, PersonAvatar } from '../ui';
import t from '../../../i18n';

import Board from './Board';
import Edit from './Edit';
import Dashboard from './Dashboard';
import Budgets from './Budgets';
import Bar from './Bar';

import './project.scss';

@inject('store', 'uiStore') @observer
class ProjectRoot extends React.Component {

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;

		this.project = this.store.getById(this.store.Project, this.props.match.params.id, null, [
			{ relation: "client" },
			{ relation: 'labels' },
			{
				relation: "members",
				scope: {
					include: [
						{
							relation: 'person',
							scope: {
								include: [
									{
										relation: "tasks",
										scope: {
											where: { projectId: this.props.match.params.id }
										}
									},
								]
							}
						},
					],
				}
			},
			{
				relation: "boardLists",
				scope: {
					include: [
						{
							relation: "tasks",
							scope: {
								include: [
									{ relation: 'person' },
									{ relation: 'labels' },
								]
							}
						},
						{ relation: "person" }
					]
				}
			}
		]);
		this.persons = this.store.Person.list();
		this.projectRoles = this.store.ProjectRole.list();
		this.labels = this.store.Label.list();

		props.uiStore.setBar(<Bar project={this.project}/>);
	}

	isItemActive (item) {
		const location = window.location.pathname;
		return location === item.href;
	}

	back (e) {
		e.preventDefault();
		this.props.history.goBack();

		/*
		 if (this.uiStore.prevPath && this.uiStore.prevPath.match(/\/projects\/.+/img)) {
		 this.props.history.push('/projects');
		 }
		 else {
		 history.back();
		 }
		 */
	}

	render () {
		return (
			<div className="full-size">
				<TabMenu>
					<MenuItem icon="chart-bar-2" label={t('board')} href={'/projects/' + this.project.id + ''} isActive={this.isItemActive}/>
					<MenuItem icon="chart-pie" label={t('budgets')} href={'/projects/' + this.project.id + '/budgets'} isActive={this.isItemActive}/>
					<MenuItem icon="users" label={t('projectMember.list')} href={'/projects/' + this.project.id + '/dashboard'} isActive={this.isItemActive}/>
					<MenuItem icon="info-circled" label={t('information')} href={'/projects/' + this.project.id + '/edit'} isActive={this.isItemActive}/>
				</TabMenu>
				<Route exact path="/projects/:id" render={() => <Board {...this.props} project={this.project}/>}/>
				<Route exact path="/projects/:id/edit" render={() => <Edit {...this.props} project={this.project}/>}/>
				<Route exact path="/projects/:id/dashboard" render={() => <Dashboard {...this.props} project={this.project}/>}/>
				<Route exact path="/projects/:id/budgets" render={() => <Budgets {...this.props} project={this.project}/>}/>
			</div>
		);

	}

}

export default ProjectRoot;
