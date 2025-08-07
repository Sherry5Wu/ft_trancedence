          
const fetchRivalData = () => {
  const rivalData = [
    {
      name: 'Alice',
      score: 1920,
      winratio: 76,
      matches: 9,
      picture: '../assets/profilepics/B2.png'
    },
    {
      name: 'Charles',
      score: 816,
      winratio: 13,
      matches: 8,
      picture: '../assets/profilepics/image.jpg'
    },
    {
      name: 'David123',
      score: 640,
      winratio: 50,
      matches: 6,
      picture: '../assets/profilepics/Bandit.png'
    },
    {
      name: 'Eve',
      score: 2048,
      winratio: 100,
      matches: 4,
      picture: '../assets/profilepics/paddington-poster.jpg'
    }
  ]

  return rivalData;
}

          
export const RivalRows = () => {

    const rivalData = fetchRivalData();

    return (
        <div aria-label='rivals data' className=''>
            <div aria-label='rivals data categories' className='grid grid-cols-9 mb-1 text-center font-semibold'>
                <span className=''></span>
                <span className='col-span-2'>Name</span>
                <span className='col-span-2'>Score</span>
                <span className='col-span-2'>Win ratio</span>
                <span className='col-span-2'>Matches played against</span>
            </div>

            <ul>
            {rivalData.map((rival, index: number) => {
                return <li className='grid grid-cols-9 h-12 w-full mb-2 bg-[#FFEE8C] rounded-xl items-center text-center transition ease-in-out duration-300 hover:scale-105'>
                <img src={rival.picture} className='profilePicSmall'/>
                <span className='col-span-2'>{rival.name}</span>
                <span className='col-span-2'>{rival.score}</span>
                <span className={`col-span-2 ${rival.winratio >= 50 ? rival.winratio === 50 ? 'text-black' : 'text-[#2E6F40]' : 'text-[#CD1C18]'}`}>{rival.winratio}%</span>
                <span className='col-span-2'>{rival.matches}</span>
                </li>
            })
            }
            </ul>
        </div>
    )
}