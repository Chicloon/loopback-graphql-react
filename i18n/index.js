import i18next from 'i18next';

import en from './en';
import ru from './ru';

i18next.init ({
	lng: 'ru',
	resources: {
		en,
		ru
	},
});

export default key => i18next.t(key);
