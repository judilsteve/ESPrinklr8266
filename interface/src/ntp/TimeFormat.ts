import dayjs, { Dayjs } from 'dayjs';
import UTC from 'dayjs/plugin/utc';

dayjs.extend(UTC);

export const formatIsoDateTime = (isoDateString: string) => dayjs(isoDateString).local().format('ll @ HH:mm:ss');

export const formatLocalDateTime = (localDateTime: Dayjs) => localDateTime.format('YYYY-MM-DDTHH:mm');