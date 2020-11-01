import dayjs, { Dayjs } from 'dayjs';
import UTC from 'dayjs/plugin/utc';

dayjs.extend(UTC);

export const formatIsoDateTime = (isoDateString: string) => dayjs(isoDateString).format('MMMM D, YYYY @ HH:mm:ss');

export const formatLocalDateTime = (localDateTime: Dayjs) => localDateTime.format('YYYY-MM-DDTHH:mm');