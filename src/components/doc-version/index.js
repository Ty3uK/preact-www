import { h } from 'preact';
import style from './style.less';
import { getCurrentUrl, route } from 'preact-router';
import { useStore } from '../store-adapter';
import config from '../../config.json';
import { getTranslate } from '../../lib/language';

function onChange(e) {
	const url = getCurrentUrl().replace(/(v\d{1,2})/, `v${e.target.value}`);
	route(url);
}

const AVAILABLE_DOCS = [10, 8];

/**
 * Select box to switch the currently displayed docs version
 */
export default function DocVersion() {
	const { docVersion, lang } = useStore(['docVersion', 'lang']).state;
	const versionText = getTranslate(config.sidebar.version, lang);
	const currentText = getTranslate(config.sidebar.current, lang);

	return (
		<label class={style.root}>
			{`${versionText}: `}
			<select value={docVersion} class={style.select} onChange={onChange}>
				{AVAILABLE_DOCS.map(v => {
					const suffix = v === 10 ? ` (${currentText})` : '';
					return (
						<option value={v}>
							{v}.x{suffix}
						</option>
					);
				})}
			</select>
		</label>
	);
}
