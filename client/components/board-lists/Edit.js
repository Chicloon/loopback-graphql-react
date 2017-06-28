import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	NumberInput,
	ColorInput,
	RelationInput,
} from '../ui/Form';

import { Field } from '../ui/List';

import t from '../../../i18n';

@inject('store') @observer
class BoardListEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '');
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.BoardList} className="fixed-width" title={t('boardList.title')} {...this.props}>
				<TextInput property="name" label={t('name')}/>
				<TextInput rows={7} rich={true} placeholder="Описание списка" property="description" label={t('description')}/>
				<Field relation="project" property="name" label={t('project.title')}/>
				<ColorInput property="color" label={t('color')}/>
				{/*<NumberInput property="priority" label={t('priority')}/>*/}
				<RelationInput relation="person" computed={this.fullName} property="lastName" label={t('person.title')}/>
			</Form>
		);
	}
}

export default BoardListEdit;
