import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { TextControl, TextareaControl, ToggleControl, Button } from '@wordpress/components';

/**
 * Generic repeater UI for a block attribute holding an array of row objects.
 * The block-editor equivalent of the `repeater` field type in
 * inc/options.php — same sub-field vocabulary (text/textarea/image), separate
 * implementation since one runs in wp-admin and the other inside the block
 * editor's React tree.
 *
 * Rows lay out inline by default (`layout: 'row'`): each sub-field takes an
 * equal-width slot, with compact move-up/move-down/remove icon buttons at
 * the row's end. Sub-field labels render once, as column headers above the
 * rows, rather than repeating per row — `hideLabelFromVision` keeps them
 * screen-reader accessible on each control without rendering visually
 * twice.
 *
 * `layout: 'column'` stacks each row's sub-fields vertically instead —
 * there's no shared column header in that layout (it wouldn't line up with
 * anything), so each sub-field's own label renders visibly above its
 * control instead of being screen-reader-only.
 *
 * @param {Object}   props
 * @param {string}   props.label    Field group label.
 * @param {Object[]} props.value    Current rows.
 * @param {Function} props.onChange ( rows ) => void
 * @param {Object[]} props.fields   [ { name, label, type: 'text'|'textarea'|'image'|'file'|'link', help, mimeTypes, linkTarget } ]
 *                                  `linkTarget` (link fields only) adds an "open in new tab" toggle,
 *                                  storing `{name}Target` on the row — same opt-in shape as the
 *                                  top-level `link` field type's `link_target` option.
 * @param {Object}   props.emptyRow Shape of a freshly-added row, e.g. { stat: '', title: '' }.
 * @param {string}   [props.layout] 'row' (default) or 'column'.
 */
export default function RepeaterField( { label, value, onChange, fields, emptyRow, layout = 'row' } ) {
	const isColumn = 'column' === layout;
	const rows = value || [];

	function updateRow( index, patch ) {
		const next = rows.slice();
		next[ index ] = { ...next[ index ], ...patch };
		onChange( next );
	}

	function addRow() {
		onChange( [ ...rows, { ...emptyRow } ] );
	}

	function removeRow( index ) {
		// eslint-disable-next-line no-alert -- a plain confirm() is enough
		// friction for an irreversible remove; no undo exists for this field.
		if ( ! window.confirm( __( 'Remove this row?', 'cb-js-skeleton2026' ) ) ) {
			return;
		}
		onChange( rows.filter( ( _row, i ) => i !== index ) );
	}

	function moveRow( index, direction ) {
		const target = index + direction;
		if ( target < 0 || target >= rows.length ) {
			return;
		}
		const next = rows.slice();
		const tmp = next[ index ];
		next[ index ] = next[ target ];
		next[ target ] = tmp;
		onChange( next );
	}

	return (
		<div
			className={
				isColumn
					? 'cb-js-skeleton-repeater-field cb-js-skeleton-repeater-field--column'
					: 'cb-js-skeleton-repeater-field'
			}
		>
			<label className="cb-js-skeleton-editor-field__label">{ label }</label>
			{ ! isColumn && rows.length > 0 && (
				<div className="cb-js-skeleton-repeater-field__header">
					<span className="cb-js-skeleton-repeater-field__number-spacer" />
					{ fields.map( ( field ) => (
						<span
							key={ field.name }
							className={
								'image' === field.type || 'file' === field.type
									? 'cb-js-skeleton-repeater-field__header-cell cb-js-skeleton-repeater-field__header-cell--image'
									: 'cb-js-skeleton-repeater-field__header-cell'
							}
						>
							{ field.label }
						</span>
					) ) }
					<span className="cb-js-skeleton-repeater-field__row-actions-spacer" />
				</div>
			) }
			<div className="cb-js-skeleton-repeater-field__rows">
			{ rows.map( ( row, index ) => (
				<div className="cb-js-skeleton-repeater-field__row" key={ index }>
					<span className="cb-js-skeleton-repeater-field__number">{ index + 1 }</span>
					{ fields.map( ( field ) => {
						if ( 'image' === field.type ) {
							return (
								<MediaUploadCheck key={ field.name }>
									<MediaUpload
										onSelect={ ( media ) =>
											updateRow( index, {
												[ field.name ]: media.id,
												[ `${ field.name }Url` ]: media.url,
											} )
										}
										allowedTypes={ [ 'image' ] }
										value={ row[ field.name ] }
										render={ ( { open } ) => (
											<div className="cb-js-skeleton-repeater-field__image">
												{ row[ `${ field.name }Url` ] && (
													<img src={ row[ `${ field.name }Url` ] } alt="" />
												) }
												<Button variant="secondary" size="small" onClick={ open }>
													{ row[ field.name ]
														? __( 'Replace', 'cb-js-skeleton2026' )
														: __( 'Select', 'cb-js-skeleton2026' ) }
												</Button>
											</div>
										) }
									/>
								</MediaUploadCheck>
							);
						}

						if ( 'link' === field.type ) {
							return (
								<div className="cb-js-skeleton-repeater-field__link" key={ field.name }>
									<TextControl
										label={ __( `${ field.label } Title`, 'cb-js-skeleton2026' ) }
										hideLabelFromVision={ ! isColumn }
										value={ row[ `${ field.name }Text` ] || '' }
										onChange={ ( v ) => updateRow( index, { [ `${ field.name }Text` ]: v } ) }
									/>
									<TextControl
										type="url"
										label={ __( `${ field.label } URL`, 'cb-js-skeleton2026' ) }
										hideLabelFromVision={ ! isColumn }
										value={ row[ field.name ] || '' }
										onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
										help={ field.help }
									/>
									{ field.linkTarget && (
										<ToggleControl
											label={ __( `Open ${ field.label } in a new tab`, 'cb-js-skeleton2026' ) }
											checked={ !! row[ `${ field.name }Target` ] }
											onChange={ ( v ) => updateRow( index, { [ `${ field.name }Target` ]: v } ) }
										/>
									) }
								</div>
							);
						}

						if ( 'file' === field.type ) {
							return (
								<MediaUploadCheck key={ field.name }>
									<MediaUpload
										onSelect={ ( media ) =>
											updateRow( index, {
												[ field.name ]: media.id,
												[ `${ field.name }Name` ]: media.filename || media.title || '',
											} )
										}
										allowedTypes={ field.mimeTypes || [] }
										value={ row[ field.name ] }
										render={ ( { open } ) => (
											<div className="cb-js-skeleton-repeater-field__image">
												{ row[ `${ field.name }Name` ] && (
													<span className="cb-js-skeleton-repeater-field__file-name">
														{ row[ `${ field.name }Name` ] }
													</span>
												) }
												<Button variant="secondary" size="small" onClick={ open }>
													{ row[ field.name ]
														? __( 'Replace', 'cb-js-skeleton2026' )
														: __( 'Select', 'cb-js-skeleton2026' ) }
												</Button>
											</div>
										) }
									/>
								</MediaUploadCheck>
							);
						}

						if ( 'textarea' === field.type ) {
							return (
								<TextareaControl
									key={ field.name }
									label={ field.label }
									hideLabelFromVision={ ! isColumn }
									value={ row[ field.name ] || '' }
									onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
									help={ field.help }
								/>
							);
						}

						return (
							<TextControl
								key={ field.name }
								label={ field.label }
								hideLabelFromVision={ ! isColumn }
								value={ row[ field.name ] || '' }
								onChange={ ( v ) => updateRow( index, { [ field.name ]: v } ) }
								help={ field.help }
							/>
						);
					} ) }
					<div className="cb-js-skeleton-repeater-field__row-actions">
						<Button
							size="small"
							label={ __( 'Move up', 'cb-js-skeleton2026' ) }
							onClick={ () => moveRow( index, -1 ) }
							disabled={ 0 === index }
						>
							&#9650;
						</Button>
						<Button
							size="small"
							label={ __( 'Move down', 'cb-js-skeleton2026' ) }
							onClick={ () => moveRow( index, 1 ) }
							disabled={ index === rows.length - 1 }
						>
							&#9660;
						</Button>
						<Button
							size="small"
							isDestructive
							label={ __( 'Remove', 'cb-js-skeleton2026' ) }
							onClick={ () => removeRow( index ) }
						>
							&times;
						</Button>
					</div>
				</div>
			) ) }
			</div>
			<Button variant="primary" onClick={ addRow }>
				{ __( 'Add row', 'cb-js-skeleton2026' ) }
			</Button>
		</div>
	);
}
