import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import * as moment from 'moment';
import { RichText, Editor, PersonAvatar, IconLink, Button } from '../index';

import './style.scss';

import t from '../../../../i18n';

@inject('store', 'uiStore') @observer
class Comment extends React.PureComponent {

	@observable editing = false;

	constructor (props) {
		super(props);
		this.comment = this.props.comment;
		console.log('- comment:', this.comment);
		this.person = new props.store.Person({
			firstName: '' + this.comment.ownerId,
		});
	}

	get date () {
		return moment(this.comment.date).format('DD.MM.YY hh:mm');
	}

	edit (e) {
		if (e) e.preventDefault();
		this.editing = true;
	}

	delete (e) {
		if (e) e.preventDefault();
		if (confirm(t('delete') + '?')) {
			this.comment.delete().then(result => {
				console.log('delete comment:', result);
				if (this.props.onDelete) this.props.onDelete();
			});
		}
	}

	onChange (text) {
		this.comment.text = text;
		this.comment.save().then(result => {
			if (result.ok) {
				console.log('saved comment:', this.comment.id);
				this.closeEditor();
			}
		});
	}

	closeEditor () {
		this.editing = false;
	}

	render () {
		return <div className="comment">
			<div className="comment-title">
				<div className="comment-avatar">
					<PersonAvatar person={this.person}/>
				</div>
				<div className="comment-author">
					OwnerId: {this.comment.ownerId}
					<div className="comment-date">{this.date}</div>
				</div>
			</div>
			<div className="comment-content">
				{this.editing ?
					<Editor className="comment-body" autoFocus={true} value={this.comment.text} onChange={this.onChange.bind(this)}/>
					:
					<RichText className="comment-body" content={this.comment.text}/>
				}
				<div className="comment-actions">
					{this.editing ?
						<Button onClick={this.closeEditor.bind(this)} label={t('close')} icon="ok"/>
						:
						<a href="#" onClick={this.edit.bind(this)}>{t('edit')}</a>
					}
					<IconLink onClick={this.delete.bind(this)} icon="trash"/>
				</div>
			</div>
		</div>;
	}

}

Comment.propTypes = {
	comment: PropTypes.any,
	onDelete: PropTypes.func,
};

export default Comment;

