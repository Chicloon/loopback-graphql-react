import { computed, observable, action } from 'mobx';
import request from 'superagent';

const debug = require ('debug')('smartplatform:loopback');

class Loopback {
	url;
	cache = {};
	headers = {
		'Content-Type': 'application/json'
	};
	credentials = 'same-origin';
	error;

	@observable pendingRequestCount = 0;

	constructor (url = '/api') {
		this.url = url;
	}

	@action fetch ({model, method, path = '', filter, data}) {
		let url, headers, body, credentials;

		url = `${this.url}/${model}${path}${filter ? '/?filter=' + encodeURI(JSON.stringify(filter)) : ''}`;
		headers = this.headers;
		body = data ? JSON.stringify (data) : undefined;
		credentials = this.credentials;

		this.pendingRequestCount ++;

		return fetch (url, { method, headers, body, credentials })
			.then (response => {
				return response.json ()
					.then (json => {
						// Если ответ в json занчит имеем правильный ответ от сервера
						if (response.ok) { // без ошибок
							response.data = json;
							response.totalCount = parseInt (response.headers.get ('x-total-count')) || undefined;
							return response;
						} else { // пришла ошибка
							delete json.error.status;
							Object.assign (response, json.error);
							return Promise.reject (response);
						}
					})
					.catch (error => {
						// Если ответ не в json значит либо нет интернета либо сервер упал или не работает
						if (response.ok) {
							return response;
						} else {
							debug ('%c response:json', 'color: red', error, response);
							throw response;
						};
					});
			})
			.then (response => {
				this.error = null;
				this.pendingRequestCount --;
				return response;
			})
			.catch (error => {
				this.error = error;
				debug ('%c response:catch', 'color: red', error);
				throw error;
			}
		);
	}

	@action create (model, data) {
	}

	get (model, filter, modelObject, fromModel, relation, object) {
		let path = relation ? `/${modelObject.id}/${relation}` : '';
		return this.fetch ({model: fromModel || model, method: 'GET', filter, path});
	}

	getById (model, id, include) {
		return this.fetch ({model, method: 'GET', path: `/${id}`, filter: {include}});
	}

	put (model, data, fromModel, relation, object) {
		let path = data.id ? `/${data.id}${relation ? `/${relation}/rel/${object.id}` : ''}` : '';
		return this.fetch ({model: fromModel || model, method: 'PUT', path, data: relation ? undefined : data});
	}

	delete (model, id, fromModel, relation, object) {
		let path = `/${id}${relation ? `/${relation}/rel/${object.id}` : ''}`;
		return this.fetch ({model: fromModel || model, method: 'DELETE', path});
	}

	uploadFile (model, id, property, file) {
		let url = `${this.url}/containers/${model}/upload`;
		return request.post (url).attach (property, file, `${id}-${property}`);
	}

	downloadFile (model, id, property) {
		return `${this.url}/containers/${model}/download/${id}-${property}`;
	}

	deleteFile (model, id, property) {
		return request.del (`${this.url}/containers/${model}/files/${id}-${property}`);
	}

	@computed get isLoading () {
        return this.pendingRequestCount > 0;
    }
}

export default new Loopback ();