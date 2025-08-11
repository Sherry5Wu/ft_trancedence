// pages/Rivals/RivalsMain.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalRows } from '../../components/RivalRows';
import { GenericInput } from '../../components/GenericInput';
import RivalIcon from '../../assets/noun-battle-7526810.svg?react';
import SearchIcon from '../../assets/noun-search-7526678.svg?react';

const RivalsPage = () => {
    const navigate = useNavigate();
  
    return (
      <div className='pageLayout'>

        <div className='flex justify-center items-center gap-3 mb-5'>
          <RivalIcon className='size-20' />
          <h2 className='h1 font-semibold text-center'>RIVALS</h2>
          <RivalIcon className='size-20' />
        </div>

        <div className='flex justify-start items-center'>
          <SearchIcon className='menuIcon' />
          <form className=''>
            <GenericInput placeholder='Search for new rivals' value='' className='h-8 w-56 bg-[#FFEE8C] rounded-full mb-3 border-2 border-transparent 
                              hover:border-black transition ease-in-out duration-300  hover:cursor-pointer'/>
          </form>
        </div>

        <RivalRows />

      </div>
    );
  };
  
  export default RivalsPage;
  