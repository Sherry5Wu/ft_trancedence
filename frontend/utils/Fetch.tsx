import {
	MatchData,
	ScoreHistory,
	UserStats,
	UserProfileData,
	LoginData,
	RivalData,
	FetchedUserData,
	UserGoogleProfileData,
	GoogleCompleteResponse,
	VerifyPinResponse,
	RegisteredPlayerData,
	Players,
	ProfileMeResponse,
	} from "../utils/Interfaces";

export const createUser = async (player: UserProfileData): Promise<UserProfileData | null> => {
	// console.log('Sending user:', player);
	try {
		const response = await fetch('https://localhost:8443/as/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
		},
			body: JSON.stringify(player)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		return await response.json();
	}

	catch (error) {
		console.error('Error:', error);
		return null;
	}
};

export const createUserFromGoogle = async (player: UserGoogleProfileData): Promise<GoogleCompleteResponse | null> => {
  try {
    const response = await fetch("https://localhost:8443/as/auth/google-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(player),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user from Google:", error);
    return null;
  }
};

export const signInUser = async (player: LoginData) => {
	try {
		// fetch for user data
		const response = await fetch('https://localhost:8443/as/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(player)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		// 1: Wrong password
		if (data.code === 'PASSWORD_NOT_MATCH') {
			return { type: 'PASSWORD_NOT_MATCH' };
		}

		// 2: 2FA required
		if (data.code === 'PASSWORD_MATCH_2FA-ENABLE') {
			return {
				type: '2FA_REQUIRED',
				userId: data.userId,
			};
		}

		// 3: Password matched + 2FA disabled
		if (data.code === 'PASSWORD_MATCH_2FA_DISABLE') {
		// fetch for user stats
		const statResponse = await fetch (`https://localhost:8443/stats/user_match_data/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!statResponse.ok) {
		throw new Error(`HTTP error! Status: ${statResponse.status}`);
		}

		const stats = await statResponse.json();

		// fetch for user rivals
		const rivalResponse = await fetch (`https://localhost:8443/stats/rivals/${data.user.id}`, {
			method: 'GET',
			headers: {
			'Content-Type': 'application/json',
			},
		});

		if (!rivalResponse.ok) {
			throw new Error(`HTTP error! Status: ${rivalResponse.status}`);
		}

		const rivals = await rivalResponse.json();

		return {
			type: 'LOGIN_SUCCESS',
			data,
			stats,
			rivals,
		};
	}

		return { type: 'UNKNOWN' };

	} catch (error) {
		console.error('Error:', error);
		return { type: 'ERROR' };
	}
};

export const signInGoogleUser = async (idToken: string) => {
  try {
    const response = await fetch("https://localhost:8443/as/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // 1: Profile incomplete
    if (data.needCompleteProfile) {
      return { type: "NEED_COMPLETE_PROFILE", idToken };
    }

    // 2: 2FA required
    if (data.TwoFA === true && data.code === "TWOFA_ENABLE") {
      return { type: "TWOFA_REQUIRED", userId: data.userId };
    }

    // 3: Normal login flow
    if (data.success && data.code === "TWOFA_DISABLE") {
      const statResponse = await fetch("https://localhost:8443/stats/user_match_data/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const stats = await statResponse.json();

      const rivalResponse = await fetch(`https://localhost:8443/stats/rivals/${data.user.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const rivals = await rivalResponse.json();

      return { type: "SUCCESS", data, stats, rivals };
    }

    return { type: "UNKNOWN" };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return { type: "ERROR" };
  }
};

export const updateProfilePic = async (file: File, token: string | null) => {
	if (!token)
		return ;

	try {
		const formData = new FormData();
		formData.append('avatar', file);

		const response = await fetch('https://localhost:8443/as/users/me/upload-avatar', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
			body: formData,
		})

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();
		return data.avatarUrl;
	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchRivalData = async (username: string) => {
	try {
		const rivals = await fetch(`https://localhost:8443/stats/rivals/username/${username}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			});

		if (!rivals.ok) {
			throw new Error(`HTTP error! Status: ${rivals.status}`);
		}

		const data: RivalData[] = await rivals.json();
		console.log('RIVALSDATA: ')
		console.log(data);

		return data;
	}

	catch (error) {
		console.error('Error:', error);
		return [];
  }
};

export const addRival = async (rivalName: string, token: string | null) => {
	if (!token)
		return ;

	const data = {
		rival_username: rivalName
	};

	try {
		const response = await fetch(`https://localhost:8443/stats/rivals`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const responseData = await response.json();
		return responseData;

	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const removeRival = async (rivalName: string, token: string | null) => {
	if (!token)
		return ;

	try {
		const response = await fetch(`https://localhost:8443/stats/rivals/username/${rivalName}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		return response.json();
	}
	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchScoreHistory = async (username: string): Promise<ScoreHistory[] | null>  => {
	try {
		const response = await fetch(`https://localhost:8443/stats/score_history/username/${username}`, {
			method: 'GET'
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();

		const filteredData: ScoreHistory[] = data.map((item: ScoreHistory) => ({
			id: item.id,
			elo_score: item.elo_score,
		}));
		// console.log('from fetchScoreHistory ');
		// console.log(filteredData);
		return filteredData;
	}

	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchUserStats = async (username: string): Promise<UserStats | null> => {
	try {
		const response = await fetch(`https://localhost:8443/stats/user_match_data/username/${username}`, {
		    method: 'GET'
		});

		if (!response.ok)
			throw new Error(`HTTP error! Status: ${response.status}`);

		const userStats: UserStats = await response.json();
		console.log('FETCH USER STATS: '); //REMOVE LATER
		console.log(userStats); //REMOVE LATER
		return userStats;
	}

	catch (error) {
		console.error('Error: ', error);
		return null;
	}
};

export const fetchMatchData = async (username: string): Promise<MatchData [] | null> => {
    try {
        const response = await fetch(`https://localhost:8443/stats/match_history/username/${username}`, {
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

export const fetchUsers = async (token: string | null) => {
	if (!token)
		return ;

	try {
		const response = await fetch(`https://localhost:8443/as/users/all`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				"Authorization": `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const userDataArray = await response.json();
		return userDataArray.users.sort((a: any, b: any) => {
			a.username.localeCompare(b.username);
		}) ;
	}

	catch (error) {
		console.error('Error:', error);
		return [];
	}
};

export const verify2FA = async (tokenCode: string, accessToken: string) => {
  try {
    const response = await fetch("https://localhost:8443/as/2fa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: tokenCode }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return { verified: false, ...errorBody };
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return { verified: false };
  }
};


// confirm the 6-digit code for setup 2fa
export const confirm2FA = async (tokenCode: string, accessToken: string) => {
  try {
    const response = await fetch("https://localhost:8443/as/2fa/confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token: tokenCode }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return { verified: false, ...errorBody };
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return { verified: false };
  }
};

// /2fa/verification/:userid
// verify the 6-digit code after sign in, if 2fa is enable
export const verifyCode2FA = async (userId: string, token: string) => {
  try {
    const response = await fetch(`https://localhost:8443/as/2fa/verification/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        return { type: 'INVALID_CODE' };
      }
      if (response.status === 401) {
        return { type: 'UNAUTHORIZED' };
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.code === '2FA_MATCH') {
      return { type: 'SUCCESS', data };
    }

    return { type: 'UNKNOWN' };
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return { type: 'ERROR' };
  }
};

export const disable2FA = async (accessToken: string | null): Promise<boolean> => {
  if (!accessToken) return false;

  try {
    const res = await fetch(`https://localhost:8443/as/2fa/disable`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return res.status === 204;
  } catch (err) {
    console.error('Error disabling 2FA:', err);
    return false;
  }
};

export const verifyBackupCode = async (backupCode: string, accessToken: string) => {
  try {
    const response = await fetch("https://localhost:8443/as/2fa/backup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code: backupCode }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return { used: false, ...errorBody };
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    return { used: false };
  }
};

export const updateUserPin = async (
  oldPinCode: string,
  newPinCode: string,
  accessToken: string
): Promise<boolean> => {
  try {
    const response = await fetch("https://localhost:8443/as/users/me/update-pincode", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ oldPinCode, newPinCode }),
    });

    if (response.status === 204) {
      return true;
    }

    if (response.status === 200) {
      const body = await response.json();
      if (body.success) return true;
      throw new Error(body.message || "Failed to update PIN");
    }

    // If backend returns 400/401, throw so caller can handle
    const errorBody = await response.json();
    throw new Error(errorBody?.message || `HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error("Error updating PIN:", error);
    return false;
  }
};

export const updateUserPassword = async (
  oldPassword: string,
  newPassword: string,
  accessToken: string
): Promise<boolean> => {
  try {
    const response = await fetch("https://localhost:8443/as/users/me/update-password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (response.status === 204) {
      return true;
    }

	if (response.status === 200) {
      const body = await response.json();
      if (body.success) return true;
      throw new Error(body.message || "Failed to update password");
    }

    // If backend sends 400/401/404 with JSON body
    const errorBody = await response.json();
    throw new Error(errorBody?.message || `HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error("Error updating password:", error);
    return false;
  }
};

export const loginRegisteredPlayer = async ( player: RegisteredPlayerData ): Promise<VerifyPinResponse> => {
  try {
    const response = await fetch("https://localhost:8443/as/users/verify-pincode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(player),
    });

    // Handles 404 (User not found) or 429 (Too many attempts) from backend
    if (!response.ok) {
      const errorBody = await response.json();
      return errorBody as VerifyPinResponse;
    }

    const data: VerifyPinResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return {
      success: false,
      code: "PIN_NOT_MATCH",
      message: "Unexpected error occurred",
    };
  }
};

export const fetchUserProfile = async (
  username: string,
  accessToken: string
): Promise<Players | null> => {

  if (!accessToken) {
    throw new Error("Access token required to fetch user profile");
  }

  try {
    const response = await fetch(`https://localhost:8443/as/users/profile/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch profile:", response.status);
      return null;
    }

    const data = await response.json();

    return {
      id: data.data.id,
      username: data.data.username,
      photo: data.data.avatarUrl,
    };
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
};

export const fetchProfileMe = async (
  token: string
): Promise<ProfileMeResponse | null> => {
  try {
    const res = await fetch(`https://localhost:8443/as/users/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch /users/profile/me:', res.statusText);
      return null;
    }

    const json = await res.json();
    return json.data as ProfileMeResponse;
  } catch (err) {
    console.error('Error fetching /users/profile/me:', err);
    return null;
  }
};
