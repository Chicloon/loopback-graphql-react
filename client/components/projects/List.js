import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';

import ProjectMembers from './ProjectMembers';
import ProjectLabels from './ProjectLabels';

import {
	List,
	TextField,
	NumberField,
} from '../ui/List';

import {
	Icon,
} from '../ui';


import t from '../../../i18n';

@inject('store', 'uiStore') @observer
class ProjectList extends React.PureComponent {

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.uiStore = props.uiStore;
		console.log('ProjectList: constructor', this.membersCache);

		this.membersCache = {};
		this.labelsCache = {};
		props.uiStore.setBar(<h1>{t('projects')}</h1>);

	}

	componentDidMount () {
		console.log('ProjectList: componentDidMount');
	}

	name (project) {
		return <span>
			{project.name}
			{project.private && <Icon icon="lock"/>}
		</span>;
	}

	projectList (project) {
		return <span className="project-list-color" style={{background: '#07d'}} />;
	}

	members (project) {
		return <ProjectMembers project={project} />;
	}

	labels (project) {
		return <ProjectLabels project={project} />;
	}

	render () {
		return (
			<List model={this.store.Project}
			      className="project-list"
			      createTitle={t('project.title')}
			      {...this.props}>
				<TextField computed={this.projectList} width="5px" className="project-projectlist" />
				<TextField computed={this.name} property='name' label={t('project.title')}/>
				<NumberField relation='tasks' property='totalCount' label={t('tasks')} width="70px" className="right tasks-column" headerClass="right tasks-column"/>
				<TextField computed={this.members.bind(this)} className='members-column' label={t('projectMember.list')}/>
				<TextField computed={this.labels.bind(this)} className='labels-column' label={t('label.list')}/>
				<TextField className="right" headerClass="right" relation='client' property='name' label={t('client.title')}/>
			</List>
		);
	}
}

export default ProjectList;
