import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';

import {
	List,
	TextField,
	NumberField,
} from '../../ui/List';

import {
	Icon,
} from '../../ui';

import t from '../../../../i18n';

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

	render () {
		return (
			<List model={this.store.Project}
			      title={t('projects')}
			      createTitle={t('project.title')}
			      admin={true}
			      {...this.props}>
				<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
				<TextField computed={this.name} property='name' label={t('project.title')}/>
				<NumberField relation='tasks' property='totalCount' label={t('tasks')} width="70px" className="right tasks-column" headerClass="right tasks-column"/>
				<NumberField relation='boardLists' property='totalCount' label={t('boardLists')} width="120px" className="right tasks-column" headerClass="right tasks-column"/>
				<TextField className="right" headerClass="right" relation='client' property='name' label={t('client.title')}/>
			</List>
		);
	}
}

export default ProjectList;
