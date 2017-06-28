import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class ProjectMemberList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '');
	}

	render () {
		return <List model={this.store.ProjectMember}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('projectMembers')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField relation='person' computed={this.fullName} label={t('person.title')} />
			<TextField relation='role' property='name' label={t('projectRole.title')} />
			<TextField relation='project' property='name' label={t('project.title')} />
			<TextField property='comment' label={t('projectMember.comment')} />
		</List>;
	}
}

export default ProjectMemberList;
