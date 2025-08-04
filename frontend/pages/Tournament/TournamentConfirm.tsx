// pages/Tornament/TournamenConfirm.tsx


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericButton } from '../../components/GenericButton';
import { UserProfileBadge } from '../../components/UserProfileBadge';
import { GenericInput } from '../../components/GenericInput';
import { isValidAlias } from '../../utils/Validation';

interface Player {
  id: number;
  avatarUrl?: string;
}

interface AliasField {
  value: string;
  error: string;
  touched: boolean;
}

const TournamentPlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const totalPlayers = 4;

  const initialFields: AliasField[] = Array.from({ length: totalPlayers }, (_, i) => ({
    value: `Player ${i + 1}`,
    error: '',
    touched: false,
  }));

  const [aliasFields, setAliasFields] = useState<AliasField[]>(initialFields);

  const handleAliasChange = (index: number, newValue: string) => {
    setAliasFields(prev => {
      const updated = [...prev];
      updated[index].value = newValue;
      updated[index].touched = true;

      const isValid = isValidAlias(newValue);
      updated[index].error = isValid ? '' : 'Invalid alias';
      return updated;
    });
  };

  const handleBlur = (index: number) => {
    setAliasFields(prev => {
      const updated = [...prev];
      updated[index].touched = true;

      const isValid = isValidAlias(updated[index].value);
      updated[index].error = isValid ? '' : 'Invalid alias';
      return updated;
    });
  };

  // Check for duplicates
  useEffect(() => {
    const lowerValues = aliasFields.map(f => f.value.trim().toLowerCase());
    const counts = lowerValues.reduce<Record<string, number>>((acc, alias) => {
      acc[alias] = (acc[alias] || 0) + 1;
      return acc;
    }, {});

    setAliasFields(prev =>
      prev.map((field, i) => {
        const alias = field.value.trim().toLowerCase();
        const hasDuplicate = alias && counts[alias] > 1;
        const error = field.touched
          ? (!isValidAlias(field.value)
              ? 'Invalid alias'
              : hasDuplicate
              ? 'Alias must be unique'
              : '')
          : '';
        return { ...field, error };
      })
    );
  }, [aliasFields.map(f => f.value).join('|')]);

  const formFilled =
    aliasFields.every(f => f.value.trim() !== '') &&
    aliasFields.every(f => f.error === '');

  return (
    <div className="flex flex-col items-center p-8 space-y-6">
      <h3 className="font-semibold text-center text-xl">Choose player aliases</h3>

      <div className="flex flex-col gap-4 mt-6 w-full max-w-xl">
        {aliasFields.map((field, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <UserProfileBadge user={{ id: idx + 1, avatarUrl: '' }} disabled />
            <GenericInput
              type="text"
              placeholder={`Player ${idx + 1}`}
              value={field.value}
              onFilled={(val: string) => handleAliasChange(idx, val)}
              onBlur={() => handleBlur(idx)}
              showEditIcon
              errorMessage={field.error}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <GenericButton
          className="generic-button"
          text="BACK"
          onClick={() => navigate('/tournaments/new')}
        />
        <GenericButton
          className="generic-button"
          text="START"
          disabled={!formFilled}
          onClick={() => navigate('/game')}
        />
      </div>
    </div>
  );
};

export default TournamentPlayersPage;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GenericButton } from '../../components/GenericButton';
// import { UserProfileBadge } from '../../components/UserProfileBadge';
// import { GenericInput } from '../../components/GenericInput';
// import { useValidationField } from '../../hooks/useValidationField';
// import { isValidAlias } from '../../utils/Validation';

// interface Player {
//   id: number;
//   avatarUrl?: string; // optional for badge
// }

// const TournamentPlayersPage: React.FC = () => {
//   const navigate = useNavigate();

//   // Hardcoded players list (replace with localStorage/backend later)
//   const totalPlayers = 4;
//   const playersMeta: Player[] = Array.from({ length: totalPlayers }, (_, i) => ({
//     id: i + 1,
//     avatarUrl: '', // use default or avatar string if available
//   }));

//   const [playerFields, setPlayerFields] = useState(
//     () =>
//       playersMeta.map((_, i) =>
//         useValidationField(`Player ${i + 1}`, isValidAlias)
//       ) // initialize with default values
//   );

//   // Check for duplicate aliases (case-insensitive)
//   const aliasList = playerFields.map((field) => field.value.trim().toLowerCase());
//   const hasDuplicate = aliasList.some(
//     (alias, idx) => aliasList.indexOf(alias) !== idx
//   );

//   // Update error state for duplicates
//   useEffect(() => {
//     if (!hasDuplicate) return;

//     const seen = new Map<string, number>();
//     aliasList.forEach((alias, idx) => {
//       if (seen.has(alias)) {
//         const first = seen.get(alias)!;
//         playerFields[first].setError('Alias must be unique');
//         playerFields[idx].setError('Alias must be unique');
//       } else {
//         seen.set(alias, idx);
//       }
//     });
//   }, [aliasList.join('|')]); // react to changes in alias values

//   const formFilled =
//     playerFields.every((field) => field.value.trim() !== '') &&
//     playerFields.every((field) => !field.error) &&
//     !hasDuplicate;

//   return (
//     <div className="flex flex-col items-center p-8 space-y-6">
//       <h3 className="font-semibold text-center text-xl">Choose player aliases</h3>

//       <div className="flex flex-col gap-4 mt-6 w-full max-w-xl">
//         {playerFields.map((field, idx) => (
//           <div key={playersMeta[idx].id} className="flex items-center gap-4">
//             <UserProfileBadge user={{ id: playersMeta[idx].id, avatarUrl: '' }} disabled />
//             <GenericInput
//               type="text"
//               placeholder={`Player ${idx + 1}`}
//               value={field.value}
//               onFilled={field.onFilled}
//               onBlur={field.onBlur}
//               showEditIcon={true}
//               errorMessage={field.error}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="flex flex-wrap justify-center gap-4 mt-8">
//         <GenericButton
//           className="generic-button"
//           text="BACK"
//           onClick={() => navigate('/tournaments/new')}
//         />
//         <GenericButton
//           className="generic-button"
//           text="START"
//           disabled={!formFilled}
//           onClick={() => navigate('/game')}
//         />
//       </div>
//     </div>
//   );
// };

// export default TournamentPlayersPage;
