import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { PersonAvatar } from '../index';
import * as moment from 'moment';
import { Editor, Button } from '../index';
import Comment from './Comment';

import './style.scss';
import t from '../../../../i18n';

@inject('store', 'uiStore') @observer
class Comments extends React.Component {

	@observable text = '';
	@observable errors = null;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.record = this.props.record;
		this.timeOut = null;
		this.comments = this.record.comments();
		this.person = new props.store.Person({
			firstName: '' + this.store.user.id,
		});
	}

	onChange (text) {
		this.text = text;
	}

	onSubmit () {
		if (!this.text) {
			this.errors = 'Введите текст!';
			if (this.timeOut) clearTimeout(this.timeOut);
			this.errorNode.classList.remove('fading');
			this.timeOut = setTimeout(() => {
				requestAnimationFrame(() => {
					this.errorNode.classList.add('fading');
					this.timeOut = setTimeout(() => {
						this.errorNode.classList.remove('fading');
						this.errors = '';
					}, 1000);
				});
			}, 1000);
			return false;
		}
		this.save();
	}

	save () {
		const comment = new this.store.Comment({
			text: this.text,
			[this.props.foreignKey]: this.record.id,
			date: moment().toISOString(),
		});
		comment.save().then(result => {
			if (result.ok) {
				comment.id = result.data.id;
				this.comments.add(comment);
				this.text = '';
			}
		});
	}

	scrollToBottom (e) {
		if (e) e.preventDefault();
		const mainContent = document.getElementById('main-content');
		mainContent.scrollTop = 100000;
		this.editor.focus();
/*
		const editor = document.getElementsByClassName('DraftEditor-root')[0]
		console.log('editor:', editor);
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
			false, false, false, false, 0, null);		editor.dispatchEvent(focusEvent);
*/
	}

	onDelete () {
		this.comments.reload();
	}

	render () {
		return <div className="comments" ref={node => this.node = node}>
			<div className="comments-header">
				{this.props.title && <strong>{this.props.title}</strong>}
				<span className="count">({this.comments.list.length})</span>
				<a href="#" onClick={e => this.scrollToBottom(e)}>{t('comments.placeholder')}</a>
			</div>

			<div className="comments-list">
				{this.comments.list.map(comment =>
					<Comment key={comment.id}
					         comment={comment}
					         onDelete={this.onDelete.bind(this)}/>
				)}
			</div>
			<div className="new-comment">
				<div className="new-comment-author"><PersonAvatar person={this.person}/></div>
				<div className="new-comment-form">
					<Editor
						value={this.text}
						inputRef={node => this.editor = node}
						placeholder={t('comments.placeholder')}
						onChange={this.onChange.bind(this)}
						rows={5}/>
					<div className="submit">
						<Button label={t('comments.submit')} onClick={this.onSubmit.bind(this)}/>
						<span className="errors" ref={node => this.errorNode = node}>{this.errors}</span>
					</div>
				</div>
			</div>
		</div>;
	}

}

Comments.propTypes = {
	foreignKey: PropTypes.string.isRequired,
	record: PropTypes.any,
	title: PropTypes.string,
};

Comments.defaultProps = {
	title: t('comments.title'),
};

export default Comments;

