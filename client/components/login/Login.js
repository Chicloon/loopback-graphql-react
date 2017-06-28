/* eslint jsx-a11y/anchor-has-content: off */
import React, { Component, PropTypes } from 'react';
import { observer, inject } from 'mobx-react';
import t from '../../../i18n';

@inject('store') @observer
export default class Login extends Component {
	constructor (props) {
		super (props);
		this.store = props.store;
		console.log(this.store);
	}

	login () {
		this.store.login(this.email, this.password);
	}

	onChangeEmail (event) {
		this.email = event.target.value;
	}

	onChangePassword (event) {
		this.password = event.target.value;
	}

	render () {
		return (
			<div className="login-wrapper">
				<div className="login-header"><strong>SmartPlatform</strong>. {t('authorization')}</div>
				<div className="login-form">
					<p>
						<label>{t('email.field')}</label>
						<input className="form-control" name="email" onChange={event => this.onChangeEmail(event)}/>
					</p>
					<p>
						<label>{t('password.field')}</label>
						<input className="form-control" name="password" type="password" onChange={event => this.onChangePassword(event)}/>
					</p>
					<button className="btn btn-primary" onClick={event => this.login(event)}>{t('login')}</button>
				</div>
				{this.store.error && <div className='error'>{
						this.store.error.code ?
							t(this.store.error.code) :
							t(this.store.error.statusText)
					}</div>
				}
			</div>
		);
	}
}
