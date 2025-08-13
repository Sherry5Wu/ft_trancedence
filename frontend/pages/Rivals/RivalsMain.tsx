// pages/Rivals/RivalsMain.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalRows } from '../../components/RivalRows';
// import { GenericInput } from '../../components/GenericInput';
import { SearchBar } from '../../components/SearchBar';
import { useValidationField } from '../../hooks/useValidationField';
import { isValidUsername } from '../../utils/Validation';
import RivalIcon from '../../assets/noun-battle-7526810.svg?react';
import SearchIcon from '../../assets/noun-search-7526678.svg?react';

// export interface RivalData {
//   username: string;
//   profilePic?: string;
// }

const fetchRivalData = async () => {
  const rivalData = ['B2', 'Coco', 'Winston', 'B3', 'Frank', 'Snickers', 'Rad', 'Bluey', 'Chili', 'Cornelius'];
  return rivalData.sort();
}

const RivalsPage = () => {
    const navigate = useNavigate();
    const searchField = useValidationField('', isValidUsername);
    const [rivalData, setRivalData] = useState<string[]>([]);
    const [selected, setSelection] = useState('');

    useEffect(() => {
      const fetchRivals = async () => {
        console.log('fetching rival data');
        const data = await fetchRivalData();
        setRivalData(data);
      };
      fetchRivals();
    }, [searchField.value])
  
    return (
      <div className='pageLayout'>

        <div className='flex justify-center items-center gap-3 mb-5'>
          <RivalIcon className='size-20' />
          <h2 className='h1 font-semibold text-center'>RIVALS</h2>
          <RivalIcon className='size-20' />
        </div>

        <div className='min-w-150 relative'>
          <div aria-label='rival search bar' className='flex relative z-10 mb-3 justify-start items-center group -translate-x-10'>
            <SearchIcon className='size-10 translate-x-11 -translate-y-0.5 z-10 transition ease-in-out duration-30
                                  group-focus-within:opacity-50'/>
            <div className=''>
                <SearchBar
                  type="username"
                  placeholder="Search for new rivals"
                  value={searchField.value}
                  options={rivalData}
                  onFilled={searchField.onFilled}
                  onSelect={(selection) => navigate(`/user/${selection}`)}
                  className='h-10 w-55 pl-11 bg-[#FFEE8C] rounded-full mb-3 border-2 border-transparent transition-all ease-in-out duration-200 
                                hover:border-black focus:border-[#4682B4]'
                />
            </div>
          </div>

          <div className={`relative z-0 transition ease-in-out duration-100 ${searchField.value ? 'opacity-50' : 'opacity-100'}`}>
            <RivalRows />
          </div>

        </div>

      </div>
    );
  };
  
  export default RivalsPage;
  