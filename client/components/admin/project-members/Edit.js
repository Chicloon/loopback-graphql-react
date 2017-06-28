import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	RelationInput,
} from '../../ui/Form';
import { PersonAvatar } from '../../ui';
import t from '../../../../i18n';

@inject('store') @observer
class ProjectMemberEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '');
	}

	person (person) {
		return <div>
			<PersonAvatar person={person} size={24} style={{ marginRight: 10 }}/>
			{(person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '')}
		</div>;
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.ProjectMember} className="fixed-width" title={t('projectMember.title')} {...this.props}>
				<RelationInput relation="person" computed={this.person} property="lastName" label={t('person.title')}/>
				<RelationInput relation="role" property="name" label={t('projectRole.title')}/>
				<RelationInput relation="project" property="name" label={t('project.title')}/>
				<TextInput property="comment" label={t('projectMember.comment')}/>
			</Form>
		);
	}
}

export default ProjectMemberEdit;
