// pages/Rivals/Rivals.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalRows } from '../../components/RivalRows';
import { SearchBar } from '../../components/SearchBar';
import { useValidationField } from '../../utils/Hooks';
import { isValidUsername } from '../../utils/Validation';
import RivalIcon from '../../assets/noun-battle-7526810.svg?react';
import SearchIcon from '../../assets/noun-search-7526678.svg?react';
import { fetchRivalData } from '../../utils/Fetch';
import { useUserContext } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';

const RivalsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const searchField = useValidationField('', isValidUsername, t('common.errors.invalidUsername'));
    const { user } = useUserContext();
  
    return (
    	<div className='pageLayout'>
			<div className='flex justify-center items-center gap-3 mb-5'>
				<RivalIcon className='size-20' />
				<h2 className='h1 font-semibold text-center'>{t('pages.rival.title')}</h2>
				<RivalIcon className='size-20' />
			</div>
			<div className=''>
				<RivalRows />
			</div>
      </div>
    );
  };
  
  export default RivalsPage;
  