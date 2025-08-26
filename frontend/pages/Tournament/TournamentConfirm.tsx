// /src/pages/Tornament/TournamenConfirm.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessiblePageDescription } from '../../components/AccessiblePageDescription';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { GenericInput } from '../../components/GenericInput';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { isValidAlias } from '../../utils/Validation';
import { usePlayersContext } from '../../context/PlayersContext';
import { AliasField } from '../../utils/Interfaces';

const TournamentConfirm: React.FC = () => {
	const { t } = useTranslation();  
	const navigate = useNavigate();
	const {
		players,
		totalPlayers,
		setPlayerUsername,
	} = usePlayersContext();

  const [aliasFields, setAliasFields] = useState<AliasField[]>([]);

  // 1. Sync players into alias fields on mount
  // Initialize alias fields from players
	useEffect(() => {
		const fields = Array.from({ length: totalPlayers ?? 0 }, (_, i) => {
		const player = players[i];
		const name = player?.username || `Player ${i + 1}`;
		return {
			value: name,
			error: '',
			touched: false,
		};
		});

		setAliasFields(fields);
	}, [players, totalPlayers]);

  	// 2. AFTER aliasFields is initialized, sync back valid usernames to context
	useEffect(() => {
		aliasFields.forEach((field, idx) => {
		const player = players[idx];
		if (
			player &&
			field.value &&
			field.error === '' &&
			player.username !== field.value
		) {
			setPlayerUsername(player.id, field.value);
		}
		});
	}, [aliasFields, players, setPlayerUsername]);

	const validateAlias = (value: string, index: number, allAliases: string[]): string => {
		const trimmed = value.trim();
		if (!isValidAlias(trimmed)) return t('common.errors.invalidAlias');

		const lowerValue = trimmed.toLowerCase();
		const occurrences = allAliases.filter(
		(v, i) => i !== index && v.trim().toLowerCase() === lowerValue
		);

		if (occurrences.length > 0) return t('common.errors.duplicateAlias');
		
		return '';
	};

	const handleAliasChange = (index: number, newValue: string) => {
		setAliasFields((prev) => {
			const updated = [...prev];
			updated[index].value = newValue;
			updated[index].touched = true;

			const allAliases = updated.map((f) => f.value);
			updated[index].error = validateAlias(newValue, index, allAliases);

			return updated;
		});
	};

	const handleBlur = (index: number) => {
		setAliasFields((prev) => {
			const updated = [...prev];
			updated[index].touched = true;

			const allAliases = updated.map((f) => f.value);
			updated[index].error = validateAlias(updated[index].value, index, allAliases);
			
			return updated;
		});
	};

	const formFilled =
		aliasFields.every((f) => f.value.trim() !== '') &&
		aliasFields.every((f) => f.error === '');

  return (
		<main
			className="pageLayout"
			role="main"
			aria-labelledby="pageTitle"
			aria-describedby="pageDescription"
		>
		<AccessiblePageDescription
			id="pageDescription"
			text={t('pages.tournament.confirm.aria.description')}
		/>

		<h1 id="pageTitle" className="font-semibold text-center text-xl translate-x-4">
			{t('pages.tournament.confirm.title')}
		</h1>

		<section
			className="flex flex-col gap-4 mt-6 justify-center"
			aria-label={t('pages.tournament.confirm.aria.aliasesSection')}
		>
			{aliasFields.map((field, idx) => {
				const player = players[idx] ?? null;
				return (
					<div key={idx} className="flex items-center gap-4">
					<UserProfileBadge 
						size="sm"
						user={player}
						disabled 
					/>
					<GenericInput
						id={`player-alias-${idx}`}
						type="text"
						placeholder={t('tournament.confirm.defaultPlayer', { number: idx + 1 })}
						value={field.value}
						onFilled={(val) => handleAliasChange(idx, val)}
						onBlur={() => handleBlur(idx)}
						showEditIcon
						errorMessage={field.error}
						aria-describedby={`player-alias-${idx}-error`}
						aria-label={t('pages.tournament.confirm.aria.aliasInput', { index: idx + 1 })}
						/>
					</div>
				);
			})}
		</section>

		<div className="flex flex-wrap justify-center gap-4 mt-8">
			<GenericButton
				className="generic-button"
				text={t('common.buttons.back')}
				aria-label={t('common.aria.buttons.back')}
				onClick={() => navigate('/tournaments/new')}
			/>
			<GenericButton
				className="generic-button"
				text={t('common.buttons.start')}
				aria-label={t('common.aria.buttons.start')}
				disabled={!formFilled}
				onClick={() => navigate('/game')}
			/>
		</div>
		</main>
	);
};

export default TournamentConfirm;