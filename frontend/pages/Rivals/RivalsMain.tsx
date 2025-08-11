// pages/Rivals/RivalsMain.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RivalRows } from '../../components/RivalRows';
import RivalIcon from '../../assets/noun-battle-7526810.svg?react';

const RivalsPage = () => {
    const navigate = useNavigate();
  
    return (
      <div className='pageLayout'>

        <div className='flex justify-center items-center gap-3 mb-5'>
          <RivalIcon className='size-20' />
          <h2 className='h1 font-semibold text-center'>RIVALS</h2>
          <RivalIcon className='size-20' />
        </div>

        <RivalRows />

      </div>
    );
  };
  
  export default RivalsPage;
  