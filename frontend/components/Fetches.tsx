import { MatchData } from "./MatchHistory";

export const postMatchData = async (accessToken: string) => {

    console.log(accessToken);
    const matchData: MatchData = 
        {
            player_name: 'User',
            player_username: 'user alias',
            played_at: new Date('2025-07-13 18:08').toLocaleString('en-GB'),
            duration: 300,
            player_score: 2,
            opponent_score: 5,
            opponent_id: '1',
            opponent_name: 'Rival1',
            opponent_username: "opponentusername",
            result: 'loss',
        }

    try {
        const response = await fetch(`https://localhost:8443/stats/match_history/`, {
        method: 'POST',
        headers: {
        "Authorization": `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        return await response.json();
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};

export const getMatchData = async (userID: string): Promise<MatchData | null> => {
    try {
        const response = await fetch(`https://localhost:8443/stats/match_history/${userID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        const matchData = await response.json();
        return matchData;
    }

    catch (error) {
        console.error('Error: ', error);
            return null;
    }
};

export const fetchUsers = async () => {
      const rivalData = ['B2', 'Coco', 'Winston', 'B3', 'Frank', 'Snickers', 'Rad', 'Bluey', 'Chili', 'Cornelius'];
      return rivalData.sort();
     
      try {
          const response = await fetch(`https://localhost:8443/stats/user_match_data`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
            const userDataArray = await response.json();
            const filteredUserDataArray = userDataArray.map((username: MatchData) => {
              return username.player_name;
            })
            return filteredUserDataArray.sort();
        }
      
      catch (error) {
        console.error('Error:', error);
        return null;
        }
    }