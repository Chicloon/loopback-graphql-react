import React from 'react';
import { observer, inject } from 'mobx-react';
import LabelRow from './LabelRow';
import t from '../../../i18n';

@inject('newStore') @observer
class Labels extends React.Component {

	constructor(props) {
		super(props);
		this.store = props.newStore.mainStore;
		this.getLabels();
		this.result = {
			res: null,
		};
		const filter = {
			include: [
				{
					relation: 'labels',
					scope: {
						fields: ['labelId'],
					},
				},
				{
					relation: 'person',
					scope: {
						fields: ['id'],
					}
				}
			],
		};
		fetch('/api/tasks/100?filter=' + encodeURI(JSON.stringify(filter)))
			.then(res => res.ok ? res.json() : Promise.reject(res.statusText))
			.then(json => this.gotRes(json))
			.catch(err => this.gotRes(err));
	}

	componentWillUpdate() {
		console.log('componentWillUpdate');
		this.getLabels();
	}

	gotRes(res) {
		console.log('res:', res);
		this.setState({
			res
		});
	}

	getLabels() {
		this.labels = this.store.isLoading ? [] :
			this.store.labels.values().sort((a, b) => b.priority - a.priority);
	}

	render() {
		if (this.store.isLoading) {
			return (
				<div>Store is loading...</div>
			);
		}

		return (
			<div>
				<h2>{t('labels')}</h2>
				<pre>{JSON.stringify(this.result.res, null, 4)}</pre>
				{this.labels.map((label, i) => <LabelRow key={i} label={label} />)}
			</div>
		)
	}

}

export default Labels;
