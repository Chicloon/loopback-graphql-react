import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	DateField,
	BooleanField,
	NumberField,
} from '../ui/List';

import t from '../../../i18n';

@inject('store', 'uiStore') @observer
class TaskList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' +
			(person.firstName ? person.firstName.charAt(0) + '.' : '') +
			(person.middleName ? person.middleName.charAt(0) + '.' : '');
	}

	boardList(boardList) {
		return boardList.name + ` [${boardList.project.name}]`;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.Task}
		             noCreate={true}
		             title={t('task.list')}
		             defaultSort={{ field: 'id', order: -1 }}
		             relationFilters={[
		             	{ relation: 'project', outProperty: 'name', label: t('project.title') },
		             	{ relation: 'boardList', outProperty: 'name', label: t('boardList.title') },
		             	{ relation: 'person', computed: this.fullName, label: t('person.title') },
		             ]}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} width='50px' className='left no-mobile' headerClass='left' />
			<TextField property='name' label={t('name')} />
			<TextField relation='project' property='name' label={t('project.title')} />
			<TextField nolink={true} relation='boardList' property='name' label={t('boardList.title')} />
			<TextField relation='person' computed={this.fullName} property='lastName' label={t('person.title')} />
			{/*<NumberField property='priority' label={t('priority')} width='130px' />*/}
			<BooleanField property='private' label={t('private')} width='130px' />
			<DateField property='startDate' label={t('startDate')} />
			<DateField property='dueDate' label={t('dueDate')} />
		</List>;
	}
}

export default TaskList;
