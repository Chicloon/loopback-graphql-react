/**
 * Renders full person name
 */
export const renderer = (record) =>
	record ? `${record.lastName || ''} ${record.firstName || ''} ${record.middleName || ''}` : ''
;
