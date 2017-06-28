/**
 * Скрипт генерации поле для Edit/Create/List компонентов admin-on-rest
 * Используется для быстрого добавление новым моделей в интерфейс админки
 */

// Название модели для которой генерить поля
const modelName = 'project';

const model = require ('../common/models/' + modelName + '.json');
const modelReferenceMap = {
	boardlist: 'board-list',
	tasklabel: 'task-label',
};
const modelLangMap = {
	boardlist: 'boardList',
	taskLabel: 'taskLabel',
};

const modelReference = (modelName) => {
	return modelReferenceMap [modelName] || modelName;
};

const modelLang = (modelName) => {
	return modelLangMap [modelName] || modelName;
};

console.log (`Model '${modelName}'...`);

console.log ('Inputs...');
for (let propertyName in model.properties) {
	let property = model.properties [propertyName];

	// generate inputs
	if (property.type == 'string') {
		console.log (`<TextInput source='${propertyName}' label={t('${propertyName}')} elStyle={{width: '100%'}}/>`);
	} else if (property.type == 'Number') {
		console.log (`<TextInput source='${propertyName}' label={t('${propertyName}')} type='number'/>`);
	} else if (property.type == 'Boolean') {
		console.log (`<BooleanInput source='${propertyName}' label={t('${propertyName}')} />`);
	} else if (property.type == 'Date') {
		console.log (`<DateInput source='${propertyName}' label={t('${propertyName}')} />`);
	};

};

console.log ('Reference inputs...');
for (let relationName in model.relations) {
	let relation = model.relations [relationName];

	// generate reference inputs
	if (relation.type == 'belongsTo') {
		console.log (`<ReferenceInput label={t('${modelLang(relation.model)}.title')} source='${relation.foreignKey}' reference='${relation.model}s' allowEmpty>
	<AutocompleteInput elStyle={{width: '100%'}} />
</ReferenceInput>`);
	};

};

console.log ('Fields...');
for (let propertyName in model.properties) {
	let property = model.properties [propertyName];

	// generate fields
	if (property.type == 'string') {
		console.log (`<TextField source='${propertyName}' label={t('${propertyName}')} />`);
	} else if (property.type == 'Number') {
		console.log (`<NumberField source='${propertyName}' label={t('${propertyName}')} />`);
	} else if (property.type == 'Boolean') {
		console.log (`<BooleanField source='${propertyName}' label={t('${propertyName}')} />`);
	} else if (property.type == 'Date') {
		console.log (`<DateField source='${propertyName}' label={t('${propertyName}')} />`);
	};

};

console.log ('Reference fields...');
for (let relationName in model.relations) {
	let relation = model.relations [relationName];

	// generate reference inputs
	if (relation.type == 'belongsTo') {
		console.log (`<ReferenceField label={t ('${modelLang(relation.model)}.title')} source='${relation.foreignKey}' reference='${relation.model}s' allowEmpty>
	<TextField source='name' />
</ReferenceField>`);
	};

};
