import React from 'react';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { computed, observable, action } from 'mobx';

import { Icon } from '../ui';
import t from '../../../i18n';
import './project.scss';

import ProjectMembers from './ProjectMembers';
import ProjectLabels from './ProjectLabels';

const FULL_BAR_WIDTH = 1200;

@inject('uiStore') @observer
class Bar extends React.Component {

	@observable labels;

	constructor (props) {
		super(props);
		console.log('ProjectBar props', props);
		this.uiStore = props.uiStore;
		this.project = props.project;
		this.labels = this.project.labels();
		// console.log('project:', this.project, this.project.client);

		// this.updateDimensions = this.updateDimensions.bind(this);
		// window.addEventListener("resize", this.updateDimensions);

	}

	// updateDimensions (e) {
	// console.log('Bar:', this.uiStore.width);
	// }

	@computed get sortedTaskLabels () {
		return this.labels.list;
		// return this.labels.list.sort((a, b) => b.label.priority - a.label.priority);
	}

	render () {
		const members = this.uiStore.width < FULL_BAR_WIDTH ?
			this.project.members().totalCount : <ProjectMembers project={this.project} />;

		const labels = this.uiStore.width < FULL_BAR_WIDTH ?
			this.labels.list.length : <ProjectLabels project={this.project} />;

		const client = this.project.client ?
			<Link icon="briefcase" to={'/clients/' + this.project.client.id}><Icon icon="briefcase"/> <span>{this.project.client.name}</span></Link>
			: '-';

		return <div className="project-title">
			<h1>{this.project.name}</h1>
			<span className="block bar-tasks">Задачи: <strong>{this.project.tasks().totalCount}</strong></span>
			<span className="block title">Участники:</span>
			<span className="block bar-members">{members}</span>
			<span className="block title">Метки:</span>
			<span className="block bar-labels">{labels}</span>
			<span className="block bar-client">{client}</span>
		</div>;
	}

}

export default Bar;
