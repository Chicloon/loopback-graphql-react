import React from 'react';
import { inject, observer } from 'mobx-react';
import './dashboard.scss';

import {
	List,
	Field,
	TextField,
} from '../../ui/List';

import { PersonAvatar } from '../../ui';

import t from '../../../../i18n';

@inject('store') @observer
class Dashboard extends React.Component {

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.project = props.project;
	}

	person (person) {
		return <div>
			<PersonAvatar person={person} size={24} style={{ marginRight: 10, marginBottom: 2 }}/>
			{(person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '')}
		</div>;
	}

	render () {
		return (
			<div className="project-dashboard">
				<List model={this.store.ProjectMember}
				      inline={true}
				      className="middle"
				      where={{ projectId: this.project.id }}
				      defaultProperties={{ projectId: this.project.id }}
				      defaultSort={{ field: 'id', order: 1 }}
				      {...this.props}>
					<Field relation='person' computed={this.person} label={t('person.title')}/>
					<TextField relation='role' property='name' label={t('projectRole.title')}/>
					<TextField rich={true} property='comment' label={t('projectMember.comment')}/>
				</List>
			</div>
		);
	}

}

export default Dashboard;
