import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	FileInput,
} from '../ui/Form';
import t from '../../../i18n';

@inject('store') @observer
class PersonEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.Person} className="fixed-width" title={t('person.title')} {...this.props}>
				<TextInput property="lastName" label={t('lastName')}/>
				<TextInput property="firstName" label={t('firstName')}/>
				<TextInput property="middleName" label={t('middleName')}/>
				<TextInput rich={true} property="paymentInfo" label={t('paymentInfo')}/>
				<TextInput property="comment" label={t('comment')}/>
				<FileInput property="avatar" label={t('avatar')}/>
			</Form>
		);
	}
}

export default PersonEdit;
