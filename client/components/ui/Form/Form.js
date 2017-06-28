import React from 'react';
import PropTypes from 'prop-types';
import { observable, action } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import './style.scss';
import IconLink from '../IconLink';
import Model from '../../../store/Model';
import t from '../../../../i18n';

const inputs = {
	Row: true,
	TextInput: true,
	NumberInput: true,
	DateInput: true,
	BooleanInput: true,
	ModelInput: true,
	SelectInput: true,
	RelationInput: true,
	FileInput: true,
};

const fields = {
	TextField: true,
	NumberField: true,
	DateField: true,
	BooleanField: true,
	InlineModelField: true,
	InlineRelationField: true,
};

const isValidComponent = type => type && (inputs[type] || fields[type]);
const isInputComponent = type => type && inputs[type];

@inject('store', 'uiStore') @observer
class Form extends React.Component {

	@observable isSaving = false;
	@observable error = null;

	constructor (props) {
		super(props);
		this.props = props;
		this.store = props.store;
		this.fields = [];
		this.id = props.match.params.id;

		if (this.props.record) {
			this.record = this.props.record;
		}
		else if (this.id) {
			this.record = this.store.getById(this.props.model, this.id, null, this.props.include);
		}
		else {
			this.record = new this.props.model();
		}

		this.recordData = {
			record: this.record,
			model: this.props.model,
			form: true,
			history: this.props.history,
		};
		this.parseFields(this.props.children);

		if (props.title && props.setTitle !== false) props.uiStore.setBar(<h1>{this.props.title}</h1>);
	}

	save (e) {
		e.preventDefault();
		this.isSaving = true;

		console.log('save:', this.fields);
		const values = this.fields.map(field => {
			let key = field.props.property;
			if (field.props.relation) {
				key = this.props.model.RELATIONS[field.props.relation].foreignKey;
			}
			console.log('-', key, ':', this.record[key]);
			return this.record[key];
		});

		if (values.every(value => value === undefined || value === null)) {
		// if (values.every(value => !value)) {
			alert('Введите хоть что-то!');
			console.log('values:', values);
		}
		else {
			this.record.save().then(result => {
				if (result.ok) {
					if (this.props.onSave) this.props.onSave(this.record);
					this.back();
				}
				else {
					this.isSaving = false;
					this.error = result.statusText;
				}
			});
		}

	}

	back (e) {
		if (e) e.preventDefault();
		if (this.props.returnTo) {
			this.props.history.push('/' + this.props.returnTo);
		}
		else {
			console.log('this.props.history:', this.props.history);
			this.props.history.goBack();
		}
	}

	confirmDelete (e) {
		e.preventDefault();
		if (confirm('Delete?')) {
			this.delete();
		}
	}

	delete () {
		this.isSaving = true;
		this.record.delete().then(result => {
			if (result.ok) {
				if (this.props.onDelete) this.props.onDelete(this.record);
				this.back();
			}
			else {
				this.isSaving = false;
				this.error = result.statusText;
			}
		});
	}

	parseFields (children) {
		React.Children.forEach(children, (field, i) => {
			// console.log('parseFields:', field.props);
			if (field && field.props && field.props.children) {
				this.parseFields(field.props.children);
			}
			else if (field && field.type && field.type.wrappedComponent && isInputComponent(field.type.wrappedComponent.name)) {
				// console.log('+ field:', field.type.wrappedComponent.name);
				this.fields.push(field);
			}
		});
	}

	render () {
		if (!this.id && this.props.noCreate) {
			return <div className="error">{t('noCreate')}</div>;
		}

		return <form className={"data-form " + (this.props.className || '')}>
			<Provider recordData={this.recordData}>
				<div>
					{this.props.children}
				</div>
			</Provider>
			<div className="form-submit">
				<a className="btn btn-lg btn-primary" href="#" onClick={e => this.save(e)}>{t('save')}</a>
				{this.props.controls}
				{
					this.props.match.params.id &&
						<IconLink href="#" icon="trash" style={{ color: '#000', marginLeft: 20, fontSize: 20 }} onClick={e => this.confirmDelete(e)}/>
				}
			</div>
		</form>;
	}

}

Form.propTypes = {
	model: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.instanceOf(Model),
	]).isRequired,
	recordRef: PropTypes.func,
	controls: PropTypes.any,
	onSave: PropTypes.func,
	onDelete: PropTypes.func,
	noCreate: PropTypes.bool,
	title: PropTypes.any,
	setTitle: PropTypes.bool,
	emptyField: PropTypes.string,
	className: PropTypes.string,
	returnTo: PropTypes.string,
};

Form.defaultProps = {};

export default Form;
