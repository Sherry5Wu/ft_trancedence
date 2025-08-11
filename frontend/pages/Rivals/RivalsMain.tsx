// pages/Rivals/RivalsMain.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalRows } from '../../components/RivalRows';
import { GenericInput } from '../../components/GenericInput';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidUsername } from '../../utils/Validation';
import RivalIcon from '../../assets/noun-battle-7526810.svg?react';
import SearchIcon from '../../assets/noun-search-7526678.svg?react';

const RivalsPage = () => {
    const navigate = useNavigate();
    const searchField = useValidationField('', isValidUsername);

    useEffect(() => {

    })
  
    return (
      <div className='pageLayout'>

        <div className='flex justify-center items-center gap-3 mb-5'>
          <RivalIcon className='size-20' />
          <h2 className='h1 font-semibold text-center'>RIVALS</h2>
          <RivalIcon className='size-20' />
        </div>

        <div className='min-w-100'>
          <div aria-label='rival search bar' className='flex justify-start items-center group -translate-x-12'>
            <SearchIcon className='size-12 translate-x-12 -translate-y-0.5 z-10 group-focus-within:opacity-50 transition ease-in-out duration-300'/>
            <div className=''>
                <GenericInput
                  type="username"
                  placeholder="Search for new rivals"
                  value={searchField.value}
                  onFilled={searchField.onFilled}
                  onBlur={searchField.onBlur}
                  // errorMessage={searchField.error}
                  className='h-10 w-64 pl-12 bg-[#FFEE8C] rounded-full mb-3 border-2 border-transparent 
                                hover:border-black transition-all ease-in-out duration-200 hover:cursor-pointer
                                focus:border-[#4682B4]'
          />
            </div>
          </div>

          <RivalRows />
        </div>

      </div>
    );
  };
  
  export default RivalsPage;
  