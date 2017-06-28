import t from '../../../i18n';

const MODEL = [
	{ id: 'Project', name: t('acl.model.project'), },
	{ id: 'Person', name: t('acl.model.person'), },
	{ id: 'User', name: t('acl.model.user'), },
];
const ACCESS_TYPE = [
	{ id: 'READ', name: t('acl.read'), },
	{ id: 'WRITE', name: t('acl.write'), },
	{ id: 'EXECUTE', name: t('acl.execute'), },
	{ id: '*', name: t('acl.all'), },
];
const PRINCIPAL_TYPE = [
	{ id: 'APP', name: t('acl.app'), },
	{ id: 'ROLE', name: t('acl.role'), },
	{ id: 'USER', name: t('acl.user'), },
];
const PERMISSION = [
	{ id: 'ALLOW', name: t('acl.allow'), },
	{ id: 'DENY', name: t('acl.deny'), },
];

export default {
	MODEL,
	ACCESS_TYPE,
	PRINCIPAL_TYPE,
	PERMISSION,
};
