import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import request from 'superagent';

@inject('recordData') @observer
export default class FileInput extends React.Component {

	@observable percent = null;
	@observable url = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.property = this.props.property;
		this.record = this.props.recordData.record;
		this.url = this.record [this.property] ? this.record.downloadFile (this.property) : null;
	}

	handleProgress (event) {
		this.percent = event.percent;
	}

	handleEnd (error, result) {
		if (error) {
			this.url = null;
		} else {
			this.url = this.record.downloadFile (this.property) + '?' + new Date().getTime();
		}
		this.percent = null;
	}

	handleChange (event) {
		let file = event.target.files.length ? event.target.files [0] : null;
		this.record [this.property] = file ? file.name : null;
		this.record.uploadFile (this.property, file)
			.on ('progress', (event) => this.handleProgress (event))
			.end ((error, result) => this.handleEnd (error, result));
	}

	render () {
		const value = this.record [this.property] || '';
		const percent = this.percent !== null ? ` (uploading: ${this.percent})` : '';
		return (
			<div className={'form-input ' + (this.props.className || '')}>
				<label>{this.props.label} : <a href={this.url}>{value}</a>{percent}</label>
				<input type="file" className="form-control" onChange={e => this.handleChange(e)} />
				{this.url && <img src={this.url}/>}
			</div>
		);
	}
}
