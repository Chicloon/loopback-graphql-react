import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
} from '../ui/Form';
import t from '../../../i18n';

@inject('store') @observer
class ClientEdit extends React.PureComponent {

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
			<Form model={this.store.Client} className="fixed-width" title={t('client.title')} {...this.props}>
				<TextInput property="name" label={t('name')}/>
				<TextInput property="personName" label={t('personName')}/>
				<TextInput property="personRole" label={t('personRole')}/>
				<TextInput property="phone" label={t('phone')}/>
				<TextInput property="email" label={t('email.title')}/>
				<TextInput property="comment" label={t('comment')}/>
			</Form>
		);
	}
}

export default ClientEdit;
